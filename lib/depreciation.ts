// Straight-line depreciation for assets that have a Useful Life Years. Pure maths, no storage.
// Monthly charge = (cost - salvage value) / (life x 12), counted in whole months from the purchase date.

type Row = { id: string; data: Record<string, any> }

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const iso = (v: unknown) => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''))
  return m ? m[1] : ''
}
const round = (n: number) => Math.round(n * 100) / 100

export function wholeMonths(from: string, to: string): number {
  const a = /^(\d{4})-(\d{2})-(\d{2})/.exec(from)
  const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(to)
  if (!a || !b) return 0
  let m = (Number(b[1]) - Number(a[1])) * 12 + (Number(b[2]) - Number(a[2]))
  if (Number(b[3]) < Number(a[3])) m--
  return Math.max(0, m)
}

export interface DepreciationLine {
  asset: string
  cost: number
  lifeYears: number
  salvage: number
  monthly: number
  accumulated: number
  bookValue: number
  /** Months left before the asset is fully written down. */
  monthsLeft: number
  purchaseDate: string
}

export function depreciationFor(rows: Row[], asOf: string): DepreciationLine[] {
  const out: DepreciationLine[] = []
  for (const r of rows || []) {
    const d = r.data
    const cost = num(d['Purchase Cost'] ?? d['Cost'])
    const life = num(d['Useful Life Years'] ?? d['Useful Life'] ?? d['Life Years'])
    const date = iso(d['Purchase Date'])
    if (!(cost > 0) || !(life > 0) || !date) continue
    if (/^(sold|retired|disposed)$/i.test(String(d['Status'] ?? '').trim())) continue
    const salvage = Math.min(cost, Math.max(0, num(d['Salvage Value'] ?? d['Residual Value'])))
    const depreciable = cost - salvage
    const totalMonths = Math.round(life * 12)
    const monthly = depreciable / totalMonths
    const elapsed = Math.min(totalMonths, wholeMonths(date, asOf))
    const accumulated = round(monthly * elapsed)
    out.push({
      asset: String(d['Asset Name'] ?? d['Name'] ?? 'Asset'),
      cost,
      lifeYears: life,
      salvage,
      monthly: round(monthly),
      accumulated,
      bookValue: round(cost - accumulated),
      monthsLeft: totalMonths - elapsed,
      purchaseDate: date,
    })
  }
  out.sort((a, b) => b.cost - a.cost)
  return out
}
