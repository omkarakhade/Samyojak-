import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

/**
 * Returns the logged-in Supabase user for an API request, or null.
 * Checks an "Authorization: Bearer <token>" header first, then the session cookie.
 * The user is always verified with Supabase, never trusted from the request body.
 */
export async function getAuthedUser(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (token) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data.user) return data.user
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    if (!error && data.user) return data.user
  } catch {
    // no cookie session
  }

  return null
}

export function isAdminUser(user: { email?: string | null } | null) {
  return !!user && user.email === ADMIN_EMAIL
}

/** Supabase user ids are UUIDs. Anything else must never reach an Airtable formula. */
export function isSafeId(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(id)
}

/** Module names are short plain words. Blocks quotes and formula characters. */
export function isSafeModule(m: unknown): m is string {
  return typeof m === 'string' && /^[A-Za-z0-9 _-]{1,40}$/.test(m)
}

/** Airtable record ids look like recXXXXXXXXXXXXXX */
export function isSafeRecordId(id: unknown): id is string {
  return typeof id === 'string' && /^rec[A-Za-z0-9]{10,20}$/.test(id)
}

/** True only if the UserData record exists and belongs to this user. */
export async function userOwnsRecord(userId: string, recordId: string): Promise<boolean> {
  if (!isSafeId(userId) || !isSafeRecordId(recordId)) return false
  const token = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
  const base = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${base}/UserData/${recordId}?fields%5B%5D=User%20ID`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return false
    const data = await res.json()
    return data.fields?.['User ID'] === userId
  } catch {
    return false
  }
}
