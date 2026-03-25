import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import {
    findOverlappingTariff,
    normalizeAdminTariffInput,
    validateAdminTariffInput,
} from '@/lib/admin-prices';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    try {
        const supabase = getSupabaseAdmin();

        const [{ data: cars, error: carsError }, { data: tariffs, error: pricesError }] =
            await Promise.all([
                supabase
                    .from('cars')
                    .select('id, name, brand, class, price, price_per_day')
                    .order('brand')
                    .order('name'),
                supabase
                    .from('prices')
                    .select(
                        'id, car_id, days_from, days_to, price_per_day, with_driver, duration_unit, conditions, created_at, cars(id, name, brand, class)',
                    )
                    .order('car_id')
                    .order('duration_unit')
                    .order('with_driver')
                    .order('days_from'),
            ]);

        if (carsError) {
            throw carsError;
        }

        if (pricesError) {
            throw pricesError;
        }

        return jsonNoStore({
            cars: cars ?? [],
            tariffs:
                tariffs?.map((tariff) => ({
                    ...tariff,
                    car: Array.isArray(tariff.cars)
                        ? tariff.cars[0] ?? null
                        : tariff.cars ?? null,
                })) ?? [],
        });
    } catch (error) {
        console.error('Admin prices GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить тарифы.' },
            { status: 500 },
        );
    }
}

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const admin = await requireAdminRequest(request);

        if (admin instanceof Response) {
            return admin;
        }

        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        try {
            const payload = normalizeAdminTariffInput(await request.json());
            const validationError = validateAdminTariffInput(payload);

            if (validationError) {
                return jsonNoStore(
                    { message: validationError },
                    { status: 400 },
                );
            }

            const supabase = getSupabaseAdmin();
            const overlapping = await findOverlappingTariff(supabase, payload);

            if (overlapping) {
                return jsonNoStore(
                    {
                        message:
                            'Для этого формата аренды уже существует пересекающийся тариф по дням.',
                    },
                    { status: 409 },
                );
            }

            const { data, error } = await supabase
                .from('prices')
                .insert([
                    {
                        car_id: payload.carId,
                        days_from: payload.daysFrom,
                        days_to: payload.daysTo,
                        price_per_day: payload.pricePerDay,
                        with_driver: payload.withDriver,
                        duration_unit: payload.durationUnit,
                        conditions: payload.conditions,
                    },
                ])
                .select(
                    'id, car_id, days_from, days_to, price_per_day, with_driver, duration_unit, conditions, created_at, cars(id, name, brand, class)',
                )
                .single();

            if (error) {
                throw error;
            }

            return jsonNoStore(
                {
                    ...data,
                    car: Array.isArray(data.cars)
                        ? data.cars[0] ?? null
                        : data.cars ?? null,
                },
                { status: 201 },
            );
        } catch (error) {
            console.error('Admin prices POST failed:', error);
            return jsonNoStore(
                { message: 'Не удалось сохранить тариф.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'admin-prices-create',
);
