import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { DiscountType, DurationUnit, PromoCode } from '@/types';

export type PromoValidationContext = {
    code: string;
    userId?: string | null;
    carId?: number | null;
    durationUnit?: DurationUnit | null;
    withDriver?: boolean | null;
    subtotalAmount?: number | null;
};

export type PromoValidationResult =
    | {
          ok: true;
          promo: PromoCode;
          discountAmount: number;
          finalAmount: number;
          message: string;
      }
    | {
          ok: false;
          message: string;
      };

type UserPromoListItem = {
    id: string;
    is_used: boolean;
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    description: string | null;
    expiry_date: string | null;
    title?: string | null;
};

function normalizeCode(code: string) {
    return code.trim().toUpperCase();
}

function isPromoActiveNow(promo: PromoCode, now = new Date()) {
    if (!promo.is_active) {
        return false;
    }

    if (promo.starts_at && now < new Date(promo.starts_at)) {
        return false;
    }

    if (promo.expires_at && now > new Date(promo.expires_at)) {
        return false;
    }

    return true;
}

function applyDiscount(
    subtotalAmount: number,
    discountType: DiscountType,
    discountValue: number,
) {
    if (!Number.isFinite(subtotalAmount) || subtotalAmount <= 0) {
        return 0;
    }

    if (discountType === 'amount') {
        return Math.min(subtotalAmount, discountValue);
    }

    return Math.min(
        subtotalAmount,
        Math.round((subtotalAmount * discountValue) / 100),
    );
}

async function countPromoRedemptions(
    supabase: SupabaseClient,
    promoId: string,
    userId?: string | null,
) {
    let query = supabase
        .from('promo_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('promo_code_id', promoId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { count, error } = await query;

    if (error) {
        throw error;
    }

    return count ?? 0;
}

function isCanonicalPromoId(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    );
}

async function loadCanonicalPromo(
    supabase: SupabaseClient,
    code: string,
) {
    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', normalizeCode(code))
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data as PromoCode | null) ?? null;
}

async function loadLegacyPublicPromo(
    supabase: SupabaseClient,
    code: string,
) {
    const { data, error } = await supabase
        .from('public_promocodes')
        .select('*')
        .eq('code', normalizeCode(code))
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    return {
        id: `legacy-public-${data.id}`,
        code: data.code,
        title: data.code,
        description: null,
        scope: data.is_personal ? 'personal' : 'public',
        discount_type: 'percent',
        discount_value: Number(data.discount_perc),
        is_active: Boolean(data.is_active),
        starts_at: null,
        expires_at: data.expires_at,
        usage_limit: data.usage_limit,
        per_user_limit: 1,
        assigned_user_id: data.user_id,
        car_id: null,
        applicable_duration_unit: null,
        with_driver: null,
        legacy_source: 'public_promocodes',
        legacy_id: data.id,
        metadata: {
            legacy_times_used: data.times_used ?? 0,
        },
        created_at: data.created_at ?? new Date().toISOString(),
    } as PromoCode;
}

async function loadLegacyAssignedPromos(
    supabase: SupabaseClient,
    userId: string,
): Promise<UserPromoListItem[]> {
    const { data, error } = await supabase
        .from('user_promo_codes')
        .select(
            `
            id,
            is_used,
            promocodes (
                code,
                discount_type,
                discount_value,
                description,
                expiry_date
            )
        `,
        )
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    return (data ?? [])
        .map((item) => {
            const promo = Array.isArray(item.promocodes)
                ? item.promocodes[0]
                : item.promocodes;

            if (!promo?.code) {
                return null;
            }

            return {
                id: `legacy-${item.id}`,
                is_used: Boolean(item.is_used),
                code: promo.code,
                discount_type: promo.discount_type as DiscountType,
                discount_value: Number(promo.discount_value),
                description: promo.description,
                expiry_date: promo.expiry_date,
                title: promo.code,
            } satisfies UserPromoListItem;
        })
        .filter(Boolean) as UserPromoListItem[];
}

function matchesContext(promo: PromoCode, context: PromoValidationContext) {
    if (promo.scope === 'personal') {
        if (!context.userId || promo.assigned_user_id !== context.userId) {
            return false;
        }
    }

    if (promo.car_id && context.carId && promo.car_id !== context.carId) {
        return false;
    }

    if (
        promo.applicable_duration_unit &&
        context.durationUnit &&
        promo.applicable_duration_unit !== context.durationUnit
    ) {
        return false;
    }

    if (
        typeof promo.with_driver === 'boolean' &&
        typeof context.withDriver === 'boolean' &&
        promo.with_driver !== context.withDriver
    ) {
        return false;
    }

    return true;
}

