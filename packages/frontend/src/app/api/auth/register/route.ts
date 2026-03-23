// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        const { name, email, phone, password } = await request.json();
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        try {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('email')
                .eq('email', email);

            if (userError) throw userError;

            if (users && users.length > 0) {
                return NextResponse.json(
                    { message: 'Пользователь с таким email уже существует' },
                    { status: 409 },
                );
            }

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
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 },
                );
            }

            if (data.user) {
                return NextResponse.json({
                    message:
                        'Регистрация прошла успешно. Пожалуйста, подтвердите ваш email.',
                    user: data.user,
                });
            }

            return NextResponse.json(
                { message: 'Произошла неизвестная ошибка' },
                { status: 500 },
            );
        } catch (err: unknown) {
            return NextResponse.json(
                { message: (err as Error).message },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'user-register',
);
