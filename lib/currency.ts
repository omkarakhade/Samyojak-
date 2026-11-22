// Multi-currency without a setup screen. The books are kept in the base currency (rupees).
// An invoice or expense in another currency says so in its Currency field. It is converted with
// its own Exchange Rate field if given, else with the latest rate in the Currency Rates module.

type Row = { id: string; data: Record<string, any> }

export const BASE_CURRENCY = 'INR'

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

const SYMBOLS: Record<string, string> = { '₹': 'INR', rs: 'INR', inr: 'INR', '$': 'USD', usd: 'USD', '€': 'EUR', eur: 'EUR', '£': 'GBP', gbp: 'GBP', aed: 'AED', sgd: 'SGD', aud: 'AUD', cad: 'CAD', jpy: 'JPY', '¥': 'JPY' }

/** "usd", "$", "US Dollar" -> "USD". Empty means the base currency. */
export function currencyCode(v: unknown): string {
  const s = String(v ?? '').trim()
  if (!s) return BASE_CURRENCY
  const low = s.toLowerCase()
  if (SYMBOLS[low]) return SYMBOLS[low]
  if (/dollar/.test(low)) return /australia/.test(low) ? 'AUD' : /canad/.test(low) ? 'CAD' : /singap/.test(low) ? 'SGD' : 'USD'
  if (/rupee/.test(low)) return 'INR'
  if (/euro/.test(low)) return 'EUR'
  if (/pound|sterling/.test(low)) return 'GBP'
  if (/dirham/.test(low)) return 'AED'
  return s.toUpperCase().slice(0, 5)
}

/** Latest rate per currency from the Currency Rates module (rows with a Date are ordered by it). */
export function rateTable(rows: Row[]): Map<string, number> {
  const best = new Map<string, { rate: number; date: string }>()
  for (const r of rows || []) {
    const d = r.data
    const code = currencyCode(d['Currency'] ?? d['Code'])
    const rate = num(d['Rate'] ?? d['Rate to INR'] ?? d['Exchange Rate'])
    if (!(rate > 0) || code === BASE_CURRENCY) continue
    const date = String(d['Date'] ?? '').slice(0, 10)
    const cur = best.get(code)
    if (!cur || date >= cur.date) best.set(code, { rate, date })
  }
  const out = new Map<string, number>()
  best.forEach((v, k) => out.set(k, v.rate))
  return out
}

export interface Conversion {
  currency: string
  rate: number
  /** True when the record is in a foreign currency but no rate is known, so the amount is used as is. */
  missingRate: boolean
}

export function conversionFor(d: Record<string, any>, rates: Map<string, number>): Conversion {
  const currency = currencyCode(d['Currency'])
  if (currency === BASE_CURRENCY) return { currency, rate: 1, missingRate: false }
  const own = num(d['Exchange Rate'])
  if (own > 0) return { currency, rate: own, missingRate: false }
  const known = rates.get(currency)
  if (known) return { currency, rate: known, missingRate: false }
  return { currency, rate: 1, missingRate: true }
}
