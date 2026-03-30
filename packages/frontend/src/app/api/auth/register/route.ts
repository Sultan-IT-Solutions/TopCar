import { NextRequest, NextResponse } from 'next/server';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { trackAnalyticsEvent } from '@/lib/analytics-events-server';

function normalizePhone(value: unknown) {
    const normalized = String(value ?? '')
        .replace(/[^\d+]/g, '')
        .trim();
    return normalized || null;
}

function getAuthErrorMessage(message: string) {
    const normalized = message.toLowerCase();

    if (
        normalized.includes('already') ||
        normalized.includes('registered') ||
        normalized.includes('duplicate')
    ) {
        return 'Пользователь с таким email уже зарегистрирован.';
    }

    if (normalized.includes('password')) {
        return 'Пароль не соответствует требованиям безопасности.';
    }

    return message;
}

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        const { name, email, phone, password } = await request.json();
        const normalizedName = String(name ?? '').trim();
        const normalizedEmail = String(email ?? '')
            .trim()
            .toLowerCase();
        const normalizedPhone = normalizePhone(phone);
        const normalizedPassword = String(password ?? '');

        try {
            if (
                !normalizedName ||
                !normalizedEmail ||
                !normalizedPassword ||
                normalizedPassword.length < 8
            ) {
                return NextResponse.json(
                    {
                        message:
                            'Укажите имя, корректный email и пароль длиной не менее 8 символов.',
                    },
                    { status: 400 },
                );
            }

            const supabase = getSupabaseAdmin();
            const { data, error } = await supabase.auth.admin.createUser({
                email: normalizedEmail,
                password: normalizedPassword,
                email_confirm: true,
                user_metadata: {
                    name: normalizedName,
                    full_name: normalizedName,
                    phone: normalizedPhone,
                },
            });

            if (error) {
                const normalizedMessage = String(error.message).toLowerCase();
                const status =
                    normalizedMessage.includes('already') ||
                    normalizedMessage.includes('registered') ||
                    normalizedMessage.includes('duplicate')
                        ? 409
                        : 400;

                return NextResponse.json(
                    { message: getAuthErrorMessage(error.message) },
                    { status },
                );
            }

            if (data.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert(
                        {
                            id: data.user.id,
                            email: normalizedEmail,
                            full_name: normalizedName,
                            phone: normalizedPhone,
                        },
                        { onConflict: 'id' },
                    );

                if (profileError) {
                    await supabase.auth.admin.deleteUser(data.user.id);

                    return NextResponse.json(
                        {
                            message:
                                'Не удалось сохранить профиль пользователя в базе данных. Регистрация отменена.',
                        },
                        { status: 500 },
                    );
                }

                await trackAnalyticsEvent({
                    eventName: 'registration',
                    userId: data.user.id,
                    source: 'auth',
                    locale:
                        request.headers.get('x-topcar-locale') ||
                        request.nextUrl.searchParams.get('locale') ||
                        'ru',
                    metadata: {
                        email: normalizedEmail,
                    },
                });

                return NextResponse.json({
                    message: 'Регистрация прошла успешно.',
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                    },
                });
            }

            return NextResponse.json(
                { message: 'Произошла неизвестная ошибка' },
                { status: 500 },
            );
        } catch (err: unknown) {
            return NextResponse.json(
                { message: (err as Error).message },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'user-register',
);
