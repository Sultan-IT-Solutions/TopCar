import { NextRequest, NextResponse } from 'next/server';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/user-session';
import { trackAnalyticsEvent } from '@/lib/analytics-events-server';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        try {
            const payload = await request.json();
            const eventName = String(payload.eventName ?? '').trim();

            if (!eventName) {
                return NextResponse.json(
                    { message: 'Event name is required.' },
                    { status: 400 },
                );
            }

            const user = await getRequestUser(request);
            const tracked = await trackAnalyticsEvent({
                eventName,
                userId: user?.id ?? null,
                requestId:
                    typeof payload.requestId === 'string'
                        ? payload.requestId
                        : null,
                bookingId:
                    typeof payload.bookingId === 'string'
                        ? payload.bookingId
                        : null,
                carId:
                    Number.isFinite(Number(payload.carId)) &&
                    Number(payload.carId) > 0
                        ? Number(payload.carId)
                        : null,
                promoCodeId:
                    typeof payload.promoCodeId === 'string'
                        ? payload.promoCodeId
                        : null,
                source:
                    typeof payload.source === 'string'
                        ? payload.source
                        : 'website',
                locale:
                    typeof payload.locale === 'string'
                        ? payload.locale
                        : 'ru',
                pagePath:
                    typeof payload.pagePath === 'string'
                        ? payload.pagePath
                        : request.nextUrl.pathname,
                eventValue:
                    Number.isFinite(Number(payload.eventValue))
                        ? Number(payload.eventValue)
                        : null,
                metadata:
                    payload && typeof payload === 'object'
                        ? payload
                        : {},
            });

            return NextResponse.json({
                ok: true,
                id: tracked.id,
            });
        } catch (error) {
            console.error('Track event failed:', error);
            return NextResponse.json(
                { message: 'Не удалось сохранить событие аналитики.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.API_MODERATE,
    'track-event',
);
