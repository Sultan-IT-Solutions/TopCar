import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/user-session';
import { DurationUnit } from '@/types';
import {
    createBookingForRequest,
    createRequestRecord,
} from '@/lib/requests-server';
import {
    recordPromoRedemption,
    validatePromoCode,
} from '@/lib/promos-server';
import { trackAnalyticsEvent } from '@/lib/analytics-events-server';

export const runtime = 'nodejs';

type BookingDetails = {
    serviceType?: string;
    duration?: string;
    price?: number;
    conditions?: string;
    carId?: number;
    tariffId?: number;
    dateFrom?: string;
    dateTo?: string;
    startDate?: string;
    endDate?: string;
    startsAt?: string;
    endsAt?: string;
    durationUnit?: DurationUnit;
    durationValue?: number;
};

type LeadRequestPayload = {
    userName?: string;
    userPhone?: string;
    userEmail?: string;
    carName?: string;
    message?: string;
    bookingDetails?: BookingDetails;
    promoCode?: string;
    source?: string;
    locale?: string;
    pagePath?: string;
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

function normalizePhone(value?: string) {
    const digits = String(value ?? '')
        .replace(/[^\d+]/g, '')
        .trim();
    return digits || null;
}

function normalizeEmail(value?: string | null) {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase();
    return normalized && isEmail(normalized) ? normalized : null;
}

function isValidDateString(value?: string | null) {
    if (!value) {
        return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function isValidDateTimeString(value?: string | null) {
    if (!value) {
        return false;
    }

    return !Number.isNaN(new Date(value).getTime());
}

function inferWithDriver(serviceType?: string) {
    const normalized = String(serviceType ?? '').toLowerCase();
    return (
        normalized.includes('водител') ||
        normalized.includes('driver') ||
        normalized.includes('жүргізуш')
    );
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
            bookingDetails.startsAt ||
            bookingDetails.endsAt ||
            bookingDetails.carId ||
            Number(bookingDetails.price || 0) > 0,
    );
}

function getNormalizedBookingDates(bookingDetails?: BookingDetails) {
    const dateFrom = bookingDetails?.dateFrom || bookingDetails?.startDate;
    const dateTo = bookingDetails?.dateTo || bookingDetails?.endDate || dateFrom;

    return {
        dateFrom,
        dateTo,
    };
}

function getNormalizedBookingWindow(bookingDetails?: BookingDetails) {
    const durationUnit: DurationUnit =
        bookingDetails?.durationUnit === 'hour' ? 'hour' : 'day';
    const { dateFrom, dateTo } = getNormalizedBookingDates(bookingDetails);
    const startsAt = bookingDetails?.startsAt ?? null;
    const endsAt = bookingDetails?.endsAt ?? null;

    return {
        durationUnit,
        durationValue:
            Number.isFinite(Number(bookingDetails?.durationValue)) &&
            Number(bookingDetails?.durationValue) > 0
                ? Number(bookingDetails?.durationValue)
                : null,
        dateFrom,
        dateTo,
        startsAt: isValidDateTimeString(startsAt) ? startsAt : null,
        endsAt: isValidDateTimeString(endsAt) ? endsAt : null,
    };
}

function formatLeadComments(
    bookingDetails: BookingDetails | undefined,
    extraMessage?: string,
    promoCode?: string | null,
    discountAmount?: number,
    finalAmount?: number,
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

    if (promoCode) {
        lines.push(`Промокод: ${promoCode}`);
    }

    if (discountAmount && discountAmount > 0) {
        lines.push(
            `Скидка: ${discountAmount.toLocaleString('ru-RU')} ₸`,
        );
    }

    if (finalAmount && finalAmount > 0) {
        lines.push(
            `Итоговая сумма: ${finalAmount.toLocaleString('ru-RU')} ₸`,
        );
    }

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
            const {
                userName,
                userPhone,
                userEmail,
                carName,
                bookingDetails,
                message,
                promoCode,
                source,
                locale,
                pagePath,
            } = (await req.json()) as LeadRequestPayload;
            const requestUser = await getRequestUser(req);

            if (!userName || !carName || (!userPhone && !userEmail)) {
                return NextResponse.json(
                    { message: 'Missing required fields' },
                    { status: 400 },
                );
            }

            const normalizedPhone = normalizePhone(userPhone);
            const normalizedEmail =
                normalizeEmail(userEmail) ||
                (isEmail(String(userPhone ?? '').trim())
                    ? normalizeEmail(userPhone)
                    : requestUser?.email ?? null);
            const contact = normalizedEmail || normalizedPhone;

            if (!contact) {
                return NextResponse.json(
                    { message: 'Укажите корректный телефон или email.' },
                    { status: 400 },
                );
            }

            const expectsBookingRecord = isBookingIntent(bookingDetails);
            const normalizedBooking = getNormalizedBookingWindow(bookingDetails);
            const withDriver = inferWithDriver(bookingDetails?.serviceType);

            if (
                expectsBookingRecord &&
                (!isValidDateString(normalizedBooking.dateFrom) ||
                    !isValidDateString(normalizedBooking.dateTo))
            ) {
                return NextResponse.json(
                    {
                        message:
                            'Для сохранения бронирования требуется корректно указать даты начала и возврата.',
                    },
                    { status: 400 },
                );
            }

            const subtotalAmount = Number(bookingDetails?.price || 0);
            const promoValidation =
                promoCode && subtotalAmount > 0
                    ? await validatePromoCode({
                          code: promoCode,
                          userId: requestUser?.id ?? null,
                          carId:
                              Number.isFinite(Number(bookingDetails?.carId)) &&
                              Number(bookingDetails?.carId) > 0
                                  ? Number(bookingDetails?.carId)
                                  : null,
                          durationUnit: normalizedBooking.durationUnit,
                          withDriver,
                          subtotalAmount,
                      })
                    : null;

            if (promoValidation && !promoValidation.ok) {
                return NextResponse.json(
                    { message: promoValidation.message },
                    { status: 400 },
                );
            }

            const discountAmount = promoValidation?.ok
                ? promoValidation.discountAmount
                : 0;
            const finalAmount = promoValidation?.ok
                ? promoValidation.finalAmount
                : subtotalAmount;

            const createdRequest = await createRequestRecord({
                requestType: expectsBookingRecord ? 'booking' : 'contact',
                source: source || 'website',
                userId: requestUser?.id ?? null,
                carId:
                    Number.isFinite(Number(bookingDetails?.carId)) &&
                    Number(bookingDetails?.carId) > 0
                        ? Number(bookingDetails?.carId)
                        : null,
                tariffId:
                    Number.isFinite(Number(bookingDetails?.tariffId)) &&
                    Number(bookingDetails?.tariffId) > 0
                        ? Number(bookingDetails?.tariffId)
                        : null,
                carName,
                userName,
                userPhone: normalizedPhone,
                userEmail: normalizedEmail,
                message: message || bookingDetails?.conditions || null,
                serviceType: bookingDetails?.serviceType ?? null,
                withDriver,
                durationUnit: normalizedBooking.durationUnit,
                durationValue: normalizedBooking.durationValue,
                requestedDateFrom: normalizedBooking.dateFrom ?? null,
                requestedDateTo: normalizedBooking.dateTo ?? null,
                startsAt: normalizedBooking.startsAt,
                endsAt: normalizedBooking.endsAt,
                subtotalAmount,
                discountAmount,
                finalAmount,
                promoCode: promoValidation?.ok ? promoValidation.promo.code : null,
                promoCodeId: promoValidation?.ok
                    ? promoValidation.promo.id
                    : null,
                locale: locale || 'ru',
                metadata: {
                    pagePath: pagePath || req.nextUrl.pathname,
                    bookingDetails: bookingDetails ?? {},
                },
            });

            let bookingSaved = false;
            let bookingId: string | null = null;

            if (expectsBookingRecord && normalizedBooking.dateFrom && normalizedBooking.dateTo) {
                const booking = await createBookingForRequest({
                    requestId: createdRequest.id,
                    promoCodeId: promoValidation?.ok ? promoValidation.promo.id : null,
                    promoCode: promoValidation?.ok ? promoValidation.promo.code : null,
                    discountAmount,
                    finalAmount,
                    carId:
                        Number.isFinite(Number(bookingDetails?.carId)) &&
                        Number(bookingDetails?.carId) > 0
                            ? Number(bookingDetails?.carId)
                            : null,
                    userId: requestUser?.id ?? null,
                    carName,
                    userName,
                    userPhone: normalizedPhone ?? contact,
                    dateFrom: normalizedBooking.dateFrom,
                    dateTo: normalizedBooking.dateTo,
                    startsAt: normalizedBooking.startsAt,
                    endsAt: normalizedBooking.endsAt,
                    durationUnit: normalizedBooking.durationUnit,
                    durationValue: normalizedBooking.durationValue,
                    totalPrice: subtotalAmount,
                    status: 'pending',
                });

                bookingSaved = true;
                bookingId = booking.id as string;
            }

            if (
                promoValidation?.ok &&
                /^[0-9a-f-]{36}$/i.test(promoValidation.promo.id)
            ) {
                await recordPromoRedemption({
                    promoCodeId: promoValidation.promo.id,
                    userId: requestUser?.id ?? null,
                    requestId: createdRequest.id,
                    bookingId,
                    redeemedCode: promoValidation.promo.code,
                    discountAmount,
                    finalAmount,
                    metadata: {
                        source: source || 'website',
                    },
                });
            }

            const comments = formatLeadComments(
                bookingDetails,
                message,
                promoValidation?.ok ? promoValidation.promo.code : null,
                discountAmount,
                finalAmount,
            );
            const deliveredTo: string[] = [];
            let bitrixLeadId: number | string | undefined;

            try {
                const bitrixResult = await sendLeadToBitrix({
                    userName,
                    contact,
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
                    contact,
                    carName,
                    comments,
                });

                if (emailResult.ok) {
                    deliveredTo.push('email');
                }
            } catch (error) {
                console.error('Ошибка email-уведомления:', error);
            }

            await trackAnalyticsEvent({
                eventName: expectsBookingRecord
                    ? 'booking_created'
                    : 'contact_form_submit',
                userId: requestUser?.id ?? null,
                requestId: createdRequest.id,
                bookingId,
                carId:
                    Number.isFinite(Number(bookingDetails?.carId)) &&
                    Number(bookingDetails?.carId) > 0
                        ? Number(bookingDetails?.carId)
                        : null,
                promoCodeId: promoValidation?.ok ? promoValidation.promo.id : null,
                source: source || 'website',
                locale: locale || 'ru',
                pagePath: pagePath || req.nextUrl.pathname,
                eventValue: finalAmount || subtotalAmount || null,
                metadata: {
                    deliveredTo,
                    withDriver,
                    durationUnit: normalizedBooking.durationUnit,
                    durationValue: normalizedBooking.durationValue,
                    subtotalAmount,
                    discountAmount,
                    finalAmount,
                },
            });

            if (promoValidation?.ok) {
                await trackAnalyticsEvent({
                    eventName: 'promo_applied',
                    userId: requestUser?.id ?? null,
                    requestId: createdRequest.id,
                    bookingId,
                    carId:
                        Number.isFinite(Number(bookingDetails?.carId)) &&
                        Number(bookingDetails?.carId) > 0
                            ? Number(bookingDetails?.carId)
                            : null,
                    promoCodeId: promoValidation.promo.id,
                    source: source || 'website',
                    locale: locale || 'ru',
                    pagePath: pagePath || req.nextUrl.pathname,
                    eventValue: discountAmount,
                    metadata: {
                        code: promoValidation.promo.code,
                    },
                });
            }

            if (deliveredTo.length === 0) {
                if (process.env.NODE_ENV !== 'production') {
                    console.info('Lead accepted in local mode:', {
                        requestId: createdRequest.id,
                        userName,
                        contact,
                        carName,
                        comments,
                    });

                    return NextResponse.json({
                        message:
                            'Заявка принята в локальном режиме. Для реальной доставки подключите BITRIX_WEBHOOK_URL или RESEND_API_KEY с TOPCAR_NOTIFICATIONS_EMAIL.',
                        accepted: true,
                        requestId: createdRequest.id,
                        deliveredTo: ['local-dev-log'],
                        bookingSaved,
                        bookingId,
                        discountAmount,
                        finalAmount,
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
                    requestId: createdRequest.id,
                    deliveredTo,
                    leadId: bitrixLeadId,
                    bookingSaved,
                    bookingId,
                    discountAmount,
                    finalAmount,
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
