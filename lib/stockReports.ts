// Stock value, stock by warehouse, batch/serial expiry and warehouse transfers.
// Pure functions over Inventory rows. A warehouse is just the Warehouse field on an Inventory row;
// the same item can have a row in each warehouse. A row with no Warehouse is in "Main".

import { itemKey } from '@/lib/lineItems'

type Row = { id: string; data: Record<string, any> }

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
function pick(d: Record<string, any>, exact: string, pattern: RegExp): string | null {
  if (exact in d) return exact
  return Object.keys(d).find(k => pattern.test(k)) || null
}
const iso = (v: unknown) => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''))
  return m ? m[1] : ''
}
const round = (n: number) => Math.round(n * 100) / 100
export const MAIN = 'Main'

export interface StockLine {
  id: string
  item: string
  warehouse: string
  stock: number
  unitCost: number
  value: number
  /** 'cost' when a Cost Price is recorded, 'price' when only the selling Unit Price is, 'none' otherwise. */
  basis: 'cost' | 'price' | 'none'
  batch: string
  serial: string
  expiry: string
}

export function stockLines(inventory: Row[]): StockLine[] {
  const out: StockLine[] = []
  for (const r of inventory || []) {
    const d = r.data
    const nameK = pick(d, 'Item Name', /item|product|name/i)
    if (!nameK) continue
    const stockK = pick(d, 'Current Stock', /current.*stock|^stock$|quantity|qty/i)
    const costK = pick(d, 'Cost Price', /cost/i)
    const priceK = pick(d, 'Unit Price', /unit.*price|^price$|selling/i)
    const cost = costK ? num(d[costK]) : 0
    const price = priceK ? num(d[priceK]) : 0
    const stock = stockK ? num(d[stockK]) : 0
    const unitCost = cost > 0 ? cost : price
    out.push({
      id: r.id,
      item: String(d[nameK] ?? '').trim(),
      warehouse: String(d['Warehouse'] ?? '').trim() || MAIN,
      stock,
      unitCost,
      value: round(Math.max(0, stock) * unitCost),
      basis: cost > 0 ? 'cost' : price > 0 ? 'price' : 'none',
      batch: String(d['Batch No'] ?? d['Batch'] ?? '').trim(),
      serial: String(d['Serial No'] ?? d['Serial'] ?? '').trim(),
      expiry: iso(d['Expiry Date'] ?? d['Expiry']),
    })
  }
  return out.filter(l => l.item)
}

export interface WarehouseTotal {
  warehouse: string
  items: number
  units: number
  value: number
}

export function byWarehouse(inventory: Row[]): WarehouseTotal[] {
  const map = new Map<string, WarehouseTotal>()
  for (const l of stockLines(inventory)) {
    const key = l.warehouse.toLowerCase()
    const cur = map.get(key) || { warehouse: l.warehouse, items: 0, units: 0, value: 0 }
    cur.items += 1
    cur.units += l.stock
    cur.value = round(cur.value + l.value)
    map.set(key, cur)
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value)
}

/** Batches that are expired or expire within `days`, with stock still on the shelf. */
export function expiring(inventory: Row[], today: string, days = 60): (StockLine & { daysLeft: number })[] {
  const limit = new Date(Date.parse(today + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10)
  return stockLines(inventory)
    .filter(l => l.expiry && l.stock > 0 && l.expiry <= limit)
    .map(l => ({ ...l, daysLeft: Math.round((Date.parse(l.expiry + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export interface TransferPlan {
  ok: boolean
  error?: string
  from?: Row
  to?: Row | null
  fromStock?: number
  toStock?: number
  /** Fields for a new destination row when the item has none there yet. */
  newRow?: Record<string, any>
}

export function planTransfer(inventory: Row[], item: string, fromWh: string, toWh: string, qty: number): TransferPlan {
  const want = itemKey(item)
  const wf = (fromWh || MAIN).trim().toLowerCase()
  const wt = (toWh || MAIN).trim().toLowerCase()
  if (!want) return { ok: false, error: 'Which item should I move?' }
  if (!(qty > 0)) return { ok: false, error: 'How many should I move?' }
  if (wf === wt) return { ok: false, error: 'The from and to warehouses are the same.' }
  const rows = inventory.filter(r => {
    const k = pick(r.data, 'Item Name', /item|product|name/i)
    return k && itemKey(String(r.data[k] ?? '')) === want
  })
  if (rows.length === 0) return { ok: false, error: `I couldn't find "${item}" in Inventory.` }
  const whOf = (r: Row) => (String(r.data['Warehouse'] ?? '').trim() || MAIN).toLowerCase()
  const from = rows.find(r => whOf(r) === wf)
  if (!from) return { ok: false, error: `There is no ${item} in ${fromWh || MAIN}. It is in: ${rows.map(r => String(r.data['Warehouse'] || MAIN)).join(', ')}.` }
  const stockK = pick(from.data, 'Current Stock', /current.*stock|^stock$|quantity|qty/i) || 'Current Stock'
  const have = num(from.data[stockK])
  if (qty > have) return { ok: false, error: `${fromWh || MAIN} only has ${have} ${item}, so I can't move ${qty}.` }
  const to = rows.find(r => whOf(r) === wt) || null
  const toStockK = to ? pick(to.data, 'Current Stock', /current.*stock|^stock$|quantity|qty/i) || 'Current Stock' : 'Current Stock'
  const plan: TransferPlan = { ok: true, from, to, fromStock: round(have - qty), toStock: round((to ? num(to.data[toStockK]) : 0) + qty) }
  if (!to) {
    const copy: Record<string, any> = {}
    for (const k of ['Item Name', 'SKU', 'Category', 'Unit Price', 'Cost Price', 'Reorder Level']) {
      if (from.data[k] !== undefined && String(from.data[k]).trim() !== '') copy[k] = from.data[k]
    }
    copy['Warehouse'] = toWh
    copy['Current Stock'] = qty
    plan.newRow = copy
  }
  return plan
}
