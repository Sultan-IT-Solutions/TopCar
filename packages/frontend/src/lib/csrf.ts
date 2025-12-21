// src/lib/csrf.ts
import { NextRequest, NextResponse } from 'next/server';
import { securityLogger } from './security-logger';

/**
 * CSRF Protection
 * Защита от Cross-Site Request Forgery атак
 * Генерирует и проверяет CSRF токены для POST/PUT/DELETE запросов
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Генерирует случайный CSRF токен
 */
function generateCsrfToken(): string {
    const array = new Uint8Array(TOKEN_LENGTH);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
    } else {
        // Fallback для Node.js
        const nodeCrypto = require('crypto');
        nodeCrypto.randomFillSync(array);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
        '',
    );
}

/**
 * Устанавливает CSRF токен в cookie
 */
export function setCsrfToken(response: NextResponse): NextResponse {
    const token = generateCsrfToken();

    response.cookies.set(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 часа
        path: '/',
    });

    return response;
}

/**
 * Получает CSRF токен из запроса (cookie)
 */
export function getCsrfTokenFromCookie(
    request: NextRequest,
): string | undefined {
    return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Получает CSRF токен из заголовка
 */
export function getCsrfTokenFromHeader(
    request: NextRequest,
): string | undefined {
    return request.headers.get(CSRF_HEADER_NAME) || undefined;
}

/**
 * Проверяет валидность CSRF токена
 */
export function validateCsrfToken(request: NextRequest): boolean {
    const cookieToken = getCsrfTokenFromCookie(request);
    const headerToken = getCsrfTokenFromHeader(request);

    // Если токены отсутствуют
    if (!cookieToken || !headerToken) {
        return false;
    }

    // Сравниваем токены (timing-safe comparison)
    return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Middleware для проверки CSRF токена
 * Применяется для POST, PUT, DELETE, PATCH запросов
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
    const method = request.method.toUpperCase();

    // Проверяем только модифицирующие методы
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return null; // Пропускаем GET, HEAD, OPTIONS
    }

    // Пропускаем некоторые эндпоинты (например, webhook)
    const pathname = request.nextUrl.pathname;
    const skipPaths = ['/api/amo-webhook', '/api/webhook'];

    if (skipPaths.some((path) => pathname.startsWith(path))) {
        return null;
    }

    // Проверяем токен
    if (!validateCsrfToken(request)) {
        securityLogger.logCsrfInvalid(pathname, {
            method,
            ip: request.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 },
        );
    }

    return null; // Токен валиден, продолжаем
}

/**
 * Генерирует новый CSRF токен для клиента
 * Использовать в API route для получения токена
 */
export async function generateCsrfTokenForClient(): Promise<{ token: string }> {
    const token = generateCsrfToken();
    return { token };
}

/**
 * Timing-safe сравнение строк (защита от timing attacks)
 */
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

/**
 * Helper для добавления CSRF токена в форму (клиентская сторона)
 */
export const csrfClientHelper = {
    /**
     * Получает CSRF токен из cookie
     */
    getToken(): string | null {
        if (typeof document === 'undefined') return null;

        const match = document.cookie.match(
            new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`),
        );
        return match ? match[2] : null;
    },

    /**
     * Добавляет CSRF токен в headers для fetch
     */
    addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
        const token = this.getToken();
        if (!token) return headers;

        return {
            ...headers,
            [CSRF_HEADER_NAME]: token,
        };
    },

    /**
     * Создает fetch с автоматическим добавлением CSRF токена
     */
    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = this.addTokenToHeaders(options.headers);
        return fetch(url, { ...options, headers });
    },
};

/**
 * React Hook для использования CSRF токена
 */
export function useCsrfToken() {
    if (typeof window === 'undefined') {
        return { token: null, fetch: fetch.bind(window) };
    }

    return {
        token: csrfClientHelper.getToken(),
        fetch: csrfClientHelper.fetch.bind(csrfClientHelper),
        addTokenToHeaders:
            csrfClientHelper.addTokenToHeaders.bind(csrfClientHelper),
    };
}
