import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf-constants';
import { securityLogger } from './security-logger';

const TOKEN_LENGTH = 32;
const CSRF_MAX_AGE = 60 * 60 * 12;

function getCsrfCookieOptions() {
    return {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: CSRF_MAX_AGE,
        path: '/',
    };
}

export function generateCsrfToken(): string {
    const bytes = new Uint8Array(TOKEN_LENGTH);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
        '',
    );
}

export function setCsrfToken(
    response: NextResponse,
    token = generateCsrfToken(),
): NextResponse {
    response.cookies.set(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
    return response;
}

export function ensureCsrfCookie(
    request: NextRequest,
    response: NextResponse,
): NextResponse {
    const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

    if (!existingToken) {
        return setCsrfToken(response);
    }

    response.cookies.set(CSRF_COOKIE_NAME, existingToken, getCsrfCookieOptions());
    return response;
}

export function getCsrfTokenFromCookie(
    request: NextRequest,
): string | undefined {
    return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}

export function getCsrfTokenFromHeader(
    request: NextRequest,
): string | undefined {
    return request.headers.get(CSRF_HEADER_NAME) ?? undefined;
}

export function validateCsrfToken(request: NextRequest): boolean {
    const cookieToken = getCsrfTokenFromCookie(request);
    const headerToken = getCsrfTokenFromHeader(request);

    if (!cookieToken || !headerToken) {
        return false;
    }

    return timingSafeEqual(cookieToken, headerToken);
}

export function csrfProtection(request: NextRequest): NextResponse | null {
    const method = request.method.toUpperCase();
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return null;
    }

    const pathname = request.nextUrl.pathname;
    const skipPaths = ['/api/amo-webhook', '/api/webhook'];

    if (skipPaths.some((path) => pathname.startsWith(path))) {
        return null;
    }

    if (!validateCsrfToken(request)) {
        securityLogger.logCsrfInvalid(pathname, {
            method,
            ip: request.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json(
            { message: 'Invalid CSRF token' },
            { status: 403 },
        );
    }

    return null;
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}
