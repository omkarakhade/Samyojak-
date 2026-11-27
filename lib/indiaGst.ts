// India GST by item, for invoices made by chat. Rates are the ones in force since 22 September 2025 ("GST 2.0"):
// main rates 5% and 18%, 0% on some essentials, 40% on a few luxury and sin goods, 3% on gold jewellery.
// Only items we are sure about are listed. Anything else stays at the standard 18% and the owner can change it.
// This is a helper, not tax advice: borderline items should be confirmed with a CA.

import { parseLineItems } from '@/lib/lineItems'

interface Rule {
  re: RegExp
  rate: number
  label: string
  /** Clothes and shoes: 5% up to this price per piece or pair, 18% above. */
  threshold?: number
}

// Order matters: the first match wins, so specific words come before general ones.
const RULES: Rule[] = [
  { re: /\b(cold drinks?|soft drinks?|cola|aerated|energy drinks?|cigarettes?|pan masala|gutka|gutkha|tobacco)\b/i, rate: 40, label: 'cold drinks and tobacco products' },
  { re: /\b(chocolates?|biscuits?|cookies?|cakes?|namkeen|bhujia|ghee|butter|cheese|toothpaste|toothbrush|soaps?|shampoo|hair oil|pasta|noodles|jam|sauces?|sugar|tea|coffee|edible oil|mustard oil|sunflower oil|groundnut oil|coconut oil|cooking oil|bicycles?|steel utensils?)\b/i, rate: 5, label: 'everyday packaged goods' },
  { re: /\b(milk|bread|paneer|sanitary pads?|fresh vegetables?|fresh fruits?)\b/i, rate: 0, label: 'basic food items' },
  { re: /\b(gold jewell?ery|gold chains?|gold rings?|gold necklaces?)\b/i, rate: 3, label: 'gold jewellery' },
  {
    re: /\b(dress(es)?|kurtas?|kurtis?|sarees?|saris?|lehengas?|shirts?|t-?shirts?|tees?|trousers?|pants?|jeans|skirts?|tops?|salwars?|suits?|jackets?|sweaters?|hoodies?|shorts|leggings|dupattas?|blouses?|uniforms?|garments?|clothes|clothing|shoes?|sandals?|chappals?|slippers?|sneakers?|boots?|footwear)\b/i,
    rate: 5,
    label: 'clothes and footwear',
    threshold: 2500,
  },
  { re: /\b(mobiles?|mobile phones?|smartphones?|phones?|iphone|laptops?|computers?|tablets?|chargers?|batteries|battery|tv|televisions?|air conditioners?|ac|dishwashers?|refrigerators?|fridges?|washing machines?|printers?|monitors?|cement|paints?|furniture|tables?|chairs?|sofas?|wires?|switches|taps?)\b/i, rate: 18, label: 'electronics, furniture and hardware' },
]

export interface GstGuess {
  rate: number
  why: string
}

/** The GST rate for one item, or null when we are not sure (the owner's default of 18% then applies). */
export function gstRateForItem(name: string, unitPrice = 0): GstGuess | null {
  const n = String(name || '')
  for (const r of RULES) {
    if (!r.re.test(n)) continue
    if (r.threshold) {
      if (unitPrice > 0) {
        return unitPrice <= r.threshold
          ? { rate: 5, why: `${r.label} up to ₹${r.threshold.toLocaleString('en-IN')} each are 5%` }
          : { rate: 18, why: `${r.label} above ₹${r.threshold.toLocaleString('en-IN')} each are 18%` }
      }
      return null
    }
    return { rate: r.rate, why: `${r.label} are ${r.rate}%` }
  }
  return null
}

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/**
 * For an invoice in rupees with line items and no tax rate chosen, works out the GST from what was sold.
 * Several different rates on one invoice give one blended rate, so the tax total stays correct.
 * Returns null when nothing is recognised, so the normal 18% default stays.
 */
export function suggestInvoiceRate(rec: Record<string, any>): { rate: number; note: string } | null {
  const cur = String(rec['Currency'] ?? '').trim().toUpperCase()
  if (cur && cur !== 'INR') return null
  if (rec['Tax Rate'] !== undefined && String(rec['Tax Rate']).trim() !== '') return null
  if (rec['Tax Amount'] !== undefined && String(rec['Tax Amount']).trim() !== '') return null
  const lines = parseLineItems(rec['Line Items'])
  if (lines.length === 0) return null

  const amount = num(rec['Amount'])
  const totalQty = lines.reduce((s, l) => s + (l.qty > 0 ? l.qty : 1), 0)
  const priced = lines.map(l => {
    const qty = l.qty > 0 ? l.qty : 1
    let price = l.price
    if (!(price > 0) && lines.length === 1 && amount > 0) price = amount / totalQty
    return { name: l.name, qty, price }
  })

  let matched = 0
  const used = new Map<number, string>()
  let tax = 0
  let base = 0
  for (const l of priced) {
    const g = gstRateForItem(l.name, l.price)
    const rate = g ? g.rate : 18
    if (g) { matched++; if (!used.has(rate)) used.set(rate, g.why) }
    else if (!used.has(18)) used.set(18, 'other items are 18%')
    const value = l.price > 0 ? l.qty * l.price : 0
    base += value
    tax += (value * rate) / 100
  }
  if (matched === 0) return null

  let rate: number
  if (used.size === 1) rate = Array.from(used.keys())[0]
  else if (base > 0) rate = Math.round((tax / base) * 10000) / 100
  else return null

  const why = Array.from(used.values()).join('; ')
  const rateText = used.size === 1 ? `${rate}%` : `about ${rate}% in all (mixed rates)`
  return {
    rate,
    note: `I used GST ${rateText} because ${why}. Say a different rate if yours is not that, "including tax" if the amount you gave is the final price, or "no tax" for none. If unsure about an item, check with your CA.`,
  }
}

/** Plain-language GST guide for the assistants (kept short: every word is paid for on every call). */
export const GST_GUIDE = `INDIA GST (rates in force since 22 September 2025; for borderline items tell the owner to confirm with a CA):
- Main rates are 5% and 18%. Some basic foods are 0%, gold jewellery is 3%, cold drinks, cigarettes and pan masala are 40%. The old 12% and 28% rates no longer apply.
- Clothes and footwear: 5% when the price is up to Rs 2,500 per piece or pair, 18% above that. So a Rs 1,500 dress is 5% and a Rs 3,000 dress is 18%.
- Mobile phones, laptops, TVs, air conditioners, furniture, cement and paints are 18%. Biscuits, chocolate, soap, toothpaste, shampoo, ghee, butter and namkeen are 5%. Fresh and UHT milk, bread and packaged paneer are 0%.
- Most services (consulting, web design, repairs, marketing) are 18%. Education and health care are exempt.
- GST on a SALE (output tax) is collected from the customer and belongs to the government. GST on a PURCHASE (input tax, shown on the supplier's bill) can be claimed back. Each month the owner pays output tax minus input tax; if input is more, the extra carries forward. Selling and buying can have different rates, which is normal. The GST summary in Reports prepares these figures; filing is on the GST portal.
- A GST invoice needs the seller's GSTIN, the buyer's GSTIN for business sales, and an HSN code for goods. If the owner does not know a rate, give the one above and say it is the current standard rate.`
