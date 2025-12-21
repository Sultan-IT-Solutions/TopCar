import { NextRequest, NextResponse } from 'next/server';

const locales = ['ru', 'en', 'kk'] as const;

/**
 * Security Headers для защиты приложения
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
    const headers = response.headers;

    // Content Security Policy (CSP)
    // Защита от XSS и других инъекций
    headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://www.google-analytics.com https://*.supabase.co",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; '),
    );

    // HTTP Strict Transport Security (HSTS)
    // Заставляет браузер использовать только HTTPS
    if (process.env.NODE_ENV === 'production') {
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

    // X-DNS-Prefetch-Control
    // Контроль DNS prefetching
    headers.set('X-DNS-Prefetch-Control', 'on');

    return response;
}

export function middleware(request: NextRequest) {
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
        return addSecurityHeaders(response);
    }

    // Проверяем, есть ли локаль в URL
    const pathnameHasLocale = locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (pathnameHasLocale) {
        const response = NextResponse.next();
        return addSecurityHeaders(response);
    }

    // Если локали нет, редиректим на дефолтную (русскую) без префикса
    // Это означает, что / = русский, /en/ = английский, /kk/ = казахский
    if (pathname === '/') {
        const response = NextResponse.next();
        return addSecurityHeaders(response);
    }

    // Для всех остальных путей без локали добавляем дефолтную
    const response = NextResponse.next();
    return addSecurityHeaders(response);
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
