import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';
import {
    findOverlappingTariff,
    normalizeAdminTariffInput,
    validateAdminTariffInput,
} from '@/lib/admin-prices';

export const runtime = 'nodejs';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-prices-update',
    );

    if (limit.isLimited) {
        return jsonNoStore(
            {
                message:
                    RateLimitPresets.FORM_SUBMISSION.message ||
                    'Too many requests',
            },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil(
                        (limit.resetAt - Date.now()) / 1000,
                    ).toString(),
                },
            },
        );
    }

    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    const securityError = ensureProtectedMutationRequest(request);
    if (securityError) {
        return securityError;
    }

    const { id } = await context.params;
    const tariffId = Number(id);

    if (!Number.isFinite(tariffId)) {
        return jsonNoStore(
            { message: 'Некорректный идентификатор тарифа.' },
            { status: 400 },
        );
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
        const overlapping = await findOverlappingTariff(
            supabase,
            payload,
            tariffId,
        );

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
            .update({
                car_id: payload.carId,
                days_from: payload.daysFrom,
                days_to: payload.daysTo,
                price_per_day: payload.pricePerDay,
                with_driver: payload.withDriver,
                conditions: payload.conditions,
            })
            .eq('id', tariffId)
            .select(
                'id, car_id, days_from, days_to, price_per_day, with_driver, conditions, created_at, cars(id, name, brand, class)',
            )
            .single();

        if (error) {
            throw error;
        }

        const response = jsonNoStore({
            ...data,
            car: Array.isArray(data.cars)
                ? data.cars[0] ?? null
                : data.cars ?? null,
        });
        addRateLimitHeaders(response.headers, {
            remaining: limit.remaining,
            resetAt: limit.resetAt,
        });
        return response;
    } catch (error) {
        console.error('Admin prices PATCH failed:', error);
        return jsonNoStore(
            { message: 'Не удалось обновить тариф.' },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-prices-delete',
    );

    if (limit.isLimited) {
        return jsonNoStore(
            {
                message:
                    RateLimitPresets.FORM_SUBMISSION.message ||
                    'Too many requests',
            },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil(
                        (limit.resetAt - Date.now()) / 1000,
                    ).toString(),
                },
            },
        );
    }

    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    const securityError = ensureProtectedMutationRequest(request);
    if (securityError) {
        return securityError;
    }

    const { id } = await context.params;
    const tariffId = Number(id);

    if (!Number.isFinite(tariffId)) {
        return jsonNoStore(
            { message: 'Некорректный идентификатор тарифа.' },
            { status: 400 },
        );
    }

    try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('prices').delete().eq('id', tariffId);

        if (error) {
            throw error;
        }

        const response = jsonNoStore({ success: true });
        addRateLimitHeaders(response.headers, {
            remaining: limit.remaining,
            resetAt: limit.resetAt,
        });
        return response;
    } catch (error) {
        console.error('Admin prices DELETE failed:', error);
        return jsonNoStore(
            { message: 'Не удалось удалить тариф.' },
            { status: 500 },
        );
    }
}
