// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const { name, email, phone, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // Проверяем, существует ли пользователь
        // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (userError) throw userError;

        if (users && users.length > 0) {
            return NextResponse.json({ message: 'Пользователь с таким email уже существует' }, { status: 409 });
        }
        
        // Регистрируем нового пользователя
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                },
            },
        });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        if (data.user) {
            return NextResponse.json({
                message: 'Регистрация прошла успешно. Пожалуйста, подтвердите ваш email.',
                user: data.user,
            });
        }
        
        return NextResponse.json({ message: 'Произошла неизвестная ошибка' }, { status: 500 });

    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 500 });
    }
}