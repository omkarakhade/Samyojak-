// Samyojak AI agent: planning helpers + safe data operations.
// Every function here takes a userId that came from a VERIFIED Supabase session.

import { storeList, storeGet, storeCreate, storeWrite, storeFindBatch, storeDelete, isStoreRecordId } from '@/lib/store'
import { postProduction, reverseProduction } from '@/lib/production'
import { receivePurchase, reverseReceipt } from '@/lib/receipts'
import { deductStock, restoreStock, formatDeducted, describeStock } from '@/lib/stockSync'

export const AGENT_MODULES = [
  'CRM',
  'Invoices',
  'Quotations',
  'Inventory',
  'HR',
  'Projects',
  'Recruiting',
  'Expenses',
  'Vendors',
  'Purchase Orders',
  'Recurring Invoices',
  'Sales Orders',
  'Attendance',
  'Leave Requests',
  'Expense Claims',
  'Returns',
  'Production Jobs',
  'Quality Issues',
  'Timesheets',
  'Assets',
  'Journal Entries',
  'Bills of Materials',
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
  kind?: 'edit' | 'mark_paid' | 'finish_job' | 'receive_po'
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
  'Customer',
  'Return No',
  'Job No',
  'Issue No',
  'Debit Account',
  'Asset Name',
  'Task',
  'Product',
  'Product Name',
  'Employee',
  'Vendor',
  'Vendor Name',
  'PO Number',
  'Order No',
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
    // Written only by the server when production is posted to stock.
    if (cleanKey === 'Stock Posted' || cleanKey === 'Stock Posted Qty' || cleanKey === 'Stock Received') continue
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
      if (typeof item.recordId !== 'string' || !isStoreRecordId(item.recordId)) continue
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
        kind: item.kind === 'mark_paid' ? 'mark_paid' : item.kind === 'finish_job' && item.module === 'Production Jobs' ? 'finish_job' : item.kind === 'receive_po' && item.module === 'Purchase Orders' ? 'receive_po' : 'edit',
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
  return (await storeList(userId, [module], { max: 1000 })).map(parseStored)
}

/** Fetch one record and make sure it belongs to this user. Returns null if not theirs. */
async function getOwnedRecord(userId: string, recordId: string) {
  assertSafeUserId(userId)
  if (!isStoreRecordId(recordId)) return null
  const raw = await storeGet(userId, recordId)
  if (!raw) return null
  return { raw, stored: parseStored(raw) }
}

