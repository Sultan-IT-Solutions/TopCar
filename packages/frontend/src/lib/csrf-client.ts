import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf-constants';

function mergeHeaders(
    headers: HeadersInit = {},
    csrfToken: string,
): HeadersInit {
    if (headers instanceof Headers) {
        const nextHeaders = new Headers(headers);
        nextHeaders.set(CSRF_HEADER_NAME, csrfToken);
        return nextHeaders;
    }

    if (Array.isArray(headers)) {
        return [...headers, [CSRF_HEADER_NAME, csrfToken]];
    }

    return {
        ...headers,
        [CSRF_HEADER_NAME]: csrfToken,
    };
}

export const csrfClientHelper = {
    getToken(): string | null {
        if (typeof document === 'undefined') {
            return null;
        }

        const escapedCookieName = CSRF_COOKIE_NAME.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
        );
        const match = document.cookie.match(
            new RegExp(`(?:^|; )${escapedCookieName}=([^;]+)`),
        );
        return match ? decodeURIComponent(match[1]) : null;
    },

    addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
        const token = csrfClientHelper.getToken();

        if (!token) {
            return headers;
        }

        return mergeHeaders(headers, token);
    },

    async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = csrfClientHelper.addTokenToHeaders(options.headers);
        return fetch(url, {
            ...options,
            credentials: options.credentials ?? 'same-origin',
            headers,
        });
    },
};

export function useCsrfToken() {
    return {
        token: csrfClientHelper.getToken(),
        fetch: csrfClientHelper.fetch.bind(csrfClientHelper),
        addTokenToHeaders:
            csrfClientHelper.addTokenToHeaders.bind(csrfClientHelper),
    };
}
