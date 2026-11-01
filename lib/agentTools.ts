// Samyojak AI agent: planning helpers + safe data operations.
// Every function here takes a userId that came from a VERIFIED Supabase session.

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

export const AGENT_MODULES = [
  'CRM',
  'Invoices',
  'Quotations',
  'Inventory',
  'HR',
  'Projects',
  'Recruiting',
] as const

export type AgentModule = (typeof AGENT_MODULES)[number]
export type AgentRecord = Record<string, string | number>

export interface AddAction {
  type: 'add'
  module: AgentModule
  records: AgentRecord[]
}

export interface UpdateAction {
  type: 'update'
  module: AgentModule
  recordId: string
  label: string // human name of the record being changed
  changes: AgentRecord
  before?: AgentRecord // old values of the changed fields (display only; recomputed on confirm)
  kind?: 'edit' | 'mark_paid'
}

export type AgentAction = AddAction | UpdateAction

export interface Revert {
  recordId: string
  previous: Record<string, string | number | null> // null = field did not exist before
}

export const MAX_RECORDS_PER_REQUEST = 10
export const MAX_UPDATES_PER_REQUEST = 5

const NAME_FIELDS = [
  'Name',
  'Client Name',
  'Item Name',
  'Project Name',
  'Candidate Name',
  'Customer Name',
  'Product Name',
  'SKU',
]

// ───────────────────────── Sanitising ─────────────────────────

function sanitizeRecord(raw: any): AgentRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: AgentRecord = {}
  let count = 0
  for (const [key, value] of Object.entries(raw)) {
    if (count >= 20) break
    const cleanKey = String(key).trim().slice(0, 60)
    if (!cleanKey || cleanKey.startsWith('_')) continue
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[cleanKey] = value
      count++
    } else if (typeof value === 'string' && value.trim() !== '') {
      out[cleanKey] = value.trim().slice(0, 500)
      count++
    }
  }
  return count > 0 ? out : null
}

function isModule(m: any): m is AgentModule {
  return AGENT_MODULES.includes(m)
}

/** Clean actions coming from the model or from the browser. */
export function sanitizeActions(raw: any): AgentAction[] {
  if (!Array.isArray(raw)) return []
  const actions: AgentAction[] = []
  let totalRecords = 0
  let totalUpdates = 0

  for (const item of raw) {
    if (!item || !isModule(item.module)) continue

    if (item.type === 'update') {
      if (totalUpdates >= MAX_UPDATES_PER_REQUEST) continue
      if (typeof item.recordId !== 'string' || !/^rec[A-Za-z0-9]{10,20}$/.test(item.recordId)) continue
      const changes = sanitizeRecord(item.changes)
      if (!changes) continue
      const before = sanitizeRecord(item.before) || undefined
      actions.push({
        type: 'update',
        module: item.module,
        recordId: item.recordId,
        label: typeof item.label === 'string' ? item.label.slice(0, 120) : 'Record',
        changes,
        before,
        kind: item.kind === 'mark_paid' ? 'mark_paid' : 'edit',
      })
      totalUpdates++
      continue
    }

    // default: add
    if (!Array.isArray(item.records)) continue
    const records: AgentRecord[] = []
    for (const r of item.records) {
      if (totalRecords >= MAX_RECORDS_PER_REQUEST) break
      const clean = sanitizeRecord(r)
      if (clean) {
        records.push(clean)
        totalRecords++
      }
    }
    if (records.length > 0) actions.push({ type: 'add', module: item.module, records })
  }
  return actions
}

// ───────────────────────── Airtable helpers ─────────────────────────

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
}

function assertSafeUserId(userId: string) {
  if (!/^[A-Za-z0-9-]{8,64}$/.test(userId)) throw new Error('Invalid user id')
}

interface StoredRecord {
  id: string
  module: string
  data: Record<string, any>
  meta: Record<string, any>
}

