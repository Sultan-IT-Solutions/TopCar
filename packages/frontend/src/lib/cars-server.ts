import 'server-only';

import { getSupabase, hasPublicSupabaseConfig } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ensureCarSlug } from '@/lib/car-utils';
import { Car } from '@/types';

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

export async function loadCarsCatalog() {
    if (!hasPublicSupabaseConfig()) {
        return {
            cars: [] as Car[],
            configMissing: true,
            error: null as string | null,
        };
    }

    const supabase = getSupabase();
    const response = await supabase.from('cars').select('*, prices (*)').order('id');

    if (response.error) {
        return {
            cars: [] as Car[],
            configMissing: false,
            error: response.error.message,
        };
    }

    const cars = await backfillCarSlugs((response.data as Car[]) || []);
    return {
        cars,
        configMissing: false,
        error: null as string | null,
    };
}
