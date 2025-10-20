import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type PromoCode } from '@/types';

export async function POST(request: Request) {
    const { code } = await request.json();
    if (!code) {
        return NextResponse.json({ message: 'Промокод не предоставлен' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const { data, error } = await supabase
            .from('public_promocodes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !data) {
            return NextResponse.json({ message: 'Неверный или истекший промокод' }, { status: 404 });
        }

        const promoCode: PromoCode = data;
        
        if (!promoCode.is_active) {
            return NextResponse.json({ message: 'Промокод неактивен' }, { status: 400 });
        }

        const now = new Date();
        const expiryDate = new Date(promoCode.expires_at);
        if (now > expiryDate) {
             return NextResponse.json({ message: 'Срок действия промокода истек' }, { status: 400 });
        }
        
        // В вашей таблице поле называется `times_used`
        if (promoCode.usage_limit !== null && promoCode.times_used >= promoCode.usage_limit) {
            return NextResponse.json({ message: 'Лимит использований промокода исчерпан' }, { status: 400 });
        }

        return NextResponse.json({ 
            message: 'Промокод действителен', 
            // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ: Используем `discount_perc` ---
            discount: promoCode.discount_perc,
            code: promoCode.code
        });

    } catch (err: unknown) { 
        console.error('Ошибка проверки промокода:', err);
        const errorMessage = err instanceof Error ? err.message : 'Внутренняя ошибка сервера';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}