async function writeRecordData(userId: string, recordId: string, data: Record<string, any>, meta: Record<string, any>) {
  await storeWrite(userId, recordId, { _meta: meta, ...data })
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
  const stockNotes: string[] = []
  const deducted: string[] = [] // what was taken off, in case saving fails

  for (const action of actions) {
    for (const original of action.records) {
      let record = original
      // New invoices with items take them off Inventory. 'Stock Deducted' is only written here.
      if (action.module === 'Invoices') {
        const { 'Stock Deducted': _ignored, ...rest } = record as Record<string, any>
        record = rest as AgentRecord
        if (typeof rest['Line Items'] === 'string' && rest['Line Items'].trim()) {
          try {
            const result = await deductStock(userId, rest['Line Items'])
            const text = formatDeducted(result)
            stockNotes.push(...describeStock(result))
            if (text) {
              deducted.push(text)
              record = { ...record, 'Stock Deducted': text }
            }
          } catch (e: any) {
            console.error('agent stock deduct failed:', e?.message)
            stockNotes.push('I could not update stock for one invoice. Please check Inventory.')
          }
        }
      }
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

  let ids: string[]
  try {
    ids = await storeCreate(userId, rows)
  } catch (e) {
    for (const text of deducted) await restoreStock(userId, text).catch(() => {})
    throw e
  }
  const created = ids.length

  return { batchId, created, stockNotes }
}

export async function undoAgentBatch(userId: string, batchId: string) {
  if (!/^agent_\d+_[a-z0-9]+$/.test(batchId)) throw new Error('Invalid batch id')
  assertSafeUserId(userId)
  const ids = await storeFindBatch(userId, batchId)

  // Remember what each invoice took off Inventory before the invoices are deleted.
  const toRestore: string[] = []
  for (const id of ids) {
    try {
      const raw = await storeGet(userId, id)
      if (!raw) continue
      const stored = parseStored(raw)
      if (stored.module === 'Invoices' && typeof stored.data['Stock Deducted'] === 'string') {
        toRestore.push(stored.data['Stock Deducted'])
      }
    } catch { /* an unreadable row just has nothing to restore */ }
  }

  const deleted = await storeDelete(userId, ids)

  let stockRestored = 0
  for (const text of toRestore) {
    try { stockRestored += await restoreStock(userId, text) } catch (e: any) { console.error('stock restore failed:', e?.message) }
  }
  return { deleted, stockRestored }
}

// ───────────────────────── Writing: edit / mark paid ─────────────────────────

/** Apply edits. Ownership is re-checked for every record; old values are returned for undo. */
export async function applyAgentUpdates(userId: string, updates: UpdateAction[]) {
  const reverts: Revert[] = []
  let updated = 0
  const skipped: string[] = []
  const stockNotes: string[] = []

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
    const nextData: Record<string, any> = { ...data, ...u.changes }
    // Finishing a job uses up its materials and adds the goods made, once per unit.
    if (u.kind === 'finish_job' && u.module === 'Production Jobs') {
      try {
        const post = await postProduction(userId, data, Number(u.changes['Quantity Made']) || 0)
        stockNotes.push(...post.notes)
        if (post.delta > 0) {
          nextData['Stock Posted Qty'] = Number(u.changes['Quantity Made']) || 0
          nextData['Stock Posted'] = [data['Stock Posted'], post.text].filter(Boolean).join('; ').slice(0, 450)
          previous['Stock Posted Qty'] = 'Stock Posted Qty' in data ? data['Stock Posted Qty'] : null
          previous['Stock Posted'] = 'Stock Posted' in data ? data['Stock Posted'] : null
        }
      } catch (e: any) {
        console.error('production post failed:', e?.message)
        stockNotes.push('I could not update stock for this job. Please check Inventory.')
      }
    }
    // Receiving a purchase order adds what arrived to Inventory, once.
    if (u.kind === 'receive_po' && u.module === 'Purchase Orders') {
      try {
        const got = await receivePurchase(userId, data, Number(u.changes['Quantity Received']) || undefined)
        stockNotes.push(...got.notes)
        if (got.qty > 0) {
          nextData['Stock Received'] = got.text
          previous['Stock Received'] = 'Stock Received' in data ? data['Stock Received'] : null
        }
      } catch (e: any) {
        console.error('receipt post failed:', e?.message)
        stockNotes.push('I could not update stock for this order. Please check Inventory.')
      }
    }
    const nextMeta = { ...meta, lastEditedAt: new Date().toISOString(), lastEditedBy: 'agent' }
    await writeRecordData(userId, u.recordId, nextData, nextMeta)
    reverts.push({ recordId: u.recordId, previous })
    updated++
  }

  return { updated, skipped, reverts, stockNotes }
}

export function sanitizeReverts(raw: any): Revert[] {
  if (!Array.isArray(raw)) return []
  const out: Revert[] = []
  for (const r of raw.slice(0, MAX_UPDATES_PER_REQUEST)) {
    if (!r || typeof r.recordId !== 'string' || !isStoreRecordId(r.recordId)) continue
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
  let stockItems = 0
  for (const r of reverts) {
    const owned = await getOwnedRecord(userId, r.recordId)
    if (!owned) continue
    const data = { ...owned.stored.data }
    // A finished job being undone gives the materials back and takes the goods out again.
    if (owned.stored.module === 'Production Jobs' && 'Stock Posted' in r.previous && typeof data['Stock Posted'] === 'string') {
      try {
        const posted = String(data['Stock Posted'])
        const before = typeof r.previous['Stock Posted'] === 'string' ? String(r.previous['Stock Posted']) : ''
        // Only reverse what this change added, not earlier postings.
        const added = before && posted.startsWith(before) ? posted.slice(before.length).replace(/^;\s*/, '') : posted
        stockItems += await reverseProduction(userId, added)
      } catch (e: any) {
        console.error('production reverse failed:', e?.message)
      }
    }
    // An order being un-received takes the goods out of stock again.
    if (owned.stored.module === 'Purchase Orders' && 'Stock Received' in r.previous && r.previous['Stock Received'] === null && typeof data['Stock Received'] === 'string') {
      try {
        stockItems += await reverseReceipt(userId, data['Stock Received'])
      } catch (e: any) {
        console.error('receipt reverse failed:', e?.message)
      }
    }
    for (const [key, value] of Object.entries(r.previous)) {
      if (value === null) delete data[key]
      else data[key] = value
    }
    const meta = { ...owned.stored.meta, lastEditedAt: new Date().toISOString(), lastEditedBy: 'agent_undo' }
    await writeRecordData(userId, r.recordId, data, meta)
    restored++
  }
  return { restored, stockItems }
}
