// Support tickets with a response deadline (SLA) by priority. Pure date maths, no storage.
// Dates are whole days: an Urgent ticket is due the day it opens, High the next day, and so on.

type Row = { id: string; data: Record<string, any> }

export const SLA_DAYS: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 5 }

function pick(d: Record<string, any>, exact: string, pattern: RegExp): string | null {
  if (exact in d) return exact
  return Object.keys(d).find(k => pattern.test(k)) || null
}
const iso = (v: unknown) => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''))
  return m ? m[1] : ''
}
const closed = (v: unknown) => /^(resolved|closed|done|cancelled|canceled)$/i.test(String(v ?? '').trim())

function addDays(date: string, n: number): string {
  return new Date(Date.parse(date + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10)
}
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000)
}

export interface TicketLine {
  id: string
  who: string
  subject: string
  priority: string
  status: string
  opened: string
  due: string
  /** Days past the deadline (0 when not late). */
  lateBy: number
  assigned: string
}

/** Tickets still open, worst first: late ones, then by deadline. */
export function openTickets(rows: Row[], today: string): TicketLine[] {
  const out: TicketLine[] = []
  for (const r of rows) {
    const d = r.data
    const st = d[pick(d, 'Status', /status/i) || '']
    if (closed(st)) continue
    const who = String(d[pick(d, 'Customer', /customer|client|name/i) || ''] ?? '').trim()
    const subject = String(d[pick(d, 'Subject', /subject|issue|title|problem/i) || ''] ?? '').trim()
    if (!who && !subject) continue
    const priority = String(d[pick(d, 'Priority', /priority|severity/i) || ''] ?? 'Medium').trim() || 'Medium'
    const opened = iso(d[pick(d, 'Opened', /open|created|date|raised/i) || '']) || today
    const given = iso(d[pick(d, 'Due Date', /due|deadline|sla/i) || ''])
    const days = SLA_DAYS[priority.toLowerCase()] ?? SLA_DAYS.medium
    const due = given || addDays(opened, days)
    out.push({
      id: r.id,
      who,
      subject,
      priority,
      status: String(st ?? 'Open') || 'Open',
      opened,
      due,
      lateBy: Math.max(0, daysBetween(due, today)),
      assigned: String(d[pick(d, 'Assigned To', /assign|owner/i) || ''] ?? '').trim(),
    })
  }
  out.sort((a, b) => b.lateBy - a.lateBy || a.due.localeCompare(b.due))
  return out
}

/** Requests waiting for the owner's decision. */
export function pendingApprovals(rows: Row[]): { id: string; what: string; by: string; amount: number; date: string }[] {
  const out: { id: string; what: string; by: string; amount: number; date: string }[] = []
  for (const r of rows) {
    const d = r.data
    if (!/^pending$/i.test(String(d[pick(d, 'Status', /status/i) || ''] ?? '').trim())) continue
    const what = String(d[pick(d, 'Request', /request|what|subject|title/i) || ''] ?? '').trim()
    if (!what) continue
    const amt = parseFloat(String(d[pick(d, 'Amount', /amount|value/i) || ''] ?? '').replace(/[^0-9.\-]/g, ''))
    out.push({
      id: r.id,
      what,
      by: String(d[pick(d, 'Requested By', /requested|by|from/i) || ''] ?? '').trim(),
      amount: Number.isFinite(amt) ? amt : 0,
      date: iso(d[pick(d, 'Date', /date/i) || '']),
    })
  }
  out.sort((a, b) => b.amount - a.amount)
  return out
}
