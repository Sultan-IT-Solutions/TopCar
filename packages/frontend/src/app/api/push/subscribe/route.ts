import { NextRequest, NextResponse } from 'next/server';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/user-session';
import {
    deactivatePushSubscription,
    upsertPushSubscription,
} from '@/lib/push-server';
import { trackAnalyticsEvent } from '@/lib/analytics-events-server';

function isValidSubscriptionPayload(payload: unknown) {
    if (!payload || typeof payload !== 'object') {
        return false;
    }

    const subscription = payload as {
        endpoint?: unknown;
        keys?: { p256dh?: unknown; auth?: unknown };
    };

    return Boolean(
        typeof subscription.endpoint === 'string' &&
            subscription.endpoint &&
            typeof subscription.keys?.p256dh === 'string' &&
            subscription.keys?.p256dh &&
            typeof subscription.keys?.auth === 'string' &&
            subscription.keys?.auth,
    );
}

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        try {
            const body = await request.json();

            if (!isValidSubscriptionPayload(body.subscription)) {
                return NextResponse.json(
                    { message: 'Некорректные данные push-подписки.' },
                    { status: 400 },
                );
            }

            const user = await getRequestUser(request);
            const subscription = await upsertPushSubscription({
                userId: user?.id ?? null,
                subscription: body.subscription,
                locale:
                    typeof body.locale === 'string' ? body.locale : 'ru',
                userAgent: request.headers.get('user-agent'),
                metadata:
                    body.metadata && typeof body.metadata === 'object'
                        ? body.metadata
                        : {},
            });

            await trackAnalyticsEvent({
                eventName: 'pwa_install',
                userId: user?.id ?? null,
                source: 'pwa',
                locale:
                    typeof body.locale === 'string' ? body.locale : 'ru',
                pagePath:
                    typeof body.pagePath === 'string'
                        ? body.pagePath
                        : request.nextUrl.pathname,
                metadata: {
                    endpoint: subscription.endpoint,
                },
            });

            return NextResponse.json({
                ok: true,
                id: subscription.id,
            });
        } catch (error) {
            console.error('Push subscribe failed:', error);
            return NextResponse.json(
                { message: 'Не удалось сохранить push-подписку.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'push-subscribe',
);

export const DELETE = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        try {
            const body = await request.json();
            const endpoint = String(body.endpoint ?? '').trim();

            if (!endpoint) {
                return NextResponse.json(
                    { message: 'Endpoint is required.' },
                    { status: 400 },
                );
            }

            await deactivatePushSubscription(endpoint);

            return NextResponse.json({ ok: true });
        } catch (error) {
            console.error('Push unsubscribe failed:', error);
            return NextResponse.json(
                { message: 'Не удалось отключить push-подписку.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.API_MODERATE,
    'push-unsubscribe',
);
