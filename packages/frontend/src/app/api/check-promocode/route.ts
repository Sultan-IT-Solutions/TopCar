import { NextRequest, NextResponse } from 'next/server';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { validatePromoCode } from '@/lib/promos-server';
import { getRequestUser } from '@/lib/user-session';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        const { code, carId, durationUnit, withDriver, subtotalAmount } =
            await request.json();
        if (!code) {
            return NextResponse.json(
                { message: 'Промокод не предоставлен' },
                { status: 400 },
            );
        }

        try {
            const user = await getRequestUser(request);
            const result = await validatePromoCode({
                code,
                userId: user?.id ?? null,
                carId:
                    Number.isFinite(Number(carId)) && Number(carId) > 0
                        ? Number(carId)
                        : null,
                durationUnit:
                    durationUnit === 'hour' || durationUnit === 'day'
                        ? durationUnit
                        : null,
                withDriver:
                    typeof withDriver === 'boolean' ? withDriver : null,
                subtotalAmount:
                    Number.isFinite(Number(subtotalAmount)) &&
                    Number(subtotalAmount) > 0
                        ? Number(subtotalAmount)
                        : 0,
            });

            if (!result.ok) {
                return NextResponse.json(
                    { message: result.message },
                    { status: 404 },
                );
            }

            return NextResponse.json({
                message: result.message,
                discount: result.promo.discount_value,
                discountType: result.promo.discount_type,
                discountAmount: result.discountAmount,
                finalAmount: result.finalAmount,
                code: result.promo.code,
                promoId: result.promo.id,
            });
        } catch (err: unknown) {
            console.error('Ошибка проверки промокода:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'Внутренняя ошибка сервера';
            return NextResponse.json({ message: errorMessage }, { status: 500 });
        }
    },
    RateLimitPresets.API_MODERATE,
    'check-promocode',
);
