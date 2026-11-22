// Receiving goods against a purchase order: the quantity is added to Inventory, once.
// Undo takes exactly that quantity out again. Every function takes a userId from a VERIFIED session.

import { storeCreate } from '@/lib/store'
import { adjustStockItems } from '@/lib/stockSync'

function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const fmt = (n: number) => String(Math.round(n * 100) / 100)
const clean = (s: string) => s.replace(/[;:]/g, ' ').trim()

export interface ReceiptPost {
  qty: number
  notes: string[]
  /** What was really added, kept on the order so undo can reverse it: "Steel sheet:100". */
  text: string
}

export async function receivePurchase(userId: string, po: Record<string, any>, qtyOverride?: number): Promise<ReceiptPost> {
  const item = String(po['Item'] ?? po['Item Name'] ?? po['Product'] ?? '').trim()
  const qty = Math.round((qtyOverride && qtyOverride > 0 ? qtyOverride : toNum(po['Quantity'] ?? po['Qty'])) * 100) / 100
  const result: ReceiptPost = { qty: 0, notes: [], text: '' }
  if (po['Stock Received']) {
    result.notes.push('Stock for this order was already added, so I did not add it again.')
    return result
  }
  if (!item || !(qty > 0)) {
    result.notes.push('This order has no item or quantity, so stock was not changed. Tell me what arrived, for example "received 100 steel sheets".')
    return result
  }
  const r = await adjustStockItems(userId, [{ name: item, qty }], 1)
  if (r.missing.length) {
    const today = new Date().toISOString().split('T')[0]
    await storeCreate(userId, [{
      fields: {
        'User ID': userId,
        Module: 'Inventory',
        'Record Data': JSON.stringify({
          _meta: { source: 'purchase', importedAt: new Date().toISOString() },
          'Item Name': item,
          'Current Stock': qty,
        }),
        Source: 'purchase',
        'Created At': today,
      },
    }])
    result.notes.push(`${fmt(qty)} ${item} received (new Inventory item).`)
  } else {
    const c = r.changes[0]
    result.notes.push(`${fmt(qty)} ${item} received into stock${c ? ` (${fmt(c.before)} to ${fmt(c.after)})` : ''}.`)
  }
  result.qty = qty
  result.text = `${clean(item)}:${fmt(qty)}`
  return result
}

/** Take a receipt back out of stock. Returns how many items were changed. */
export async function reverseReceipt(userId: string, text: unknown): Promise<number> {
  if (typeof text !== 'string' || !text.trim()) return 0
  const items: { name: string; qty: number }[] = []
  for (const part of text.split(';')) {
    const i = part.lastIndexOf(':')
    if (i <= 0) continue
    const qty = toNum(part.slice(i + 1))
    const name = part.slice(0, i).trim()
    if (name && qty > 0) items.push({ name, qty })
  }
  if (!items.length) return 0
  const r = await adjustStockItems(userId, items, -1)
  return r.changes.length
}
