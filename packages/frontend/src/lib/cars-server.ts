import 'server-only';

import { getSupabase, hasPublicSupabaseConfig } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ensureCarSlug, isCarAvailable } from '@/lib/car-utils';
import { Car } from '@/types';

type LoadCarsCatalogOptions = {
    featuredOnly?: boolean;
    limit?: number;
    includeUnavailable?: boolean;
};

type LoadCarBySlugResult = {
    car: Car | null;
    configMissing: boolean;
    error: string | null;
};

function makeUniqueSlug(
    baseSlug: string,
    usedSlugs: Set<string>,
    fallbackId: number,
): string {
    const normalizedBase = baseSlug || `car-${fallbackId}`;
    if (!usedSlugs.has(normalizedBase)) {
        usedSlugs.add(normalizedBase);
        return normalizedBase;
    }

    let attempt = 2;
    while (usedSlugs.has(`${normalizedBase}-${attempt}`)) {
        attempt += 1;
    }

    const nextSlug = `${normalizedBase}-${attempt}`;
    usedSlugs.add(nextSlug);
    return nextSlug;
}

async function backfillCarSlugs(cars: Car[]): Promise<Car[]> {
    if (cars.length === 0) {
        return cars;
    }

    const usedSlugs = new Set(
        cars.map((car) => (car.slug || '').trim()).filter(Boolean),
    );
    const missingOrInvalidSlugs = cars.filter(
        (car) => !car.slug?.trim() || car.slug !== ensureCarSlug(car),
    );

    if (missingOrInvalidSlugs.length === 0) {
        return cars;
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const updatedSlugs = new Map<number, string>();

        for (const car of missingOrInvalidSlugs) {
            if (car.slug?.trim()) {
                usedSlugs.delete(car.slug);
            }

            const nextSlug = makeUniqueSlug(ensureCarSlug(car), usedSlugs, car.id);
            const { error } = await supabaseAdmin
                .from('cars')
                .update({ slug: nextSlug })
                .eq('id', car.id);

            if (error) {
                console.error(`Failed to backfill slug for car ${car.id}:`, error);
                continue;
            }

            updatedSlugs.set(car.id, nextSlug);
        }

        return cars.map((car) =>
            updatedSlugs.has(car.id)
                ? { ...car, slug: updatedSlugs.get(car.id)! }
                : { ...car, slug: ensureCarSlug(car) },
        );
    } catch (error) {
        console.error('Failed to backfill car slugs:', error);
        return cars.map((car) => ({ ...car, slug: ensureCarSlug(car) }));
    }
}

export async function loadCarsCatalog(
    options: LoadCarsCatalogOptions = {},
) {
    if (!hasPublicSupabaseConfig()) {
        return {
            cars: [] as Car[],
            configMissing: true,
            error: null as string | null,
        };
    }

    const supabase = getSupabase();
    let query = supabase.from('cars').select('*, prices (*)');

    if (options.featuredOnly) {
        query = query
            .eq('is_featured_home', true)
            .order('featured_order')
            .order('brand')
            .order('name');
    } else {
        query = query.order('brand').order('name');
    }

    if (options.limit && options.limit > 0) {
        query = query.limit(options.limit);
    }

    const response = await query;

    if (response.error) {
        return {
            cars: [] as Car[],
            configMissing: false,
            error: response.error.message,
        };
    }

    let rows = (response.data as Car[]) || [];

    if (options.featuredOnly && rows.length === 0) {
        let fallbackQuery = supabase
            .from('cars')
            .select('*, prices (*)')
            .order('brand')
            .order('name');

        if (options.limit && options.limit > 0) {
            fallbackQuery = fallbackQuery.limit(options.limit);
        }

        const fallbackResponse = await fallbackQuery;

        if (!fallbackResponse.error) {
            rows = (fallbackResponse.data as Car[]) || [];
        }
    }

    const cars = await backfillCarSlugs(rows);
    const visibleCars =
        options.includeUnavailable === true
            ? cars
            : cars.filter(isCarAvailable);
    return {
        cars: visibleCars,
        configMissing: false,
        error: null as string | null,
    };
}

export async function loadCarBySlug(
    slug: string,
): Promise<LoadCarBySlugResult> {
    if (!hasPublicSupabaseConfig()) {
        return {
            car: null,
            configMissing: true,
            error: null,
        };
    }

    const normalizedSlug = slug.trim().toLowerCase();
    const supabase = getSupabase();

    const directResponse = await supabase
        .from('cars')
        .select('*, prices (*)')
        .eq('slug', normalizedSlug)
        .maybeSingle();

    if (directResponse.error) {
        return {
            car: null,
            configMissing: false,
            error: directResponse.error.message,
        };
    }

    if (directResponse.data) {
        const [normalizedCar] = await backfillCarSlugs([
            directResponse.data as Car,
        ]);

        return {
            car: normalizedCar ?? null,
            configMissing: false,
            error: null,
        };
    }

    const fallbackResponse = await supabase
        .from('cars')
        .select('*, prices (*)')
        .order('brand')
        .order('name');

    if (fallbackResponse.error) {
        return {
            car: null,
            configMissing: false,
            error: fallbackResponse.error.message,
        };
    }

    const cars = await backfillCarSlugs((fallbackResponse.data as Car[]) || []);
    const car =
        cars.find((item) => ensureCarSlug(item) === normalizedSlug) ?? null;

    return {
        car,
        configMissing: false,
        error: null,
    };
}
