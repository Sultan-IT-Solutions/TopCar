import { NextRequest } from 'next/server';
import {
    ADMIN_SESSION_COOKIE_NAME,
    getAdminCookieOptions,
} from '@/lib/admin-session';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { jsonNoStore } from '@/lib/admin-route';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
    const securityError = ensureProtectedMutationRequest(request);
    if (securityError) {
        return securityError;
    }

    const response = jsonNoStore({ message: 'Сессия администратора завершена.' });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', getAdminCookieOptions(0));
    return response;
}, RateLimitPresets.FORM_SUBMISSION, 'admin-logout');
