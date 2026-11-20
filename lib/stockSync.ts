// Keeps Inventory in step with invoices: items on an invoice's "Line Items" reduce stock,
// and the same amount is put back if the invoice is undone.
// Every function takes a userId from a VERIFIED session and only touches that user's records.

import { storeList, storeWrite } from '@/lib/store'
import { parseLineItems, itemKey } from '@/lib/lineItems'

export interface StockChange {
  name: string
  requested: number
  /** What was really taken off. Less than requested when stock ran out (stock never goes below 0). */
  applied: number
  before: number
  after: number
}

export interface StockResult {
  changes: StockChange[]
  /** Items on the invoice that are not in Inventory under the same name. */
  missing: string[]
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v !== 'string') return 0
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function pickKey(data: Record<string, any>, exact: string, pattern: RegExp): string | null {
  if (exact in data) return exact
  return Object.keys(data).find(k => pattern.test(k)) || null
}

/** Add up the same item written on several lines. */
function wantedFrom(items: { name: string; qty: number }[]) {
  const wanted = new Map<string, { name: string; qty: number }>()
  for (const i of items) {
    const key = itemKey(i.name)
    if (!key || !(i.qty > 0)) continue
    const cur = wanted.get(key)
    if (cur) cur.qty += i.qty
    else wanted.set(key, { name: i.name, qty: i.qty })
  }
  return wanted
}

async function adjustStock(
  userId: string,
  wanted: Map<string, { name: string; qty: number }>,
  direction: 1 | -1
): Promise<StockResult> {
  const result: StockResult = { changes: [], missing: [] }
  if (wanted.size === 0) return result

  const records = await storeList(userId, ['Inventory'], { max: 2000 })
  // No Inventory yet (a new account, or a service business): there is no stock to move, so say nothing.
  if (records.length === 0) return result
  const handled = new Set<string>()

  for (const r of records) {
    let parsed: Record<string, any> = {}
    try {
      parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
    } catch {
      continue
    }
    const { _meta, ...data } = parsed
    const nameKey = pickKey(data, 'Item Name', /item|product|name/i)
    const stockKey = pickKey(data, 'Current Stock', /current.*stock|^stock$|quantity|qty/i)
    if (!nameKey || !stockKey) continue

    const key = itemKey(String(data[nameKey] ?? ''))
    const want = wanted.get(key)
    if (!want || handled.has(key)) continue
    handled.add(key)

    const before = toNum(data[stockKey])
    const after = direction < 0 ? Math.max(0, before - want.qty) : before + want.qty
    const applied = Math.abs(after - before)
    if (applied > 0) {
      const nextData = { ...data, [stockKey]: typeof data[stockKey] === 'number' ? after : String(after) }
      const nextMeta = { ...(_meta || {}), lastEditedAt: new Date().toISOString(), lastEditedBy: 'invoice_stock' }
      await storeWrite(userId, r.id, { _meta: nextMeta, ...nextData })
    }
    result.changes.push({ name: want.name, requested: want.qty, applied, before, after })
  }

  wanted.forEach((w, key) => {
    if (!handled.has(key)) result.missing.push(w.name)
  })
  return result
}

/** Take the items of a new invoice off Inventory. */
export async function deductStock(userId: string, lineItemsText: unknown): Promise<StockResult> {
  return adjustStock(userId, wantedFrom(parseLineItems(lineItemsText)), -1)
}

/** What was really taken off, as readable text to keep on the invoice: "Laptop:2; Mouse:5". */
export function formatDeducted(result: StockResult): string {
  return result.changes
    .filter(c => c.applied > 0)
    .map(c => `${c.name.replace(/[;:]/g, ' ')}:${c.applied}`)
    .join('; ')
    .slice(0, 450)
}

/** Put back exactly what formatDeducted recorded. Returns how many items were restored. */
export async function restoreStock(userId: string, deductedText: unknown): Promise<number> {
  if (typeof deductedText !== 'string' || !deductedText.trim()) return 0
  const items: { name: string; qty: number }[] = []
  for (const part of deductedText.split(';')) {
    const i = part.lastIndexOf(':')
    if (i <= 0) continue
    const qty = toNum(part.slice(i + 1))
    const name = part.slice(0, i).trim()
    if (name && qty > 0) items.push({ name, qty })
  }
  const result = await adjustStock(userId, wantedFrom(items), 1)
  return result.changes.length
}

/** Plain sentences telling the owner what happened to stock. */
export function describeStock(result: StockResult): string[] {
  const notes: string[] = []
  const moved = result.changes.filter(c => c.applied > 0)
  if (moved.length) notes.push(`Stock reduced: ${moved.map(c => `${c.name} ${c.before} to ${c.after}`).join(', ')}.`)
  const short = result.changes.filter(c => c.applied < c.requested)
  if (short.length) notes.push(`Not enough stock for: ${short.map(c => `${c.name} (needed ${c.requested}, had ${c.before})`).join(', ')}. Stock is now 0 for ${short.length === 1 ? 'it' : 'them'}.`)
  if (result.missing.length) notes.push(`Not in Inventory under that name, so stock was not changed: ${result.missing.join(', ')}.`)
  return notes
}
