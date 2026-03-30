// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { trackAnalyticsEvent } from '@/lib/analytics-events-server';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        const { email, password } = await request.json();
        const normalizedEmail = String(email ?? '')
            .trim()
            .toLowerCase();
        const normalizedPassword = String(password ?? '');
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: normalizedPassword,
            });

            if (error) {
                return NextResponse.json(
                    { message: 'Неверный email или пароль.' },
                    { status: 401 },
                );
            }

            const { user } = data;

            await trackAnalyticsEvent({
                eventName: 'login',
                userId: user.id,
                source: 'auth',
                locale:
                    request.headers.get('x-topcar-locale') ||
                    request.nextUrl.searchParams.get('locale') ||
                    'ru',
                metadata: {
                    email: user.email ?? normalizedEmail,
                },
            });

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
                { message: (err as Error).message || 'Внутренняя ошибка сервера.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.AUTH_STRICT,
    'user-login',
);
