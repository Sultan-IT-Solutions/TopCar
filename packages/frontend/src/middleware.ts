import { NextRequest, NextResponse } from 'next/server';
import {
    ADMIN_SESSION_COOKIE_NAME,
    verifyAdminSessionToken,
} from '@/lib/admin-session';
import { ensureCsrfCookie } from '@/lib/csrf';

const locales = ['ru', 'en', 'kk'] as const;

/**
 * Security Headers для защиты приложения
 */
function addSecurityHeaders(
    response: NextResponse,
    request: NextRequest,
): NextResponse {
    const headers = response.headers;
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost =
        request.nextUrl.hostname === 'localhost' ||
        request.nextUrl.hostname === '127.0.0.1';
    const scriptDirectives = [
        "'self'",
        "'unsafe-inline'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
    ];

    if (!isProduction) {
        scriptDirectives.push("'unsafe-eval'");
    }

    // Content Security Policy (CSP)
    // Защита от XSS и других инъекций
    headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            `script-src ${scriptDirectives.join(' ')}`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://www.google-analytics.com https://*.supabase.co",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; '),
    );

    // HTTP Strict Transport Security (HSTS)
    // Заставляет браузер использовать только HTTPS
    if (isProduction) {
        headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload',
        );
    }

    // X-Frame-Options
    // Защита от clickjacking
    headers.set('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    // Предотвращает MIME-sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    // Дополнительная защита от XSS (legacy для старых браузеров)
    headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    // Контролирует информацию referrer
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy (ранее Feature-Policy)
    // Контроль доступа к браузерным API
    headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()',
    );
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    headers.set('Origin-Agent-Cluster', '?1');

    // X-DNS-Prefetch-Control
    // Контроль DNS prefetching
    headers.set('X-DNS-Prefetch-Control', 'on');

    if (!isProduction && isLocalhost) {
        headers.set('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        headers.set('Clear-Site-Data', '"cache", "storage"');
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
        headers.set(
            'Cache-Control',
            'private, no-store, no-cache, max-age=0, must-revalidate',
        );
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
        headers.set('Vary', 'Cookie');
    }

    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Пропускаем статические файлы и API роуты
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') ||
        pathname.startsWith('/logo') ||
        pathname.startsWith('/manifest') ||
        pathname.startsWith('/robots') ||
        pathname.startsWith('/sitemap') ||
        pathname.startsWith('/google') ||
        pathname.startsWith('/yandex')
    ) {
        const response = NextResponse.next();
        return addSecurityHeaders(response, request);
    }

    if (pathname.startsWith('/admin')) {
        const isAdminLoginPage = pathname === '/admin/login';
        const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
        const adminSession = await verifyAdminSessionToken(token);

        if (!adminSession && !isAdminLoginPage) {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('next', pathname);
            const response = NextResponse.redirect(loginUrl);
            return ensureCsrfCookie(request, addSecurityHeaders(response, request));
        }

        if (adminSession && isAdminLoginPage) {
            const response = NextResponse.redirect(new URL('/admin', request.url));
            return ensureCsrfCookie(request, addSecurityHeaders(response, request));
        }
    }

    // Проверяем, есть ли локаль в URL
    const pathnameHasLocale = locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (pathnameHasLocale) {
        const response = NextResponse.next();
        return ensureCsrfCookie(request, addSecurityHeaders(response, request));
    }

    // Если локали нет, редиректим на дефолтную (русскую) без префикса
    // Это означает, что / = русский, /en/ = английский, /kk/ = казахский
    if (pathname === '/') {
        const response = NextResponse.next();
        return ensureCsrfCookie(request, addSecurityHeaders(response, request));
    }

    // Для всех остальных путей без локали добавляем дефолтную
    const response = NextResponse.next();
    return ensureCsrfCookie(request, addSecurityHeaders(response, request));
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logo|manifest|robots|sitemap|google|yandex).*)',
    ],
};
