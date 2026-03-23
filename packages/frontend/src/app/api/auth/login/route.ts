// src/app/api/auth/login/route.ts
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

        const { email, password } = await request.json();
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 401 },
                );
            }

            const { user } = data;

            return NextResponse.json({
                message: 'Вход выполнен успешно',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata.name,
                    phone: user.user_metadata.phone,
                },
            });
        } catch (err: unknown) {
            return NextResponse.json(
                { message: (err as Error).message },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.AUTH_STRICT,
    'user-login',
);
