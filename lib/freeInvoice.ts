// The free invoice generator on the tax-by-country pages. Pure maths and per-country defaults, no server.
// Default rates are the standard rate; the visitor can change them, and the page says rates change.

export interface GeneratorConfig {
  currency: string
  taxLabel: string
  rate: number
  rateNote: string
}

export const GENERATOR_CONFIG: Record<string, GeneratorConfig> = {
  india: { currency: 'Rs ', taxLabel: 'GST', rate: 18, rateNote: 'Main GST rates are 5% and 18%. Change it to match what you sell.' },
  'united-kingdom': { currency: '£', taxLabel: 'VAT', rate: 20, rateNote: 'Standard VAT is 20%. Most food is 0%. Change it to match what you sell.' },
  uae: { currency: 'AED ', taxLabel: 'VAT', rate: 5, rateNote: 'Standard VAT is 5%. Some supplies are 0%.' },
  singapore: { currency: 'S$', taxLabel: 'GST', rate: 9, rateNote: 'GST is 9%. Only GST-registered businesses charge it.' },
  australia: { currency: 'A$', taxLabel: 'GST', rate: 10, rateNote: 'GST is 10%. Some food and health items are GST-free.' },
  canada: { currency: 'C$', taxLabel: 'GST/HST', rate: 5, rateNote: 'Federal GST is 5%. Your province may add PST or use HST. Enter the combined rate.' },
  'united-states': { currency: '$', taxLabel: 'Sales tax', rate: 0, rateNote: 'US sales tax depends on the state. Enter your state and local rate.' },
  'new-zealand': { currency: 'NZ$', taxLabel: 'GST', rate: 15, rateNote: 'GST is 15%.' },
}

export interface InvoiceLine {
  desc: string
  qty: number
  price: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function computeInvoice(lines: InvoiceLine[], ratePercent: number) {
  const clean = lines.filter(l => Number.isFinite(l.qty) && Number.isFinite(l.price) && l.qty > 0 && l.price >= 0)
  const subtotal = round2(clean.reduce((s, l) => s + l.qty * l.price, 0))
  const rate = Number.isFinite(ratePercent) && ratePercent > 0 ? ratePercent : 0
  const tax = round2((subtotal * rate) / 100)
  return { subtotal, tax, total: round2(subtotal + tax), rate }
}

export function money(currency: string, n: number): string {
  return currency + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
