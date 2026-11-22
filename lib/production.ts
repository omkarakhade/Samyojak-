// When a production job is finished: parts listed in its bill of materials are used up in Inventory,
// and the finished goods are added. Undo reverses exactly what was posted.
// Every function takes a userId from a VERIFIED session and only touches that user's records.

import { storeList, storeCreate } from '@/lib/store'
import { adjustStockItems } from '@/lib/stockSync'
import { bomComponents, findBomRow } from '@/lib/productionPlan'

function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export interface ProductionPost {
  /** Units newly posted by this call (made now minus already posted before). */
  delta: number
  notes: string[]
  /** What was really moved, stored on the job so undo can reverse it: "C:Steel sheet:960; P:Bracket:480". */
  text: string
}

async function loadModule(userId: string, module: string) {
  const records = await storeList(userId, [module], { max: 2000 })
  const rows: { id: string; data: Record<string, any> }[] = []
  for (const r of records) {
    try {
      const parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
      const { _meta, ...data } = parsed
      rows.push({ id: r.id, data })
    } catch {
      /* skip unreadable record */
    }
  }
  return rows
}

const clean = (s: string) => s.replace(/[;:]/g, ' ').trim()
const fmt = (n: number) => String(Math.round(n * 100) / 100)

export async function postProduction(userId: string, job: Record<string, any>, madeTotal: number): Promise<ProductionPost> {
  const product = String(job['Product'] ?? '').trim()
  const already = toNum(job['Stock Posted Qty'])
  const delta = Math.round((madeTotal - already) * 100) / 100
  const result: ProductionPost = { delta, notes: [], text: '' }
  if (!product || !(delta > 0)) return result

  const parts: string[] = []
  const boms = await loadModule(userId, 'Bills of Materials')
  const bom = findBomRow(boms, product)
  const comps = bom ? bomComponents(bom.data) : []

  if (comps.length === 0) {
    result.notes.push(`There is no bill of materials for ${product}, so no materials were used up. Tell me what goes into one ${product} and I will track it next time.`)
  } else {
    const used = await adjustStockItems(userId, comps.map(c => ({ name: c.name, qty: c.qty * delta })), -1)
    const taken = used.changes.filter(c => c.applied > 0)
    if (taken.length) {
      result.notes.push(`Materials used for ${fmt(delta)} ${product}: ${taken.map(c => `${c.name} ${fmt(c.applied)} (stock ${fmt(c.before)} to ${fmt(c.after)})`).join(', ')}.`)
      for (const c of taken) parts.push(`C:${clean(c.name)}:${fmt(c.applied)}`)
    }
    const short = used.changes.filter(c => c.applied < c.requested)
    if (short.length) result.notes.push(`Not enough stock for: ${short.map(c => `${c.name} (needed ${fmt(c.requested)}, had ${fmt(c.before)})`).join(', ')}. Stock for ${short.length === 1 ? 'it is' : 'them is'} now 0, so please check what was really used.`)
    if (used.missing.length) result.notes.push(`Not in Inventory, so not reduced: ${used.missing.join(', ')}.`)
  }

  const made = await adjustStockItems(userId, [{ name: product, qty: delta }], 1)
  if (made.missing.length) {
    // First time this product is made: it becomes an Inventory item, so there is nothing to set up.
    const today = new Date().toISOString().split('T')[0]
    await storeCreate(userId, [{
      fields: {
        'User ID': userId,
        Module: 'Inventory',
        'Record Data': JSON.stringify({
          _meta: { source: 'production', importedAt: new Date().toISOString() },
          'Item Name': product,
          'Current Stock': delta,
        }),
        Source: 'production',
        'Created At': today,
      },
    }])
    result.notes.push(`${fmt(delta)} ${product} added to stock (new Inventory item).`)
  } else {
    const c = made.changes[0]
    if (c) result.notes.push(`${fmt(delta)} ${product} added to stock (${fmt(c.before)} to ${fmt(c.after)}).`)
  }
  parts.push(`P:${clean(product)}:${fmt(delta)}`)
  result.text = parts.join('; ').slice(0, 450)
  return result
}

/** Put stock back exactly as postProduction moved it. Returns how many items were changed. */
export async function reverseProduction(userId: string, text: unknown): Promise<number> {
  if (typeof text !== 'string' || !text.trim()) return 0
  const used: { name: string; qty: number }[] = []
  const made: { name: string; qty: number }[] = []
  for (const part of text.split(';')) {
    const bits = part.trim().split(':')
    if (bits.length < 3) continue
    const qty = toNum(bits[bits.length - 1])
    const name = bits.slice(1, -1).join(':').trim()
    if (!name || !(qty > 0)) continue
    if (bits[0] === 'C') used.push({ name, qty })
    else if (bits[0] === 'P') made.push({ name, qty })
  }
  let changed = 0
  if (used.length) changed += (await adjustStockItems(userId, used, 1)).changes.length
  if (made.length) changed += (await adjustStockItems(userId, made, -1)).changes.length
  return changed
}
