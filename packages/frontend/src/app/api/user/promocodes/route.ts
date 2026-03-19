// src/app/api/user/promocodes/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
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

        return NextResponse.json(normalizedPromoCodes);
    } catch (err: unknown) {
        // ИСПРАВЛЕНО
        return NextResponse.json(
            { message: (err as Error).message || 'Внутренняя ошибка сервера' },
            { status: 500 },
        );
    }
}
