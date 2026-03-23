import '@testing-library/jest-dom';

import { webcrypto } from 'crypto';
import { TextDecoder, TextEncoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
    // @ts-expect-error test polyfill
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    // @ts-expect-error test polyfill
    global.TextDecoder = TextDecoder;
}

if (typeof global.crypto === 'undefined' || !global.crypto.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        configurable: true,
    });
}

if (typeof global.Request === 'undefined') {
    class HeadersPolyfill {
        private map = new Map<string, string>();

        constructor(init?: HeadersInit) {
            if (!init) return;

            if (Array.isArray(init)) {
                for (const [key, value] of init) {
                    this.set(key, value);
                }
                return;
            }

            if (init instanceof HeadersPolyfill) {
                init.forEach((value, key) => this.set(key, value));
                return;
            }

            for (const [key, value] of Object.entries(init)) {
                this.set(key, value);
            }
        }

        append(key: string, value: string) {
            this.set(key, value);
        }

        set(key: string, value: string) {
            this.map.set(key.toLowerCase(), String(value));
        }

        get(key: string) {
            return this.map.get(key.toLowerCase()) ?? null;
        }

        has(key: string) {
            return this.map.has(key.toLowerCase());
        }

        forEach(
            callback: (value: string, key: string, parent: HeadersPolyfill) => void,
        ) {
            for (const [key, value] of this.map.entries()) {
                callback(value, key, this);
            }
        }
    }

    class RequestPolyfill {
        url: string;
        method: string;
        headers: HeadersPolyfill;

        constructor(input: string, init: RequestInit = {}) {
            this.url = input;
            this.method = init.method ?? 'GET';
            this.headers = new HeadersPolyfill(init.headers);
        }
    }

    class ResponsePolyfill {
        status: number;
        headers: HeadersPolyfill;
        private body: string;

        constructor(body?: BodyInit | null, init: ResponseInit = {}) {
            this.status = init.status ?? 200;
            this.headers = new HeadersPolyfill(init.headers);
            this.body = typeof body === 'string' ? body : body ? String(body) : '';
        }

        static json(data: unknown, init: ResponseInit = {}) {
            const headers = new HeadersPolyfill(init.headers);
            if (!headers.has('content-type')) {
                headers.set('content-type', 'application/json');
            }
            return new ResponsePolyfill(JSON.stringify(data), {
                ...init,
                headers,
            });
        }

        async json() {
            return JSON.parse(this.body || 'null');
        }
    }

    // @ts-expect-error test polyfill
    global.Headers = HeadersPolyfill;
    // @ts-expect-error test polyfill
    global.Request = RequestPolyfill;
    // @ts-expect-error test polyfill
    global.Response = ResponsePolyfill;
}
