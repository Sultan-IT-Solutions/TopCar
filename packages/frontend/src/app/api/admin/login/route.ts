import { NextRequest, NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE_NAME,
    createAdminSessionToken,
    getAdminCookieOptions,
    hasAdminCredentialsConfigured,
    validateAdminCredentials,
} from '@/lib/admin-session';
import { jsonNoStore } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
        }

        if (!hasAdminCredentialsConfigured()) {
            return jsonNoStore(
                { message: 'Админ-доступ не настроен на сервере.' },
                { status: 503 },
            );
        }

        try {
            const { username, password } = (await request.json()) as {
                username?: string;
                password?: string;
            };

            if (!username || !password) {
                return jsonNoStore(
                    { message: 'Укажите логин и пароль администратора.' },
                    { status: 400 },
                );
            }

            const isValid = await validateAdminCredentials(username, password);
            if (!isValid) {
                return jsonNoStore(
                    { message: 'Неверный логин или пароль.' },
                    { status: 401 },
                );
            }

            const token = await createAdminSessionToken(username);
            const response = jsonNoStore({ message: 'Вход выполнен.' });

            response.cookies.set(
                ADMIN_SESSION_COOKIE_NAME,
                token,
                getAdminCookieOptions(),
            );

            return response;
        } catch {
            return jsonNoStore(
                { message: 'Не удалось выполнить вход администратора.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.AUTH_STRICT,
    'admin-login',
);
