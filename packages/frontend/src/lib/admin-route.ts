import { NextRequest, NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE_NAME,
    hasAdminCredentialsConfigured,
    verifyAdminSessionToken,
} from '@/lib/admin-session';

export async function requireAdminRequest(request: NextRequest) {
    if (!hasAdminCredentialsConfigured()) {
        return NextResponse.json(
            { message: 'Админ-доступ не настроен на сервере.' },
            { status: 503 },
        );
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = await verifyAdminSessionToken(token);

    if (!session) {
        return NextResponse.json(
            { message: 'Требуется авторизация администратора.' },
            { status: 401 },
        );
    }

    return session;
}

export function jsonNoStore(data: unknown, init?: ResponseInit) {
    const response = NextResponse.json(data, init);
    response.headers.set(
        'Cache-Control',
        'private, no-store, no-cache, max-age=0, must-revalidate',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    return response;
}
