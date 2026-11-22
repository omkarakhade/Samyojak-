// Repeating invoices (monthly maintenance, rent, retainers). Pure date maths, no storage.
// A Recurring Invoices record says who to bill, how much, how often, and the next date to bill.

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

/** Add one billing period to a YYYY-MM-DD date. Month ends are kept (31 Jan + 1 month = 28/29 Feb). */
export function nextBillingDate(date: string, frequency: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date))
  if (!m) return date
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const day = Number(m[3])
  const f = String(frequency || 'monthly').toLowerCase()
  const add = /week/.test(f) ? { days: 7 } : /quarter/.test(f) ? { months: 3 } : /year|annual/.test(f) ? { months: 12 } : { months: 1 }
  if ('days' in add) {
    const d = new Date(Date.UTC(y, mo, day + add.days))
    return d.toISOString().slice(0, 10)
  }
  const total = mo + add.months
  const ty = y + Math.floor(total / 12)
  const tm = ((total % 12) + 12) % 12
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate()
  const d = new Date(Date.UTC(ty, tm, Math.min(day, last)))
  return d.toISOString().slice(0, 10)
}

export interface DueRecurring {
  id: string
  client: string
  amount: number
  description: string
  frequency: string
  dueDate: string
  /** How many billing dates have passed without an invoice (1 = just this one). */
  missed: number
  nextAfter: string
}

const inactive = (v: unknown) => /^(paused|ended|stopped|cancelled|canceled|inactive|done)$/i.test(String(v ?? '').trim())

/** Recurring bills whose date has come. Only one invoice per bill is proposed, but missed periods are counted so the owner can see. */
export function dueRecurring(rows: Row[], today: string): DueRecurring[] {
  const out: DueRecurring[] = []
  for (const r of rows) {
    const d = r.data
    const statusK = pick(d, 'Status', /status/i)
    if (statusK && inactive(d[statusK])) continue
    const clientK = pick(d, 'Client Name', /client|customer|name/i)
    const dateK = pick(d, 'Next Date', /next.*(date|bill)|due/i)
    const amountK = pick(d, 'Amount', /amount|price|fee/i)
    if (!clientK || !dateK || !amountK) continue
    const client = String(d[clientK] ?? '').trim()
    const dueDate = String(d[dateK] ?? '').slice(0, 10)
    const amount = num(d[amountK])
    if (!client || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !(amount > 0) || dueDate > today) continue
    const freqK = pick(d, 'Frequency', /frequen|every|repeat/i)
    const frequency = freqK ? String(d[freqK] || 'Monthly') : 'Monthly'
    const descK = pick(d, 'Description', /descr|item|line|service/i)
    let next = nextBillingDate(dueDate, frequency)
    let missed = 1
    while (next <= today && missed < 60) {
      next = nextBillingDate(next, frequency)
      missed++
    }
    out.push({ id: r.id, client, amount, description: descK ? String(d[descK] ?? '') : '', frequency, dueDate, missed, nextAfter: next })
  }
  out.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  return out
}

/** Money coming in every month from active recurring bills (yearly and quarterly spread out). */
export function monthlyRecurringTotal(rows: Row[]): number {
  let total = 0
  for (const r of rows) {
    const d = r.data
    const statusK = pick(d, 'Status', /status/i)
    if (statusK && inactive(d[statusK])) continue
    const amountK = pick(d, 'Amount', /amount|price|fee/i)
    if (!amountK) continue
    const freqK = pick(d, 'Frequency', /frequen|every|repeat/i)
    const f = freqK ? String(d[freqK]).toLowerCase() : 'monthly'
    const amt = num(d[amountK])
    total += /week/.test(f) ? (amt * 52) / 12 : /quarter/.test(f) ? amt / 3 : /year|annual/.test(f) ? amt / 12 : amt
  }
  return Math.round(total)
}
