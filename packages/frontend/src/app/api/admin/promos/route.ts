import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

function normalizePromoPayload(payload: Record<string, unknown>) {
    return {
        code: String(payload.code ?? '')
            .trim()
            .toUpperCase(),
        title: String(payload.title ?? '').trim() || null,
        description: String(payload.description ?? '').trim() || null,
        scope: payload.scope === 'personal' ? 'personal' : 'public',
        discountType: payload.discountType === 'amount' ? 'amount' : 'percent',
        discountValue: Number(payload.discountValue ?? 0),
        isActive: payload.isActive !== false,
        startsAt:
            typeof payload.startsAt === 'string' && payload.startsAt
                ? payload.startsAt
                : null,
        expiresAt:
            typeof payload.expiresAt === 'string' && payload.expiresAt
                ? payload.expiresAt
                : null,
        usageLimit:
            Number.isFinite(Number(payload.usageLimit)) &&
            Number(payload.usageLimit) >= 0
                ? Number(payload.usageLimit)
                : null,
        perUserLimit:
            Number.isFinite(Number(payload.perUserLimit)) &&
            Number(payload.perUserLimit) >= 0
                ? Number(payload.perUserLimit)
                : null,
        assignedUserId:
            typeof payload.assignedUserId === 'string' && payload.assignedUserId
                ? payload.assignedUserId
                : null,
        carId:
            Number.isFinite(Number(payload.carId)) && Number(payload.carId) > 0
                ? Number(payload.carId)
                : null,
        applicableDurationUnit:
            payload.applicableDurationUnit === 'hour' ||
            payload.applicableDurationUnit === 'day'
                ? payload.applicableDurationUnit
                : null,
        withDriver:
            typeof payload.withDriver === 'boolean'
                ? payload.withDriver
                : null,
    };
}

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);
    if (admin instanceof Response) {
        return admin;
    }

    try {
        const supabase = getSupabaseAdmin();
        const [{ data: promos, error: promosError }, { data: cars, error: carsError }, { data: users, error: usersError }, { data: redemptions, error: redemptionsError }] =
            await Promise.all([
                supabase
                    .from('promo_codes')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('cars')
                    .select('id, name, brand')
                    .order('brand')
                    .order('name'),
                supabase
                    .from('users')
                    .select('id, email, full_name')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('promo_redemptions')
                    .select('promo_code_id, discount_amount, final_amount'),
            ]);

        if (promosError) throw promosError;
        if (carsError) throw carsError;
        if (usersError) throw usersError;
        if (redemptionsError) throw redemptionsError;

        const statsByPromoId = new Map<
            string,
            { usageCount: number; discountTotal: number; revenueTotal: number }
        >();

        for (const redemption of redemptions ?? []) {
            const current = statsByPromoId.get(redemption.promo_code_id) ?? {
                usageCount: 0,
                discountTotal: 0,
                revenueTotal: 0,
            };

            current.usageCount += 1;
            current.discountTotal += Number(redemption.discount_amount ?? 0);
            current.revenueTotal += Number(redemption.final_amount ?? 0);
            statsByPromoId.set(redemption.promo_code_id, current);
        }

        return jsonNoStore({
            promos:
                (promos ?? []).map((promo) => ({
                    ...promo,
                    stats: statsByPromoId.get(promo.id) ?? {
                        usageCount: 0,
                        discountTotal: 0,
                        revenueTotal: 0,
                    },
                })) ?? [],
            cars: cars ?? [],
            users: users ?? [],
        });
    } catch (error) {
        console.error('Admin promos GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить промокоды.' },
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
            const payload = normalizePromoPayload(await request.json());

            if (!payload.code || payload.discountValue <= 0) {
                return jsonNoStore(
                    {
                        message:
                            'Укажите код промокода и корректное значение скидки.',
                    },
                    { status: 400 },
                );
            }

            const supabase = getSupabaseAdmin();
            const { data, error } = await supabase
                .from('promo_codes')
                .insert([
                    {
                        code: payload.code,
                        title: payload.title,
                        description: payload.description,
                        scope: payload.scope,
                        discount_type: payload.discountType,
                        discount_value: payload.discountValue,
                        is_active: payload.isActive,
                        starts_at: payload.startsAt,
                        expires_at: payload.expiresAt,
                        usage_limit: payload.usageLimit,
                        per_user_limit: payload.perUserLimit,
                        assigned_user_id: payload.assignedUserId,
                        car_id: payload.carId,
                        applicable_duration_unit: payload.applicableDurationUnit,
                        with_driver: payload.withDriver,
                    },
                ])
                .select('*')
                .single();

            if (error) {
                throw error;
            }

            return jsonNoStore(data, { status: 201 });
        } catch (error) {
            console.error('Admin promos POST failed:', error);
            return jsonNoStore(
                { message: 'Не удалось сохранить промокод.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'admin-promos-create',
);
