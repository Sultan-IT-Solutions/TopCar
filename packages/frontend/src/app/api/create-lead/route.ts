import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRequestUser } from '@/lib/user-session';
import { DurationUnit } from '@/types';

export const runtime = 'nodejs';

type BookingDetails = {
    serviceType?: string;
    duration?: string;
    price?: number;
    conditions?: string;
    carId?: number;
    dateFrom?: string;
    dateTo?: string;
    startDate?: string;
    endDate?: string;
    durationUnit?: DurationUnit;
    durationValue?: number;
};

type LeadRequestPayload = {
    userName?: string;
    userPhone?: string;
    carName?: string;
    message?: string;
    bookingDetails?: BookingDetails;
};

const {
    BITRIX_WEBHOOK_URL,
    RESEND_API_KEY,
    RESEND_FROM_EMAIL,
    TOPCAR_NOTIFICATIONS_EMAIL,
} = process.env;

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

function isValidDateString(value?: string) {
    if (!value) {
        return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function isBookingIntent(bookingDetails?: BookingDetails) {
    if (!bookingDetails) {
        return false;
    }

    return Boolean(
        bookingDetails.dateFrom ||
            bookingDetails.dateTo ||
            bookingDetails.startDate ||
            bookingDetails.endDate ||
            bookingDetails.carId ||
            Number(bookingDetails.price || 0) > 0,
    );
}

function getNormalizedBookingDates(bookingDetails?: BookingDetails) {
    return {
        dateFrom: bookingDetails?.dateFrom || bookingDetails?.startDate,
        dateTo: bookingDetails?.dateTo || bookingDetails?.endDate,
    };
}

async function saveBookingRecord(payload: {
    userId?: string | null;
    userName: string;
    userPhone: string;
    carName: string;
    bookingDetails?: BookingDetails;
}) {
    const booking = payload.bookingDetails;
    const { dateFrom, dateTo } = getNormalizedBookingDates(booking);
    const normalizedDurationUnit =
        booking?.durationUnit === 'hour' ? 'hour' : 'day';
    const normalizedDurationValue =
        Number.isFinite(Number(booking?.durationValue)) &&
        Number(booking?.durationValue) > 0
            ? Number(booking?.durationValue)
            : null;

    if (!booking || !isValidDateString(dateFrom) || !isValidDateString(dateTo)) {
        return {
            saved: false as const,
            reason: 'missing_dates' as const,
            message: 'Для сохранения бронирования требуется корректно указать даты начала и возврата.',
        };
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('bookings').insert([
        {
            car_id:
                Number.isFinite(Number(booking.carId)) && Number(booking.carId) > 0
                    ? Number(booking.carId)
                    : null,
            user_id: payload.userId || null,
            car_name: payload.carName,
            user_name: payload.userName,
            user_phone: payload.userPhone,
            date_from: dateFrom,
            date_to: dateTo,
            duration_unit: normalizedDurationUnit,
            duration_value: normalizedDurationValue,
            total_price: Number(booking.price || 0),
            status: 'pending',
        },
    ]);

    if (error) {
        throw error;
    }

    return { saved: true as const, message: null };
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

    const fromEmail =
        RESEND_FROM_EMAIL ||
        (process.env.NODE_ENV === 'production'
            ? null
            : 'TopCar Club <onboarding@resend.dev>');

    if (!fromEmail) {
        throw new Error(
            'Email-уведомления не настроены: укажите RESEND_FROM_EMAIL с подтвержденным адресом отправителя.',
        );
    }

    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
        from: fromEmail,
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
            const requestUser = await getRequestUser(req);

            if (!userName || !userPhone || !carName) {
                return NextResponse.json(
                    { message: 'Missing required fields' },
                    { status: 400 },
                );
            }

            const comments = formatLeadComments(bookingDetails, message);
            const deliveredTo: string[] = [];
            let bitrixLeadId: number | string | undefined;
            let bookingSaved = false;
            let bookingSaveMessage: string | null = null;
            const expectsBookingRecord = isBookingIntent(bookingDetails);

            if (expectsBookingRecord) {
                try {
                    const bookingResult = await saveBookingRecord({
                        userId: requestUser?.id ?? null,
                        userName,
                        userPhone,
                        carName,
                        bookingDetails,
                    });

                    if (bookingResult.saved) {
                        bookingSaved = true;
                    } else {
                        bookingSaveMessage = bookingResult.message;
                    }
                } catch (error) {
                    console.error('Ошибка сохранения бронирования в базе:', error);
                    bookingSaveMessage =
                        error instanceof Error
                            ? error.message
                            : 'Не удалось сохранить бронирование в базе данных.';
                }
            }

            if (expectsBookingRecord && !bookingSaved) {
                return NextResponse.json(
                    {
                        message:
                            bookingSaveMessage ||
                            'Не удалось сохранить бронирование в базе данных.',
                        bookingSaved: false,
                    },
                    { status: 500 },
                );
            }

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
                        bookingSaved,
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
                    bookingSaved,
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
