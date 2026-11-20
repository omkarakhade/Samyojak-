/**
 * Line items on an invoice, stored as one readable text field so they survive CSV import,
 * the AI agent and the table view:  "Laptop x2 @50000; Mouse x5 @500"
 */

export interface LineItem {
  name: string
  qty: number
  price: number
}

function num(v: string | undefined): number {
  if (!v) return 0
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

const PRICE = String.raw`(?:\s*(?:@|at)\s*([\d,]+(?:\.\d+)?))?`
// "Laptop x2 @50000", "Laptop x 2 at 50,000", "Mouse x5"
const NAME_THEN_QTY = new RegExp(String.raw`^(.+?)\s*[x×*]\s*(\d+(?:\.\d+)?)${PRICE}$`, 'i')
// "2 x Laptop @50000"
const QTY_THEN_NAME = new RegExp(String.raw`^(\d+(?:\.\d+)?)\s*[x×*]\s*(.+?)${PRICE}$`, 'i')

/** Reads the text format above. Anything it can not read as a quantity becomes one unit of that name. */
export function parseLineItems(text: unknown): LineItem[] {
  if (typeof text !== 'string' || !text.trim()) return []
  const items: LineItem[] = []
  for (const raw of text.split(/[;\n|]+/)) {
    const part = raw.trim()
    if (!part) continue
    let m = part.match(NAME_THEN_QTY)
    if (m) {
      items.push({ name: m[1].trim(), qty: num(m[2]), price: num(m[3]) })
      continue
    }
    m = part.match(QTY_THEN_NAME)
    if (m) {
      items.push({ name: m[2].trim(), qty: num(m[1]), price: num(m[3]) })
      continue
    }
    const priceOnly = part.match(new RegExp(String.raw`^(.+?)${PRICE}$`, 'i'))
    items.push({ name: (priceOnly ? priceOnly[1] : part).trim(), qty: 1, price: priceOnly ? num(priceOnly[2]) : 0 })
  }
  return items.filter(i => i.name && i.qty > 0).slice(0, 50)
}

export function lineItemsTotal(items: LineItem[]): number {
  return items.reduce((t, i) => t + i.qty * i.price, 0)
}

/** Same item written differently ("Laptop", "laptop ") must count as one. */
export function itemKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}
