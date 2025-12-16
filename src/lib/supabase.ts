// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazily initialize the public client so env vars are only accessed at runtime
let client: SupabaseClient | null = null

export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Public Supabase credentials are missing')
    }
    client = createClient(url, key)
  }
  return client
}

