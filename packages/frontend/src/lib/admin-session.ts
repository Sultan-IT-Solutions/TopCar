const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const ADMIN_SESSION_COOKIE_NAME = 'topcar_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

type AdminSessionPayload = {
    u: string;
    iat: number;
    exp: number;
};

function getAdminSessionSecret() {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
        throw new Error('ADMIN_SESSION_SECRET is not configured');
    }

    return secret;
}

function normalizeBase64Url(input: string) {
    const padding = (4 - (input.length % 4)) % 4;
    return input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padding);
}

function toBase64Url(bytes: Uint8Array) {
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(input: string) {
    const normalized = normalizeBase64Url(input);
    const binary = atob(normalized);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importSigningKey(secret: string) {
    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    );
}

async function signValue(value: string, secret: string) {
    const key = await importSigningKey(secret);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
    return toBase64Url(new Uint8Array(signature));
}

async function verifySignature(
    value: string,
    expectedSignature: string,
    secret: string,
) {
    const key = await importSigningKey(secret);
    return crypto.subtle.verify(
        'HMAC',
        key,
        fromBase64Url(expectedSignature),
        encoder.encode(value),
    );
}

export function hasAdminCredentialsConfigured() {
    return Boolean(
        process.env.ADMIN_USERNAME &&
            process.env.ADMIN_PASSWORD &&
            process.env.ADMIN_SESSION_SECRET,
    );
}

export function getAdminCookieOptions(expiresAt?: number) {
    const maxAge = expiresAt
        ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
        : ADMIN_SESSION_MAX_AGE;

    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge,
    };
}

function constantTimeStringEquals(left: string, right: string) {
    const leftBytes = encoder.encode(left);
    const rightBytes = encoder.encode(right);

    if (leftBytes.length !== rightBytes.length) {
        return false;
    }

    let mismatch = 0;
    for (let index = 0; index < leftBytes.length; index += 1) {
        mismatch |= leftBytes[index] ^ rightBytes[index];
    }

    return mismatch === 0;
}

export async function validateAdminCredentials(
    username: string,
    password: string,
) {
    const configuredUsername = process.env.ADMIN_USERNAME;
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredUsername || !configuredPassword) {
        return false;
    }

    return (
        constantTimeStringEquals(username.trim(), configuredUsername.trim()) &&
        constantTimeStringEquals(password, configuredPassword)
    );
}

export async function createAdminSessionToken(username: string) {
    const secret = getAdminSessionSecret();
    const payload: AdminSessionPayload = {
        u: username.trim(),
        iat: Date.now(),
        exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    };
    const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
    const signature = await signValue(encodedPayload, secret);

    return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
    if (!token) {
        return null;
    }

    const secret = getAdminSessionSecret();
    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
        return null;
    }

    const isValid = await verifySignature(encodedPayload, signature, secret);
    if (!isValid) {
        return null;
    }

    try {
        const payload = JSON.parse(
            decoder.decode(fromBase64Url(encodedPayload)),
        ) as AdminSessionPayload;

        if (!payload.u || !payload.exp || Date.now() > payload.exp) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}
