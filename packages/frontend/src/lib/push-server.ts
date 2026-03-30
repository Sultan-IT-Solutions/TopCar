import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type StoredPushSubscription = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

export async function upsertPushSubscription(
    input: {
        userId?: string | null;
        subscription: StoredPushSubscription;
        locale?: string;
        userAgent?: string | null;
        metadata?: Record<string, unknown>;
    },
    client?: SupabaseClient,
) {
    const supabase = client ?? getSupabaseAdmin();

    const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert(
            {
                endpoint: input.subscription.endpoint,
                user_id: input.userId ?? null,
                p256dh: input.subscription.keys.p256dh,
                auth: input.subscription.keys.auth,
                locale: input.locale ?? 'ru',
                user_agent: input.userAgent ?? null,
                is_active: true,
                metadata: input.metadata ?? {},
                last_seen_at: new Date().toISOString(),
            },
            { onConflict: 'endpoint' },
        )
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function deactivatePushSubscription(
    endpoint: string,
    client?: SupabaseClient,
) {
    const supabase = client ?? getSupabaseAdmin();
    const { data, error } = await supabase
        .from('push_subscriptions')
        .update({
            is_active: false,
            last_seen_at: new Date().toISOString(),
        })
        .eq('endpoint', endpoint)
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
}
