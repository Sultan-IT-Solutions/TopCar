import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const { RESEND_API_KEY, RESEND_FROM_EMAIL, TOPCAR_NOTIFICATIONS_EMAIL } =
    process.env;
const { AMO_WEBHOOK_SECRET } = process.env;

function getResendClient() {
    if (!RESEND_API_KEY) return null;
    return new Resend(RESEND_API_KEY);
}

function getResendFromEmail() {
    if (RESEND_FROM_EMAIL) {
        return RESEND_FROM_EMAIL;
    }

    return process.env.NODE_ENV === 'production'
        ? null
        : 'TopCar Club <onboarding@resend.dev>';
}

function isAuthorizedWebhookRequest(request: NextRequest) {
    if (!AMO_WEBHOOK_SECRET) {
        return true;
    }

    const querySecret = request.nextUrl.searchParams.get('secret');
    const headerSecret = request.headers.get('x-webhook-secret');

    return (
        querySecret === AMO_WEBHOOK_SECRET || headerSecret === AMO_WEBHOOK_SECRET
    );
}

export const POST = withRateLimit(async (req: NextRequest) => {
    try {
        if (!isAuthorizedWebhookRequest(req)) {
            return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
        }

        const contentType = req.headers.get('content-type') || '';
        let payload: Record<string, unknown>;

        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await req.text();
            payload = Object.fromEntries(new URLSearchParams(text));
        } else {
            throw new Error(contentType);
        }

        const event = payload.event || payload.type || 'unknown';
        const leadName =
            payload.lead_name || payload.name || 'Неизвестная заявка';
        const contactPhone = payload.phone || payload.contact_phone || '—';

        const resend = getResendClient();
        const fromEmail = getResendFromEmail();

        if (resend && fromEmail && TOPCAR_NOTIFICATIONS_EMAIL) {
            await resend.emails.send({
                from: fromEmail,
                to: TOPCAR_NOTIFICATIONS_EMAIL,
                subject: `Новый вебхук из amoCRM: ${event}`,
                html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Событие amoCRM: ${event}</h2>
            <p><strong>Название лида:</strong> ${leadName}</p>
            <p><strong>Телефон:</strong> ${contactPhone}</p>
            <pre style="background:#222;color:#ddd;padding:10px;border-radius:6px;">${JSON.stringify(payload, null, 2)}</pre>
          </div>
        `,
            });
        }

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        console.error('❌ Ошибка при обработке вебхука:', err);
        return NextResponse.json(
            {
                ok: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}, RateLimitPresets.WEBHOOK, 'amo-webhook');

export async function GET() {
    return NextResponse.json({ message: 'AmoCRM webhook endpoint active' });
}