export async function validatePromoCode(
    context: PromoValidationContext,
    client?: SupabaseClient,
): Promise<PromoValidationResult> {
    const normalizedCode = normalizeCode(context.code || '');

    if (!normalizedCode) {
        return {
            ok: false,
            message: 'Промокод не указан.',
        };
    }

    const supabase = client ?? getSupabaseAdmin();
    const promo =
        (await loadCanonicalPromo(supabase, normalizedCode)) ??
        (await loadLegacyPublicPromo(supabase, normalizedCode));

    if (!promo) {
        return {
            ok: false,
            message: 'Неверный или истекший промокод.',
        };
    }

    if (!isPromoActiveNow(promo)) {
        return {
            ok: false,
            message: 'Промокод неактивен или срок его действия истек.',
        };
    }

    if (!matchesContext(promo, context)) {
        return {
            ok: false,
            message: 'Промокод не подходит для выбранного автомобиля или формата аренды.',
        };
    }

    if (promo.usage_limit !== null && promo.usage_limit !== undefined) {
        const totalUsageCount = isCanonicalPromoId(promo.id)
            ? await countPromoRedemptions(supabase, promo.id)
            : Number(promo.metadata?.legacy_times_used ?? 0);
        if (totalUsageCount >= promo.usage_limit) {
            return {
                ok: false,
                message: 'Лимит использований промокода исчерпан.',
            };
        }
    }

    if (
        context.userId &&
        promo.per_user_limit !== null &&
        promo.per_user_limit !== undefined &&
        isCanonicalPromoId(promo.id)
    ) {
        const userUsageCount = await countPromoRedemptions(
            supabase,
            promo.id,
            context.userId,
        );
        if (userUsageCount >= promo.per_user_limit) {
            return {
                ok: false,
                message: 'Этот промокод уже был использован максимальное количество раз для вашего аккаунта.',
            };
        }
    }

    const subtotalAmount = Number(context.subtotalAmount ?? 0);
    const discountAmount = applyDiscount(
        subtotalAmount,
        promo.discount_type,
        Number(promo.discount_value),
    );

    return {
        ok: true,
        promo,
        discountAmount,
        finalAmount: Math.max(0, subtotalAmount - discountAmount),
        message: 'Промокод действителен.',
    };
}

export async function listUserPromoCodes(
    userId: string,
    client?: SupabaseClient,
): Promise<UserPromoListItem[]> {
    const supabase = client ?? getSupabaseAdmin();

    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('scope', 'personal')
        .eq('assigned_user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    if ((data ?? []).length === 0) {
        return loadLegacyAssignedPromos(supabase, userId);
    }

    const promoIds = (data ?? []).map((promo) => promo.id);
    const { data: redemptions, error: redemptionsError } = await supabase
        .from('promo_redemptions')
        .select('promo_code_id')
        .eq('user_id', userId)
        .in('promo_code_id', promoIds);

    if (redemptionsError) {
        throw redemptionsError;
    }

    const usedIds = new Set((redemptions ?? []).map((item) => item.promo_code_id));

    return (data ?? []).map((promo) => ({
        id: promo.id,
        is_used: usedIds.has(promo.id),
        code: promo.code,
        discount_type: promo.discount_type as DiscountType,
        discount_value: Number(promo.discount_value),
        description: promo.description,
        expiry_date: promo.expires_at,
        title: promo.title,
    }));
}

export async function recordPromoRedemption(
    input: {
        promoCodeId: string;
        userId?: string | null;
        requestId?: string | null;
        bookingId?: string | null;
        redeemedCode: string;
        discountAmount?: number;
        finalAmount?: number;
        metadata?: Record<string, unknown>;
    },
    client?: SupabaseClient,
) {
    const supabase = client ?? getSupabaseAdmin();

    const { data, error } = await supabase
        .from('promo_redemptions')
        .insert([
            {
                promo_code_id: input.promoCodeId,
                user_id: input.userId ?? null,
                request_id: input.requestId ?? null,
                booking_id: input.bookingId ?? null,
                redeemed_code: normalizeCode(input.redeemedCode),
                discount_amount: input.discountAmount ?? 0,
                final_amount: input.finalAmount ?? 0,
                metadata: input.metadata ?? {},
            },
        ])
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
}
