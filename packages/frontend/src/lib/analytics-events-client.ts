'use client';

import { AnalyticsEventName } from '@/types';
import { csrfClientHelper } from '@/lib/csrf-client';

function pushToDataLayer(
    eventName: AnalyticsEventName | string,
    payload?: Record<string, unknown>,
) {
    if (typeof window === 'undefined') {
        return;
    }

    const target = window as unknown as {
        dataLayer?: Array<Record<string, unknown>>;
    };

    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push({
        event: eventName,
        ...payload,
    });
}

export async function trackClientEvent(
    eventName: AnalyticsEventName | string,
    payload?: Record<string, unknown>,
) {
    pushToDataLayer(eventName, payload);

    if (typeof window === 'undefined') {
        return;
    }

    try {
        await fetch('/api/track', {
            method: 'POST',
            headers: csrfClientHelper.addTokenToHeaders({
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify({
                eventName,
                ...payload,
                pagePath:
                    typeof payload?.pagePath === 'string'
                        ? payload.pagePath
                        : window.location.pathname,
            }),
            keepalive: true,
        });
    } catch (error) {
        console.error('Client analytics tracking failed:', error);
    }
}
