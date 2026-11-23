import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { storeGet, isStoreRecordId } from '@/lib/store'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { isMemberOf } from '@/lib/team'

export const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

/**
 * Returns the logged-in Supabase user for an API request, or null.
 * Checks an "Authorization: Bearer <token>" header first, then the session cookie.
 * The user is always verified with Supabase, never trusted from the request body.
 */
/**
 * A team member works inside the owner's business: the returned user has the owner's id
 * (so data, plan and limits are the owner's) but the member's own email, so a member is
 * never treated as the admin. team_member is true for them; billing routes refuse it.
 * Returns null if the owner has since removed this person.
 */
export async function toWorkspaceUser<T extends { id: string; email?: string | null; app_metadata?: any; user_metadata?: any }>(u: T): Promise<T | null> {
  const ownerId = u?.app_metadata?.team_owner
  if (typeof ownerId !== 'string') return u
  if (!isSafeId(ownerId)) return null
  try {
    const { data, error } = await createSupabaseAdminClient().auth.admin.getUserById(ownerId)
    const owner = data?.user
    if (error || !owner || !isMemberOf(owner.app_metadata, u.id)) return null
    return {
      ...(owner as any),
      email: u.email,
      user_metadata: { ...(owner.user_metadata || {}), full_name: u.user_metadata?.full_name },
      team_member: true,
      member_id: u.id,
    } as T
  } catch {
    return null
  }
}

export function isTeamMember(user: any): boolean {
  return !!user && user.team_member === true
}

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
    if (!error && data.user) return toWorkspaceUser(data.user)
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    if (!error && data.user) return toWorkspaceUser(data.user)
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

/** Record ids: Airtable ids (recXXXXXXXXXXXXXX) or Supabase UUIDs (trial accounts). */
export function isSafeRecordId(id: unknown): id is string {
  return isStoreRecordId(id)
}

/** True only if the record exists and belongs to this user. */
export async function userOwnsRecord(userId: string, recordId: string): Promise<boolean> {
  if (!isSafeId(userId) || !isSafeRecordId(recordId)) return false
  try {
    return (await storeGet(userId, recordId)) !== null
  } catch {
    return false
  }
}
