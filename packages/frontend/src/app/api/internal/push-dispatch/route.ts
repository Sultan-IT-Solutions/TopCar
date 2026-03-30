import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const secret = process.env.PUSH_DISPATCH_SECRET;

    if (!secret) {
        return NextResponse.json(
            { message: 'PUSH_DISPATCH_SECRET is not configured.' },
            { status: 503 },
        );
    }

    if (request.headers.get('x-push-dispatch-secret') !== secret) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 },
        );
    }

    const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
    const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
    const subject =
        process.env.WEB_PUSH_VAPID_SUBJECT || 'mailto:topcar_club@mail.ru';

    if (!publicKey || !privateKey) {
        return NextResponse.json(
            {
                message:
                    'Web Push VAPID keys are not configured. Set NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY and WEB_PUSH_VAPID_PRIVATE_KEY.',
            },
            { status: 503 },
        );
    }

    try {
        const body = await request.json();
        const supabase = getSupabaseAdmin();
        webpush.setVapidDetails(subject, publicKey, privateKey);

        let query = supabase
            .from('push_subscriptions')
            .select('id, endpoint, p256dh, auth, user_id')
            .eq('is_active', true);

        if (typeof body.userId === 'string' && body.userId.trim()) {
            query = query.eq('user_id', body.userId);
        }

        const { data: subscriptions, error } = await query;

        if (error) {
            throw error;
        }

        const payload = JSON.stringify({
            title: body.title || 'TopCar',
            body:
                body.body ||
                'У вас появилось новое уведомление от TopCar.',
            url: body.url || '/',
            tag: body.tag || 'topcar-notification',
        });

        let sent = 0;
        let failed = 0;

        for (const item of subscriptions ?? []) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: item.endpoint,
                        keys: {
                            p256dh: item.p256dh,
                            auth: item.auth,
                        },
                    },
                    payload,
                );
                sent += 1;
            } catch (error) {
                failed += 1;
                console.error(
                    `Push dispatch failed for subscription ${item.id}:`,
                    error,
                );
            }
        }

        return NextResponse.json({
            ok: true,
            sent,
            failed,
            total: subscriptions?.length ?? 0,
        });
    } catch (error) {
        console.error('Push dispatch route failed:', error);
        return NextResponse.json(
            { message: 'Не удалось выполнить push-рассылку.' },
            { status: 500 },
        );
    }
}