function parseStored(r: any): StoredRecord {
  let parsed: Record<string, any> = {}
  try {
    parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
  } catch {
    parsed = {}
  }
  const { _meta, ...data } = parsed
  return { id: r.id, module: r.fields?.Module || '', data, meta: _meta || {} }
}

export async function listUserRecords(userId: string, module: AgentModule): Promise<StoredRecord[]> {
  assertSafeUserId(userId)
  const formula = `AND({User ID}="${userId}",{Module}="${module}")`
  const out: StoredRecord[] = []
  let offset: string | undefined
  do {
    const url =
      `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(formula)}` +
      `&pageSize=100${offset ? `&offset=${offset}` : ''}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (!res.ok) throw new Error(`Data error ${res.status}`)
    const data = await res.json()
    for (const r of data.records || []) out.push(parseStored(r))
    offset = data.offset
  } while (offset && out.length < 1000)
  return out
}

/** Fetch one record and make sure it belongs to this user. Returns null if not theirs. */
async function getOwnedRecord(userId: string, recordId: string) {
  assertSafeUserId(userId)
  if (!/^rec[A-Za-z0-9]{10,20}$/.test(recordId)) return null
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData/${recordId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) return null
  const raw = await res.json()
  if (raw.fields?.['User ID'] !== userId) return null
  return { raw, stored: parseStored(raw) }
}

async function writeRecordData(recordId: string, data: Record<string, any>, meta: Record<string, any>) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData/${recordId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ fields: { 'Record Data': JSON.stringify({ _meta: meta, ...data }) } }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Save error ${res.status}: ${err}`)
  }
}

// ───────────────────────── Finding records ─────────────────────────

export function recordLabel(data: Record<string, any>): string {
  for (const f of NAME_FIELDS) {
    if (data[f]) return String(data[f])
  }
  const first = Object.values(data).find(v => typeof v === 'string' && v.trim())
  return first ? String(first) : 'Record'
}

function norm(s: unknown) {
  return String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function isPaid(data: Record<string, any>) {
  return norm(data['Payment Status'] ?? data['Status']) === 'paid'
}

export interface FindResult {
  matches: StoredRecord[]
}

/** Find a user's records in a module whose name-like field contains the text. */
export async function findRecords(
  userId: string,
  module: AgentModule,
  find: string,
  opts: { onlyUnpaid?: boolean } = {}
): Promise<FindResult> {
  const needle = norm(find)
  if (!needle) return { matches: [] }
  const all = await listUserRecords(userId, module)

  const scored = all
    .map(r => {
      const label = norm(recordLabel(r.data))
      let score = 0
      if (label === needle) score = 3
      else if (label.includes(needle) || needle.includes(label)) score = 2
      else {
        // any name-like field contains it
        for (const f of NAME_FIELDS) {
          if (r.data[f] && norm(r.data[f]).includes(needle)) { score = 1; break }
        }
      }
      return { r, score }
    })
    .filter(x => x.score > 0)

  if (scored.length === 0) return { matches: [] }
  const best = Math.max(...scored.map(x => x.score))
  let matches = scored.filter(x => x.score === best).map(x => x.r)

  if (opts.onlyUnpaid) {
    const unpaid = matches.filter(r => !isPaid(r.data))
    matches = unpaid
  }
  return { matches }
}

// ───────────────────────── Writing: add ─────────────────────────

export async function createAgentRecords(userId: string, actions: AddAction[]) {
  assertSafeUserId(userId)
  const batchId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const importedAt = new Date().toISOString()
  const today = importedAt.split('T')[0]

  const rows: { fields: Record<string, any> }[] = []
  let rowIndex = 0

  for (const action of actions) {
    for (const record of action.records) {
      rows.push({
        fields: {
          'User ID': userId,
          Module: action.module,
          'Record Data': JSON.stringify({
            _meta: {
              importId: batchId,
              rowIndex: rowIndex++,
              source: 'agent_entry',
              importedAt,
              originalHeaders: Object.keys(record),
              totalColumns: Object.keys(record).length,
            },
            ...record,
          }),
          Source: 'agent_entry',
          'Created At': today,
        },
      })
    }
  }

  let created = 0
  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10)
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ records: chunk }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Save error ${res.status}: ${err}`)
    }
    created += chunk.length
  }

  return { batchId, created }
}

export async function undoAgentBatch(userId: string, batchId: string) {
  if (!/^agent_\d+_[a-z0-9]+$/.test(batchId)) throw new Error('Invalid batch id')
  assertSafeUserId(userId)

  const formula = `AND({User ID}="${userId}",FIND("${batchId}",{Record Data}))`
  const ids: string[] = []
  let offset: string | undefined

  do {
    const url =
      `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(formula)}` +
      `&fields%5B%5D=User%20ID&pageSize=100${offset ? `&offset=${offset}` : ''}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (!res.ok) throw new Error(`Data error ${res.status}`)
    const data = await res.json()
    for (const r of data.records || []) ids.push(r.id)
    offset = data.offset
  } while (offset)

  let deleted = 0
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10)
    const query = chunk.map(id => `records[]=${id}`).join('&')
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData?${query}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (!res.ok) throw new Error(`Delete error ${res.status}`)
    deleted += chunk.length
  }

  return { deleted }
}

