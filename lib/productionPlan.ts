// Manufacturing maths with no storage and no network: what the open jobs need, what is short,
// and what a product costs to make. A bill of materials (BOM) lists the parts for ONE unit,
// written like invoice items: "Steel sheet x2; Bolt x8".

import { parseLineItems, itemKey } from '@/lib/lineItems'

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
const isDone = (v: unknown) => /^(done|completed|complete|finished|closed|cancelled|canceled)$/i.test(String(v ?? '').trim())

export interface BomLine {
  name: string
  qty: number
}

export function bomComponents(bom: Record<string, any>): BomLine[] {
  const key = pick(bom, 'Components', /component|material|part|items?/i)
  return key ? parseLineItems(bom[key]).map(i => ({ name: i.name, qty: i.qty })) : []
}

export function findBomRow(boms: Row[], product: string): Row | null {
  const want = itemKey(product)
  if (!want) return null
  for (const r of boms) {
    const k = pick(r.data, 'Product', /product|item|name/i)
    if (k && itemKey(String(r.data[k] ?? '')) === want) return r
  }
  return null
}

interface Stocked {
  name: string
  stock: number
  price: number
}

function stockMap(inventory: Row[]): Map<string, Stocked> {
  const out = new Map<string, Stocked>()
  for (const r of inventory) {
    const nameK = pick(r.data, 'Item Name', /item|product|name/i)
    const stockK = pick(r.data, 'Current Stock', /current.*stock|^stock$|quantity|qty/i)
    if (!nameK) continue
    const priceK = pick(r.data, 'Unit Price', /unit.*price|price|cost/i)
    const key = itemKey(String(r.data[nameK] ?? ''))
    if (!key || out.has(key)) continue
    out.set(key, {
      name: String(r.data[nameK]),
      stock: stockK ? num(r.data[stockK]) : 0,
      price: priceK ? num(r.data[priceK]) : 0,
    })
  }
  return out
}

export interface MaterialNeed {
  name: string
  need: number
  stock: number
  short: number
  inInventory: boolean
}

export interface MaterialPlan {
  needs: MaterialNeed[]
  /** Open jobs whose product has no bill of materials, so their materials are unknown. */
  noBom: string[]
  openJobs: number
}

/** For every job that is not finished: parts still needed (planned minus made) against stock on hand. */
export function materialNeeds(jobs: Row[], boms: Row[], inventory: Row[]): MaterialPlan {
  const stock = stockMap(inventory)
  const need = new Map<string, { name: string; qty: number }>()
  const noBom = new Set<string>()
  let openJobs = 0

  for (const j of jobs) {
    const d = j.data
    const statusK = pick(d, 'Status', /status|stage/i)
    if (statusK && isDone(d[statusK])) continue
    const productK = pick(d, 'Product', /product|item|name/i)
    const product = productK ? String(d[productK] ?? '').trim() : ''
    if (!product) continue
    const plannedK = pick(d, 'Quantity Planned', /planned|target|quantity|qty/i)
    const madeK = pick(d, 'Quantity Made', /made|produced|completed/i)
    const remaining = Math.max(0, (plannedK ? num(d[plannedK]) : 0) - (madeK ? num(d[madeK]) : 0))
    openJobs++
    if (remaining <= 0) continue
    const bom = findBomRow(boms, product)
    const comps = bom ? bomComponents(bom.data) : []
    if (!bom || comps.length === 0) {
      noBom.add(product)
      continue
    }
    for (const c of comps) {
      const key = itemKey(c.name)
      const cur = need.get(key) || { name: c.name, qty: 0 }
      cur.qty += c.qty * remaining
      need.set(key, cur)
    }
  }

  const needs: MaterialNeed[] = []
  need.forEach((v, key) => {
    const s = stock.get(key)
    const have = s ? s.stock : 0
    needs.push({
      name: s ? s.name : v.name,
      need: Math.round(v.qty * 100) / 100,
      stock: have,
      short: Math.max(0, Math.round((v.qty - have) * 100) / 100),
      inInventory: !!s,
    })
  })
  needs.sort((a, b) => b.short - a.short || b.need - a.need)
  return { needs, noBom: Array.from(noBom), openJobs }
}

export interface ProductCost {
  product: string
  material: number
  labour: number
  total: number
  selling: number
  /** Parts that have no price in Inventory, so the cost is understated. */
  unpriced: string[]
}

export function productCosts(boms: Row[], inventory: Row[]): ProductCost[] {
  const stock = stockMap(inventory)
  const out: ProductCost[] = []
  for (const b of boms) {
    const productK = pick(b.data, 'Product', /product|item|name/i)
    const product = productK ? String(b.data[productK] ?? '').trim() : ''
    if (!product) continue
    const labourK = pick(b.data, 'Labour Cost', /labou?r|wages|conversion/i)
    let material = 0
    const unpriced: string[] = []
    for (const c of bomComponents(b.data)) {
      const s = stock.get(itemKey(c.name))
      if (s && s.price > 0) material += s.price * c.qty
      else unpriced.push(c.name)
    }
    const labour = labourK ? num(b.data[labourK]) : 0
    const sold = stock.get(itemKey(product))
    out.push({
      product,
      material: Math.round(material * 100) / 100,
      labour,
      total: Math.round((material + labour) * 100) / 100,
      selling: sold ? sold.price : 0,
      unpriced,
    })
  }
  return out
}
