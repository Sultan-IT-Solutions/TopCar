import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type BookingDetails = {
    serviceType?: string;
    duration?: string;
    price?: number;
    conditions?: string;
};

type LeadRequestPayload = {
    userName?: string;
    userPhone?: string;
    carName?: string;
    message?: string;
    bookingDetails?: BookingDetails;
};

const { BITRIX_WEBHOOK_URL, RESEND_API_KEY, TOPCAR_NOTIFICATIONS_EMAIL } =
    process.env;

function isEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
}

function formatLeadComments(
    bookingDetails: BookingDetails | undefined,
    extraMessage?: string,
) {
    const lines = [
        `Тип услуги: ${bookingDetails?.serviceType || 'Не указано'}`,
        `Период аренды: ${bookingDetails?.duration || 'Не указано'}`,
        `Предварительная стоимость: ${
            bookingDetails?.price
                ? `${bookingDetails.price.toLocaleString('ru-RU')} ₸`
                : 'Не указано'
        }`,
        `Условия: ${bookingDetails?.conditions || 'Без дополнительных условий'}`,
    ];

    if (extraMessage) {
        lines.push(`Сообщение клиента: ${extraMessage}`);
    }

    return lines.join('\n');
}

async function sendLeadToBitrix(payload: {
    userName: string;
    contact: string;
    carName: string;
    comments: string;
}) {
    if (!BITRIX_WEBHOOK_URL) {
        return { ok: false as const, reason: 'missing_config' as const };
    }

    const fields: Record<string, unknown> = {
        TITLE: `Заявка на ${payload.carName} от ${payload.userName}`,
        NAME: payload.userName,
        COMMENTS: payload.comments,
    };

    if (isEmail(payload.contact)) {
        fields.EMAIL = [{ VALUE: payload.contact, VALUE_TYPE: 'WORK' }];
    } else {
        fields.PHONE = [{ VALUE: payload.contact, VALUE_TYPE: 'WORK' }];
    }

    const response = await fetch(`${BITRIX_WEBHOOK_URL}crm.lead.add.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
    });

    const result = await response.json();

    if (result.error) {
        throw new Error(`Ошибка CRM: ${result.error_description}`);
    }

    return {
        ok: true as const,
        leadId: result.result as number | string | undefined,
    };
}

async function sendLeadNotificationEmail(payload: {
    userName: string;
    contact: string;
    carName: string;
    comments: string;
}) {
    if (!RESEND_API_KEY || !TOPCAR_NOTIFICATIONS_EMAIL) {
        return { ok: false as const, reason: 'missing_config' as const };
    }

    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
        from: 'TopCar Club <webhook@topcar.club>',
        to: [TOPCAR_NOTIFICATIONS_EMAIL],
        subject: `Новая заявка TopCar: ${payload.userName}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
                <h2>Новая заявка с сайта TopCar</h2>
                <p><strong>Клиент:</strong> ${payload.userName}</p>
                <p><strong>Контакт:</strong> ${payload.contact}</p>
                <p><strong>Источник/автомобиль:</strong> ${payload.carName}</p>
                <pre style="white-space: pre-wrap; background: #f7f7f7; padding: 16px; border-radius: 12px;">${payload.comments}</pre>
            </div>
        `,
    });

    return { ok: true as const };
}

export const POST = withRateLimit(
    async (req: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(req);
        if (securityError) {
            return securityError;
        }

        try {
            const { userName, userPhone, carName, bookingDetails, message } =
                (await req.json()) as LeadRequestPayload;

            if (!userName || !userPhone || !carName) {
                return NextResponse.json(
                    { message: 'Missing required fields' },
                    { status: 400 },
                );
            }

            const comments = formatLeadComments(bookingDetails, message);
            const deliveredTo: string[] = [];
            let bitrixLeadId: number | string | undefined;

            try {
                const bitrixResult = await sendLeadToBitrix({
                    userName,
                    contact: userPhone,
                    carName,
                    comments,
                });

                if (bitrixResult.ok) {
                    deliveredTo.push('bitrix');
                    bitrixLeadId = bitrixResult.leadId;
                }
            } catch (error) {
                console.error('Ошибка Bitrix24:', error);
            }

            try {
                const emailResult = await sendLeadNotificationEmail({
                    userName,
                    contact: userPhone,
                    carName,
                    comments,
                });

                if (emailResult.ok) {
                    deliveredTo.push('email');
                }
            } catch (error) {
                console.error('Ошибка email-уведомления:', error);
            }

            if (deliveredTo.length === 0) {
                if (process.env.NODE_ENV !== 'production') {
                    console.info('Lead accepted in local mode:', {
                        userName,
                        userPhone,
                        carName,
                        comments,
                    });

                    return NextResponse.json({
                        message:
                            'Заявка принята в локальном режиме. Для реальной доставки подключите BITRIX_WEBHOOK_URL или RESEND_API_KEY с TOPCAR_NOTIFICATIONS_EMAIL.',
                        accepted: true,
                        deliveredTo: ['local-dev-log'],
                    });
                }

                return NextResponse.json(
                    {
                        message:
                            'Не настроен канал приема заявок. Подключите CRM или email-уведомления.',
                    },
                    { status: 500 },
                );
            }

            return NextResponse.json(
                {
                    message: 'Заявка успешно принята.',
                    deliveredTo,
                    leadId: bitrixLeadId,
                },
                { status: 200 },
            );
        } catch (error) {
            if (error instanceof SyntaxError) {
                return NextResponse.json(
                    { message: 'Некорректное тело запроса (не JSON).' },
                    { status: 400 },
                );
            }

            console.error('Ошибка при обработке запроса:', error);
            return NextResponse.json(
                { message: 'Внутренняя ошибка сервера' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'create-lead',
);
