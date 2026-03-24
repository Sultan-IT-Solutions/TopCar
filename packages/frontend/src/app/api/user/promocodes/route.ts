// src/app/api/user/promocodes/route.ts
import { NextRequest } from 'next/server';
import { jsonNoStore } from '@/lib/admin-route';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/user-session';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const GET = withRateLimit(async (request: NextRequest) => {
    const supabase = getSupabaseAdmin();

    try {
        const user = await getRequestUser(request);

        if (!user) {
            return jsonNoStore(
                { message: 'Пользователь не авторизован' },
                { status: 401 },
            );
        }

        const { data: userPromoCodes, error } = await supabase
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
            .eq('user_id', user.id);

        if (error) throw error;

        const normalizedPromoCodes = (userPromoCodes || [])
            .map((item) => {
                const promo = Array.isArray(item.promocodes)
                    ? item.promocodes[0]
                    : item.promocodes;

                if (!promo?.code) {
                    return null;
                }

                return {
                    id: item.id,
                    is_used: item.is_used,
                    code: promo.code,
                    discount_type: promo.discount_type,
                    discount_value: promo.discount_value,
                    description: promo.description,
                    expiry_date: promo.expiry_date,
                };
            })
            .filter(Boolean);

        return jsonNoStore(normalizedPromoCodes);
    } catch (err: unknown) {
        return jsonNoStore(
            { message: (err as Error).message || 'Внутренняя ошибка сервера' },
            { status: 500 },
        );
    }
}, RateLimitPresets.API_MODERATE, 'user-promocodes');
