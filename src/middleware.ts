import { NextRequest, NextResponse } from 'next/server';

const locales = ['ru', 'en', 'kk'] as const;

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
    return NextResponse.next();
  }

  // Проверяем, есть ли локаль в URL
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Если локали нет, редиректим на дефолтную (русскую) без префикса
  // Это означает, что / = русский, /en/ = английский, /kk/ = казахский
  if (pathname === '/') {
    return NextResponse.next(); // Главная остается без префикса (русский)
  }

  // Для всех остальных путей без локали добавляем дефолтную
  return NextResponse.next();
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