// Tax on invoices created by chat, matching what the manual Create Invoice form records:
// Amount (before tax), Tax Rate, Tax Amount, Total. The default rate follows the invoice currency
// (India GST 18%, UK VAT 20%, and so on, see lib/taxRules.ts); the owner can change it.

import { taxRuleFor, DEFAULT_RULE } from '@/lib/taxRules'

export const DEFAULT_TAX_RATE = DEFAULT_RULE.rate

function num(v: unknown): number {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : NaN
}

/** Returns a copy of an invoice record with tax fields filled in. Records that already have a tax rate are left alone. */
export function withInvoiceTax(rec: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = { ...rec }
  const inclusive = /^(yes|true|inclusive)$/i.test(String(out['Tax Inclusive'] ?? '').trim())
  delete out['Tax Inclusive']
  if (out['Tax Amount'] !== undefined && out['Tax Amount'] !== '') return out
  const amount = num(out['Amount'])
  if (!(amount > 0)) return out
  const rule = taxRuleFor(out['Currency'])
  let rate = num(out['Tax Rate'])
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) rate = rule.rate
  const net = inclusive ? Math.round(amount / (1 + rate / 100)) : amount
  const tax = Math.round((net * rate) / 100)
  out['Amount'] = net
  out['Tax Rate'] = `${rate}%`
  out['Tax System'] = rule.system
  out['Tax Label'] = rule.label
  out['Tax Amount'] = tax
  out['Total'] = net + tax
  return out
}
