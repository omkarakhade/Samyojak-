// Default sales tax by invoice currency, so an invoice in pounds gets VAT and one in rupees gets GST.
// These are STANDARD national rates used only as a starting point; the owner can set any rate on the invoice.
// US sales tax differs by state and city, so the default there is none and the owner states the rate.

export interface TaxRule {
  system: string // shown on the invoice, e.g. "GST (India)"
  label: string // short label, e.g. "GST"
  rate: number // percent
}

const RULES: Record<string, TaxRule> = {
  INR: { system: 'GST (India)', label: 'GST', rate: 18 },
  GBP: { system: 'VAT (UK)', label: 'VAT', rate: 20 },
  EUR: { system: 'VAT (EU)', label: 'VAT', rate: 20 },
  AED: { system: 'VAT (UAE)', label: 'VAT', rate: 5 },
  SGD: { system: 'GST (Singapore)', label: 'GST', rate: 9 },
  AUD: { system: 'GST (Australia)', label: 'GST', rate: 10 },
  CAD: { system: 'GST (Canada)', label: 'GST', rate: 5 },
  NZD: { system: 'GST (New Zealand)', label: 'GST', rate: 15 },
  USD: { system: 'Sales tax (US)', label: 'Sales tax', rate: 0 },
}

export const DEFAULT_RULE = RULES.INR

/** Rule for a currency code like "GBP". Unknown or missing currency means the home market (India, GST 18%). */
export function taxRuleFor(currency: unknown): TaxRule {
  const code = String(currency ?? '').trim().toUpperCase()
  return RULES[code] || DEFAULT_RULE
}
