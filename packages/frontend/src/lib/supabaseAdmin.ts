// src/lib/supabaseAdmin.ts
import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily create the admin client using runtime env vars. This avoids requiring
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY during the build step where they
// are not available.
let admin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
    if (!admin) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
            throw new Error('Supabase admin credentials are missing');
        }
        admin = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return admin;
}
