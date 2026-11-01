// Server-only data layer for user records (Supabase `records` table).
// Every function takes a userId that came from a VERIFIED session and filters by it,
// so the service-role client can never read or change another user's rows.

import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface StoredRecord {
  id: string
  module: string
  data: Record<string, any>
  meta: Record<string, any>
  source: string
  batchId: string | null
  createdAt: string
}

export interface NewRecord {
  module: string
  data: Record<string, any>
  source: string
  batchId?: string | null
  meta?: Record<string, any>
}

const PAGE = 1000
const MAX_ROWS = 10000

function toStored(r: any): StoredRecord {
  return {
    id: r.id,
    module: r.module,
    data: r.data || {},
    meta: r.meta || {},
    source: r.source || 'unknown',
    batchId: r.batch_id ?? null,
    createdAt: r.created_at,
  }
}

function assertUser(userId: string) {
  if (!UUID_RE.test(userId)) throw new Error('Invalid user id')
}

export async function listRecords(
  userId: string,
  module: string,
  opts: { batchId?: string } = {}
): Promise<StoredRecord[]> {
  assertUser(userId)
  const db = createSupabaseAdminClient()
  const out: StoredRecord[] = []

  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    let q = db
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .eq('module', module)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1)
    if (opts.batchId) q = q.eq('batch_id', opts.batchId)

    const { data, error } = await q
    if (error) throw new Error(`Data error: ${error.message}`)
    for (const r of data || []) out.push(toStored(r))
    if (!data || data.length < PAGE) break
  }
  return out
}

export async function countRecords(userId: string, module: string): Promise<number> {
  assertUser(userId)
  const db = createSupabaseAdminClient()
  const { count, error } = await db
    .from('records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('module', module)
  if (error) throw new Error(`Data error: ${error.message}`)
  return count || 0
}

export async function insertRecords(userId: string, items: NewRecord[]): Promise<number> {
  assertUser(userId)
  if (items.length === 0) return 0
  const db = createSupabaseAdminClient()
  let created = 0

  for (let i = 0; i < items.length; i += 500) {
    const chunk = items.slice(i, i + 500).map(it => ({
      user_id: userId,
      module: it.module,
      data: it.data,
      meta: it.meta || {},
      source: it.source,
      batch_id: it.batchId || null,
    }))
    const { error } = await db.from('records').insert(chunk)
    if (error) throw new Error(`Save error: ${error.message}`)
    created += chunk.length
  }
  return created
}

/** Returns the record only if it belongs to this user. */
export async function getOwnedRecord(userId: string, recordId: string): Promise<StoredRecord | null> {
  if (!UUID_RE.test(userId) || !UUID_RE.test(recordId)) return null
  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from('records')
    .select('*')
    .eq('id', recordId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return toStored(data)
}

export async function updateRecord(
  userId: string,
  recordId: string,
  data: Record<string, any>,
  meta: Record<string, any>
): Promise<void> {
  assertUser(userId)
  if (!UUID_RE.test(recordId)) throw new Error('Invalid record id')
  const db = createSupabaseAdminClient()
  const { error } = await db
    .from('records')
    .update({ data, meta })
    .eq('id', recordId)
    .eq('user_id', userId)
  if (error) throw new Error(`Save error: ${error.message}`)
}

export async function deleteRecord(userId: string, recordId: string): Promise<boolean> {
  assertUser(userId)
  if (!UUID_RE.test(recordId)) return false
  const db = createSupabaseAdminClient()
  const { data, error } = await db
    .from('records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId)
    .select('id')
  if (error) throw new Error(`Delete error: ${error.message}`)
  return (data || []).length > 0
}

export async function deleteBatch(userId: string, batchId: string, module?: string): Promise<number> {
  assertUser(userId)
  const db = createSupabaseAdminClient()
  let q = db.from('records').delete().eq('user_id', userId).eq('batch_id', batchId)
  if (module) q = q.eq('module', module)
  const { data, error } = await q.select('id')
  if (error) throw new Error(`Delete error: ${error.message}`)
  return (data || []).length
}
