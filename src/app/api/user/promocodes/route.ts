// src/app/api/user/promocodes/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ message: 'Пользователь не авторизован' }, { status: 401 });
        }

        const { data: userPromoCodes, error } = await supabase
            .from('user_promo_codes')
            .select(`
                id,
                is_used,
                promocodes (
                    code,
                    discount_type,
                    discount_value,
                    description,
                    expiry_date
                )
            `)
            .eq('user_id', user.id);
        
        if (error) throw error;

        return NextResponse.json(userPromoCodes);

    } catch (err: unknown) { // ИСПРАВЛЕНО
        return NextResponse.json({ message: (err as Error).message || 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}