// ───────────────────────── Writing: edit / mark paid ─────────────────────────

/** Apply edits. Ownership is re-checked for every record; old values are returned for undo. */
export async function applyAgentUpdates(userId: string, updates: UpdateAction[]) {
  const reverts: Revert[] = []
  let updated = 0
  const skipped: string[] = []

  for (const u of updates) {
    const owned = await getOwnedRecord(userId, u.recordId)
    if (!owned || owned.stored.module !== u.module) {
      skipped.push(u.label)
      continue
    }
    const { data, meta } = owned.stored
    const previous: Revert['previous'] = {}
    for (const key of Object.keys(u.changes)) {
      previous[key] = key in data ? data[key] : null
    }
    const nextData = { ...data, ...u.changes }
    const nextMeta = { ...meta, lastEditedAt: new Date().toISOString(), lastEditedBy: 'agent' }
    await writeRecordData(u.recordId, nextData, nextMeta)
    reverts.push({ recordId: u.recordId, previous })
    updated++
  }

  return { updated, skipped, reverts }
}

export function sanitizeReverts(raw: any): Revert[] {
  if (!Array.isArray(raw)) return []
  const out: Revert[] = []
  for (const r of raw.slice(0, MAX_UPDATES_PER_REQUEST)) {
    if (!r || typeof r.recordId !== 'string' || !/^rec[A-Za-z0-9]{10,20}$/.test(r.recordId)) continue
    if (!r.previous || typeof r.previous !== 'object') continue
    const previous: Revert['previous'] = {}
    for (const [k, v] of Object.entries(r.previous)) {
      const key = String(k).trim().slice(0, 60)
      if (!key || key.startsWith('_')) continue
      if (v === null) previous[key] = null
      else if (typeof v === 'number' && Number.isFinite(v)) previous[key] = v
      else if (typeof v === 'string') previous[key] = v.slice(0, 500)
    }
    if (Object.keys(previous).length > 0) out.push({ recordId: r.recordId, previous })
  }
  return out
}

export async function undoAgentUpdates(userId: string, reverts: Revert[]) {
  let restored = 0
  for (const r of reverts) {
    const owned = await getOwnedRecord(userId, r.recordId)
    if (!owned) continue
    const data = { ...owned.stored.data }
    for (const [key, value] of Object.entries(r.previous)) {
      if (value === null) delete data[key]
      else data[key] = value
    }
    const meta = { ...owned.stored.meta, lastEditedAt: new Date().toISOString(), lastEditedBy: 'agent_undo' }
    await writeRecordData(r.recordId, data, meta)
    restored++
  }
  return { restored }
}
