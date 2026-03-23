import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/csrf';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getAllowedOrigins(request: NextRequest) {
    const origins = new Set<string>();

    origins.add(request.nextUrl.origin);

    const envOrigins = [
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.SITE_URL,
        process.env.APP_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ];

    for (const value of envOrigins) {
        if (value) {
            origins.add(value.replace(/\/$/, ''));
        }
    }

    return origins;
}

export function ensureTrustedOrigin(request: NextRequest) {
    if (!MUTATION_METHODS.has(request.method.toUpperCase())) {
        return null;
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = getAllowedOrigins(request);

    if (origin && !allowedOrigins.has(origin.replace(/\/$/, ''))) {
        return NextResponse.json({ message: 'Invalid request origin' }, { status: 403 });
    }

    if (!origin && referer) {
        try {
            const refererOrigin = new URL(referer).origin.replace(/\/$/, '');
            if (!allowedOrigins.has(refererOrigin)) {
                return NextResponse.json(
                    { message: 'Invalid request referer' },
                    { status: 403 },
                );
            }
        } catch {
            return NextResponse.json(
                { message: 'Invalid request referer' },
                { status: 403 },
            );
        }
    }

    return null;
}

export function ensureProtectedMutationRequest(request: NextRequest) {
    const originError = ensureTrustedOrigin(request);
    if (originError) {
        return originError;
    }

    return csrfProtection(request);
}
