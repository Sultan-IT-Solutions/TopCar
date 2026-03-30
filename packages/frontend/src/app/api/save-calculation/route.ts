// src/app/api/save-calculation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/user-session';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createRequestRecord } from '@/lib/requests-server';
import { trackAnalyticsEvent } from '@/lib/analytics-events-server';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        const supabase = getSupabaseAdmin();

        try {
            const user = await getRequestUser(request);

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

            const createdRequest = await createRequestRecord({
                requestType: 'calculation',
                source: 'calculator',
                userId: user.id,
                carId:
                    Number.isFinite(Number(calculation.carId)) &&
                    Number(calculation.carId) > 0
                        ? Number(calculation.carId)
                        : null,
                carName: calculation.carName,
                userName:
                    typeof user.user_metadata?.name === 'string'
                        ? user.user_metadata.name
                        : typeof user.user_metadata?.full_name === 'string'
                          ? user.user_metadata.full_name
                          : null,
                userPhone:
                    typeof user.user_metadata?.phone === 'string'
                        ? user.user_metadata.phone
                        : null,
                userEmail: user.email ?? null,
                serviceType: calculation.serviceType,
                withDriver:
                    String(calculation.serviceType).toLowerCase().includes(
                        'водител',
                    ) ||
                    String(calculation.serviceType).toLowerCase().includes(
                        'driver',
                    ),
                durationUnit:
                    calculation.durationUnit === 'hour' ? 'hour' : 'day',
                durationValue:
                    Number.isFinite(Number(calculation.durationValue)) &&
                    Number(calculation.durationValue) > 0
                        ? Number(calculation.durationValue)
                        : null,
                requestedDateFrom: calculation.startDate ?? null,
                requestedDateTo:
                    calculation.durationUnit === 'hour'
                        ? calculation.startDate ?? null
                        : calculation.endDate ?? null,
                subtotalAmount: Number(calculation.price ?? 0),
                finalAmount: Number(calculation.price ?? 0),
                locale:
                    request.headers.get('x-topcar-locale') ||
                    request.nextUrl.searchParams.get('locale') ||
                    'ru',
                metadata: {
                    durationLabel: calculation.duration,
                    rentalPeriod: calculation.rentalPeriod,
                    tariffLabel: calculation.tariffLabel,
                },
            });

            await trackAnalyticsEvent({
                eventName: 'calc_saved',
                userId: user.id,
                requestId: createdRequest.id,
                carId:
                    Number.isFinite(Number(calculation.carId)) &&
                    Number(calculation.carId) > 0
                        ? Number(calculation.carId)
                        : null,
                source: 'calculator',
                locale:
                    request.headers.get('x-topcar-locale') ||
                    request.nextUrl.searchParams.get('locale') ||
                    'ru',
                eventValue: Number(calculation.price ?? 0),
                metadata: {
                    durationUnit: calculation.durationUnit ?? 'day',
                    durationValue: calculation.durationValue ?? null,
                },
            });

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
