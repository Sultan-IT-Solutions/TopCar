import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';
import { AnalyticsEvent, AnalyticsEventName } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type TrackAnalyticsInput = {
    eventName: AnalyticsEventName | string;
    userId?: string | null;
    requestId?: string | null;
    bookingId?: string | null;
    carId?: number | null;
    promoCodeId?: string | null;
    source?: string;
    locale?: string;
    pagePath?: string | null;
    eventValue?: number | null;
    metadata?: Record<string, unknown>;
};

export async function trackAnalyticsEvent(
    input: TrackAnalyticsInput,
    client?: SupabaseClient,
) {
    const supabase = client ?? getSupabaseAdmin();

    const payload = {
        event_name: input.eventName,
        user_id: input.userId ?? null,
        request_id: input.requestId ?? null,
        booking_id: input.bookingId ?? null,
        car_id: input.carId ?? null,
        promo_code_id: input.promoCodeId ?? null,
        source: input.source ?? 'website',
        locale: input.locale ?? 'ru',
        page_path: input.pagePath ?? null,
        event_value: input.eventValue ?? null,
        metadata: input.metadata ?? {},
    };

    const { data, error } = await supabase
        .from('analytics_events')
        .insert([payload])
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data as AnalyticsEvent;
}

export function getDateRangeBounds(
    range: 'today' | '7d' | '30d' | '90d' | 'custom',
    from?: string | null,
    to?: string | null,
) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            return { from: start.toISOString(), to: end.toISOString() };
        case '7d':
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return { from: start.toISOString(), to: end.toISOString() };
        case '30d':
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            return { from: start.toISOString(), to: end.toISOString() };
        case '90d':
            start.setDate(start.getDate() - 89);
            start.setHours(0, 0, 0, 0);
            return { from: start.toISOString(), to: end.toISOString() };
        case 'custom':
            return {
                from: from ? new Date(from).toISOString() : null,
                to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : null,
            };
        default:
            return { from: null, to: null };
    }
}
