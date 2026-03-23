import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type CalculationPayload = {
    carName: string;
    serviceType: string;
    duration: string;
    rentalPeriod: string;
    pricePerDay: number;
    price: number;
    tariffLabel?: string;
    conditions?: string;
};

const { RESEND_API_KEY, TOPCAR_NOTIFICATIONS_EMAIL } = process.env;

function formatCurrency(value: number) {
    return value.toLocaleString('ru-RU');
}

function getResendClient() {
    if (!RESEND_API_KEY) return null;
    return new Resend(RESEND_API_KEY);
}

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        try {
            const body = await request.json();
            const { email, calculation } = body as {
                email?: string;
                calculation?: CalculationPayload;
            };

            if (!email || !calculation) {
                return NextResponse.json(
                    { message: 'Отсутствуют email или данные расчета.' },
                    { status: 400 },
                );
            }

            const resend = getResendClient();
            const internalEmail =
                TOPCAR_NOTIFICATIONS_EMAIL || 'topcar_club@mail.ru';

            const subject = `Ваш расчет аренды ${calculation.carName} — TopCar`;
            const html = `
            <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #111;">
                <h2 style="margin-bottom: 8px;">Ваш расчет аренды TopCar</h2>
                <p style="margin-top: 0; color: #555;">Мы подготовили предварительный расчет по выбранным параметрам.</p>
                <div style="border: 1px solid #e5e5e5; border-radius: 16px; padding: 20px; margin: 20px 0;">
                    <p><strong>Автомобиль:</strong> ${calculation.carName}</p>
                    <p><strong>Формат аренды:</strong> ${calculation.serviceType}</p>
                    <p><strong>Период:</strong> ${calculation.rentalPeriod}</p>
                    <p><strong>Длительность:</strong> ${calculation.duration}</p>
                    <p><strong>Тариф:</strong> ${calculation.tariffLabel || 'Под индивидуальный расчет'}</p>
                    <p><strong>Стоимость в сутки:</strong> ${formatCurrency(calculation.pricePerDay)} ₸</p>
                    <p style="font-size: 18px;"><strong>Итоговая стоимость:</strong> ${formatCurrency(calculation.price)} ₸</p>
                    ${
                        calculation.conditions
                            ? `<p><strong>Условия:</strong> ${calculation.conditions}</p>`
                            : ''
                    }
                </div>
                <p style="color: #555;">Итоговая сумма является предварительной. Менеджер TopCar подтвердит детали и доступность автомобиля отдельно.</p>
            </div>
        `;

            if (!resend) {
                return NextResponse.json({
                    message:
                        'Расчет подготовлен. Для реальной email-отправки подключите RESEND_API_KEY.',
                });
            }

            await resend.emails.send({
                from: 'TopCar Club <webhook@topcar.club>',
                to: [email],
                bcc: [internalEmail],
                subject,
                html,
            });

            return NextResponse.json({
                message: `Расчет успешно отправлен на ${email}`,
            });
        } catch (err: unknown) {
            if (err instanceof SyntaxError) {
                return NextResponse.json(
                    { message: 'Некорректное тело запроса (не JSON).' },
                    { status: 400 },
                );
            }

            console.error('Ошибка на сервере при отправке email:', err);
            return NextResponse.json(
                { message: 'Внутренняя ошибка сервера.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'send-calculation',
);
