// GST return figures for one month, worked out from invoices and expenses already recorded.
// This PREPARES the numbers (like a GSTR-1 summary and a GSTR-3B tax line); it does not file anything:
// filing is done on the GST portal. Invoices with a GSTIN are B2B (business buyers), the rest B2C.
// Splitting tax into CGST / SGST / IGST depends on the place of supply, which is not recorded here.

type Row = { id: string; data: Record<string, any> }

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const round = (n: number) => Math.round(n * 100) / 100
const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/i

export interface GstSummary {
  month: string
  b2b: { invoices: number; taxable: number; tax: number }
  b2c: { invoices: number; taxable: number; tax: number }
  outputTax: number
  inputCredit: number
  /** Positive: tax to pay. Negative: credit carried forward. */
  netPayable: number
  /** Business buyers whose GSTIN looks wrong, so the return could be rejected. */
  badGstin: string[]
  /** Invoices in the month with no tax recorded at all. */
  noTax: number
  clients: { client: string; gstin: string; invoices: number; taxable: number; tax: number }[]
}

export function gstSummary(invoices: Row[], expenses: Row[], month: string): GstSummary {
  const s: GstSummary = {
    month,
    b2b: { invoices: 0, taxable: 0, tax: 0 },
    b2c: { invoices: 0, taxable: 0, tax: 0 },
    outputTax: 0,
    inputCredit: 0,
    netPayable: 0,
    badGstin: [],
    noTax: 0,
    clients: [],
  }
  const byClient = new Map<string, { client: string; gstin: string; invoices: number; taxable: number; tax: number }>()
  for (const r of invoices || []) {
    const d = r.data
    const date = String(d['Issue Date'] ?? d['Date'] ?? d['Invoice Date'] ?? '').slice(0, 7)
    if (date !== month) continue
    const taxable = num(d['Amount'] ?? d['Total'])
    if (!(taxable > 0)) continue
    const tax = num(d['Tax Amount'])
    const gstin = String(d['GSTIN'] ?? '').trim().toUpperCase()
    const client = String(d['Client Name'] ?? d['Client'] ?? d['Customer'] ?? 'Customer').trim()
    if (tax <= 0) s.noTax++
    if (gstin) {
      s.b2b.invoices++
      s.b2b.taxable += taxable
      s.b2b.tax += tax
      if (!GSTIN.test(gstin) && !s.badGstin.includes(client)) s.badGstin.push(client)
      const cur = byClient.get(client.toLowerCase() + gstin) || { client, gstin, invoices: 0, taxable: 0, tax: 0 }
      cur.invoices++
      cur.taxable += taxable
      cur.tax += tax
      byClient.set(client.toLowerCase() + gstin, cur)
    } else {
      s.b2c.invoices++
      s.b2c.taxable += taxable
      s.b2c.tax += tax
    }
  }
  for (const r of expenses || []) {
    const d = r.data
    const date = String(d['Date'] ?? d['Bill Date'] ?? d['Expense Date'] ?? '').slice(0, 7)
    if (date !== month) continue
    s.inputCredit += num(d['GST Amount'] ?? d['Tax Amount'] ?? d['GST'] ?? d['Input Tax'])
  }
  s.b2b = { invoices: s.b2b.invoices, taxable: round(s.b2b.taxable), tax: round(s.b2b.tax) }
  s.b2c = { invoices: s.b2c.invoices, taxable: round(s.b2c.taxable), tax: round(s.b2c.tax) }
  s.outputTax = round(s.b2b.tax + s.b2c.tax)
  s.inputCredit = round(s.inputCredit)
  s.netPayable = round(s.outputTax - s.inputCredit)
  s.clients = Array.from(byClient.values()).map(c => ({ ...c, taxable: round(c.taxable), tax: round(c.tax) })).sort((a, b) => b.taxable - a.taxable)
  return s
}
