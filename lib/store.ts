import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'

/**
 * One storage layer for user records.
 *  - 'supabase' : free-trial data (table public.records)
 *  - 'airtable' : paid accounts, admin and demo (table UserData)
 * Which one a user is on comes from subscriptions.data_store (default 'airtable').
 *
 * Records are passed around in the shape the app already uses for Airtable:
 *   { id, fields: { 'User ID', Module, 'Record Data' (JSON string with _meta), Source, 'Created At' } }
 * so the rest of the code does not care where a record lives.
 */

export type StoreKind = 'airtable' | 'supabase'

export interface StoreRecord {
  id: string
  fields: Record<string, any>
}

const TOKEN = () => (process.env.AIRTABLE_TOKEN || process.env.NEXT_PUBLIC_AIRTABLE_TOKEN) || ''
const BASE = () => (process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) || ''
const AT_URL = () => `https://api.airtable.com/v0/${BASE()}/UserData`
const AT_HEADERS = () => ({ Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' })

export const MAX_TRIAL_ROWS = 3000

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AT_ID_RE = /^rec[A-Za-z0-9]{10,20}$/
const USER_RE = /^[A-Za-z0-9-]{8,64}$/
const MODULE_RE = /^[A-Za-z0-9 _-]{1,40}$/
const BATCH_RE = /^[A-Za-z0-9_-]{1,80}$/

export const isStoreRecordId = (id: unknown): id is string =>
  typeof id === 'string' && (AT_ID_RE.test(id) || UUID_RE.test(id))

function assertUser(userId: string) {
  if (!USER_RE.test(userId)) throw new Error('Invalid user id')
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ───────────── which store? ─────────────

const kindCache = new Map<string, { kind: StoreKind; expires: number }>()

export function forgetStoreKind(userId: string) {
  kindCache.delete(userId)
}

export async function getStoreKind(userId: string): Promise<StoreKind> {
  assertUser(userId)
  const hit = kindCache.get(userId)
  if (hit && hit.expires > Date.now()) return hit.kind
  let kind: StoreKind = 'airtable'
  try {
    const { data } = await createSupabaseAdminClient()
      .from('subscriptions')
      .select('data_store')
      .eq('user_id', userId)
      .maybeSingle()
    if (data?.data_store === 'supabase') kind = 'supabase'
  } catch {
    // if the check fails, fall back to Airtable (the original behaviour)
  }
  kindCache.set(userId, { kind, expires: Date.now() + 15_000 })
  return kind
}

// ───────────── shape conversion ─────────────

export function rowToRecord(row: any): StoreRecord {
  return {
    id: row.id,
    fields: {
      'User ID': row.user_id,
      Module: row.module,
      'Record Data': JSON.stringify({ _meta: row.meta || {}, ...(row.data || {}) }),
      Source: row.source,
      'Created At': String(row.created_at || '').slice(0, 10),
    },
  }
}

function fieldsToRow(userId: string, fields: Record<string, any>) {
  let parsed: Record<string, any> = {}
  try {
    parsed = JSON.parse(fields['Record Data'] || '{}')
  } catch {
    parsed = {}
  }
  const { _meta, ...data } = parsed
  const meta = _meta && typeof _meta === 'object' ? _meta : {}
  return {
    user_id: userId,
    module: String(fields.Module || ''),
    data,
    meta,
    source: String(fields.Source || meta.source || 'manual_entry'),
    batch_id: typeof meta.importId === 'string' ? meta.importId : null,
  }
}

// ───────────── read ─────────────

export async function storeList(
  userId: string,
  modules: string[],
  opts: { max?: number } = {}
): Promise<StoreRecord[]> {
  assertUser(userId)
  const mods = Array.from(new Set(modules)).filter(m => MODULE_RE.test(m))
  if (mods.length === 0) return []
  const max = opts.max ?? 2000
  const kind = await getStoreKind(userId)

  if (kind === 'supabase') {
    const supabase = createSupabaseAdminClient()
    const out: StoreRecord[] = []
    for (let from = 0; out.length < max; from += 1000) {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId)
        .in('module', mods)
        .order('created_at', { ascending: true })
        .range(from, from + 999)
      if (error) throw new Error(`Data error ${error.message}`)
      for (const row of data || []) out.push(rowToRecord(row))
      if (!data || data.length < 1000) break
    }
    return out.slice(0, max)
  }

  const moduleFilter = mods.length === 1 ? `{Module}="${mods[0]}"` : `OR(${mods.map(m => `{Module}="${m}"`).join(',')})`
  const formula = `AND({User ID}="${userId}",${moduleFilter})`
  const out: StoreRecord[] = []
  let offset: string | undefined
  do {
    const params = new URLSearchParams()
    params.set('filterByFormula', formula)
    params.set('pageSize', '100')
    if (offset) params.set('offset', offset)
    const res = await fetch(`${AT_URL()}?${params}`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
    if (!res.ok) throw new Error(`Data error ${res.status}`)
    const json = await res.json()
    for (const r of json.records || []) out.push({ id: r.id, fields: r.fields || {} })
    offset = out.length >= max ? undefined : json.offset
  } while (offset)
  return out
}

/** One record, only if it belongs to this user. */
export async function storeGet(userId: string, id: string): Promise<StoreRecord | null> {
  assertUser(userId)
  if (!isStoreRecordId(id)) return null
  const kind = await getStoreKind(userId)

  if (kind === 'supabase') {
    if (!UUID_RE.test(id)) return null
    const { data } = await createSupabaseAdminClient()
      .from('records').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
    return data ? rowToRecord(data) : null
  }

  if (!AT_ID_RE.test(id)) return null
  const res = await fetch(`${AT_URL()}/${id}`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
  if (!res.ok) return null
  const raw = await res.json()
  if (raw.fields?.['User ID'] !== userId) return null
  return { id: raw.id, fields: raw.fields || {} }
}

/** IDs of every record from one import / agent batch. */
export async function storeFindBatch(userId: string, batchId: string): Promise<string[]> {
  assertUser(userId)
  if (!BATCH_RE.test(batchId)) throw new Error('Invalid batch id')
  const kind = await getStoreKind(userId)

  if (kind === 'supabase') {
    const { data, error } = await createSupabaseAdminClient()
      .from('records').select('id').eq('user_id', userId).eq('batch_id', batchId)
    if (error) throw new Error(`Data error ${error.message}`)
    return (data || []).map((r: any) => r.id)
  }

  const formula = `AND({User ID}="${userId}",FIND("${batchId}",{Record Data}))`
  const ids: string[] = []
  let offset: string | undefined
  do {
    const url = `${AT_URL()}?filterByFormula=${encodeURIComponent(formula)}&fields%5B%5D=User%20ID&pageSize=100${offset ? `&offset=${offset}` : ''}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN()}` } })
    if (!res.ok) throw new Error(`Data error ${res.status}`)
    const json = await res.json()
    for (const r of json.records || []) ids.push(r.id)
    offset = json.offset
  } while (offset)
  return ids
}

// ───────────── write ─────────────

/** Create records straight in Airtable (used by storeCreate and by the trial-to-paid move). */
export async function airtableCreateRaw(items: { fields: Record<string, any> }[]): Promise<string[]> {
  const ids: string[] = []
  for (let i = 0; i < items.length; i += 10) {
    const chunk = items.slice(i, i + 10)
    const res = await fetch(AT_URL(), {
      method: 'POST',
      headers: AT_HEADERS(),
      body: JSON.stringify({ records: chunk }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('store create error:', res.status, err.slice(0, 300))
      const full = res.status === 422 && /limit|exceed|quota/i.test(err)
      throw Object.assign(new Error(full ? 'full' : `save ${res.status}`), { created: ids.length, full })
    }
    const json = await res.json()
    for (const r of json.records || []) ids.push(r.id)
    if (i + 10 < items.length) await sleep(220) // stay under 5 requests per second
  }
  return ids
}

/**
 * Create records. Each item is { fields } in Airtable shape. Returns the new ids.
 * On failure throws an Error with .created (how many were saved first) and .full (storage full).
 */
export async function storeCreate(userId: string, items: { fields: Record<string, any> }[]): Promise<string[]> {
  assertUser(userId)
  if (items.length === 0) return []
  const kind = await getStoreKind(userId)
  const ids: string[] = []

  if (kind === 'supabase') {
    const supabase = createSupabaseAdminClient()
    const { count } = await supabase
      .from('records').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    if ((count || 0) + items.length > MAX_TRIAL_ROWS) {
      throw Object.assign(new Error('full'), { created: 0, full: true })
    }
    const rows = items.map(i => fieldsToRow(userId, i.fields))
    for (let i = 0; i < rows.length; i += 200) {
      const { data, error } = await supabase.from('records').insert(rows.slice(i, i + 200)).select('id')
      if (error) throw Object.assign(new Error(`save ${error.message}`), { created: ids.length, full: false })
      for (const r of data || []) ids.push(r.id)
    }
    return ids
  }

  return airtableCreateRaw(items)
}

/** Replace the stored data of one record. recordData is the full object including _meta. */
export async function storeWrite(userId: string, id: string, recordData: Record<string, any>) {
  assertUser(userId)
  if (!isStoreRecordId(id)) throw new Error('Invalid record id')
  const kind = await getStoreKind(userId)

  if (kind === 'supabase') {
    const { _meta, ...data } = recordData
    const { error } = await createSupabaseAdminClient()
      .from('records')
      .update({ data, meta: _meta || {}, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', userId)
    if (error) throw new Error(`Save error ${error.message}`)
    return
  }

  const res = await fetch(`${AT_URL()}/${id}`, {
    method: 'PATCH',
    headers: AT_HEADERS(),
    body: JSON.stringify({ fields: { 'Record Data': JSON.stringify(recordData) } }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Save error ${res.status}: ${err}`)
  }
}

/** Delete records. Callers must already know the ids belong to this user (Supabase also enforces it). */
export async function storeDelete(userId: string, ids: string[]): Promise<number> {
  assertUser(userId)
  const valid = ids.filter(isStoreRecordId)
  if (valid.length === 0) return 0
  const kind = await getStoreKind(userId)

  if (kind === 'supabase') {
    const supabase = createSupabaseAdminClient()
    let deleted = 0
    for (let i = 0; i < valid.length; i += 200) {
      const chunk = valid.slice(i, i + 200).filter(id => UUID_RE.test(id))
      if (chunk.length === 0) continue
      const { error, count } = await supabase
        .from('records').delete({ count: 'exact' }).eq('user_id', userId).in('id', chunk)
      if (error) throw new Error(`Delete error ${error.message}`)
      deleted += count || 0
    }
    return deleted
  }

  let deleted = 0
  for (let i = 0; i < valid.length; i += 10) {
    const chunk = valid.slice(i, i + 10).filter(id => AT_ID_RE.test(id))
    if (chunk.length === 0) continue
    const query = chunk.map(id => `records[]=${id}`).join('&')
    const res = await fetch(`${AT_URL()}?${query}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN()}` } })
    if (!res.ok) throw new Error(`Delete error ${res.status}`)
    deleted += chunk.length
    if (i + 10 < valid.length) await sleep(220)
  }
  return deleted
}
