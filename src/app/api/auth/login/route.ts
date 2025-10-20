// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }

        // Удалена неиспользуемая переменная
        const { user } = data;

        return NextResponse.json({ 
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata.name,
                phone: user.user_metadata.phone,
            }
        });

    } catch (err: unknown) { // ИСПРАВЛЕНО
        return NextResponse.json({ message: (err as Error).message }, { status: 500 });
    }
}