import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cookie-based browser client. The session is stored in cookies so that
// middleware.ts and server routes can see the same logged-in user.
// (Plain supabase-js stored it in localStorage, which middleware cannot read.)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
