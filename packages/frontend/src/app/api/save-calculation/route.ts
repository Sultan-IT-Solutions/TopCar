// src/app/api/save-calculation/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

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

            const { calculation } = await request.json();

            if (!calculation) {
                return NextResponse.json(
                    { message: 'Нет данных для сохранения' },
                    { status: 400 },
                );
            }

            const { error } = await supabase.from('saved_calculations').insert([
                {
                    user_id: user.id,
                    car_name: calculation.carName,
                    service_type: calculation.serviceType,
                    duration: calculation.duration,
                    price: calculation.price,
                },
            ]);

            if (error) {
                console.error('Supabase insert error:', error);
                throw new Error(error.message);
            }

            return NextResponse.json(
                { message: 'Расчет успешно сохранен!' },
                { status: 200 },
            );
        } catch (err: unknown) {
            console.error('API Error /api/save-calculation:', err);
            return NextResponse.json(
                {
                    message:
                        (err as Error).message || 'Внутренняя ошибка сервера',
                },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'save-calculation',
);
