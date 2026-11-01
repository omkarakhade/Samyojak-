import { createClient } from '@supabase/supabase-js'

// Server-only client — NEVER import this in client components
// Uses service role key to bypass Row Level Security
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
