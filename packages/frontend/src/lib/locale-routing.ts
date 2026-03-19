import type { Locale } from '@/lib/i18n';

const localePrefixes = ['ru', 'en', 'kk'] as const;

export function getLocaleFromPath(pathname: string): Locale {
    if (pathname === '/en' || pathname.startsWith('/en/')) {
        return 'en';
    }

    if (pathname === '/kk' || pathname.startsWith('/kk/')) {
        return 'kk';
    }

    return 'ru';
}

export function stripLocalePrefix(pathname: string) {
    for (const locale of localePrefixes) {
        if (pathname === `/${locale}`) {
            return '/';
        }

        if (pathname.startsWith(`/${locale}/`)) {
            return pathname.slice(locale.length + 1) || '/';
        }
    }

    return pathname || '/';
}

export function localizeHref(href: string, locale: Locale) {
    if (!href.startsWith('/')) {
        return href;
    }

    const [pathPart, hashPart] = href.split('#');
    const normalizedPath = stripLocalePrefix(pathPart || '/');
    const localizedPath =
        locale === 'ru'
            ? normalizedPath
            : `${`/${locale}`}${normalizedPath === '/' ? '' : normalizedPath}`;

    return hashPart ? `${localizedPath}#${hashPart}` : localizedPath;
}
