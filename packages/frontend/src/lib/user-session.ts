import { cookies } from 'next/headers';
import { User, createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest } from 'next/server';

function getBearerToken(request: NextRequest) {
    const header = request.headers.get('authorization')?.trim();

    if (!header) {
        return null;
    }

    const [scheme, token] = header.split(/\s+/, 2);

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
        return null;
    }

    return token;
}

async function getUserFromBearerToken(token: string): Promise<User | null> {
    const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        return null;
    }

    const supabase = createClient(url, anonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error) {
        return null;
    }

    return user;
}

export async function getRequestUser(request: NextRequest) {
    const bearerToken = getBearerToken(request);

    if (bearerToken) {
        const bearerUser = await getUserFromBearerToken(bearerToken);
        if (bearerUser) {
            return bearerUser;
        }
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user ?? null;
}
