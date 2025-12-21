import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const { RESEND_API_KEY } = process.env;

function getResendClient() {
    if (!RESEND_API_KEY) return null;
    return new Resend(RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let payload: any;

        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await req.text();
            payload = Object.fromEntries(new URLSearchParams(text));
        } else {
            throw new Error(`${contentType}`);
        }

        console.log('✅ Вебхук получен от amoCRM:', payload);

        const event = payload.event || payload.type || 'unknown';
        const leadName =
            payload.lead_name || payload.name || 'Неизвестная заявка';
        const contactPhone = payload.phone || payload.contact_phone || '—';

        const resend = getResendClient();
        if (resend) {
            await resend.emails.send({
                from: 'Вебхук TopCar <webhook@topcar.club>',
                to: 'topcar_club@mail.ru',
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
    } catch (err: any) {
        console.error('❌ Ошибка при обработке вебхука:', err);
        return NextResponse.json(
            { ok: false, error: err.message },
            { status: 500 },
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: 'AmoCRM webhook endpoint active' });
}
