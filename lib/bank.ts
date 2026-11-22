// Bank reconciliation: match the lines of a bank statement against the money moves in the books.
// A statement line is money in (positive) or out (negative). A book move is a cash/bank entry from the
// ledger. A line matches a move with the same signed amount within a few days; each is used once.

import type { Entry } from '@/lib/ledger'

type Row = { id: string; data: Record<string, any> }

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v ?? '').trim()
  const neg = /^\(.*\)$/.test(s) || /dr\b/i.test(s)
  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? (neg ? -Math.abs(n) : n) : 0
}
const iso = (v: unknown) => {
  const s = String(v ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/.exec(s) // 15/11/2026 (day first, as banks print it)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return ''
}
const round = (n: number) => Math.round(n * 100) / 100
const days = (a: string, b: string) => Math.abs(Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000))

export interface StatementLine {
  id: string
  date: string
  description: string
  amount: number
}

/** Statement rows with one Amount column (negative = out) or separate Credit / Debit (Withdrawal / Deposit) columns. */
export function statementLines(rows: Row[]): StatementLine[] {
  const out: StatementLine[] = []
  for (const r of rows || []) {
    const d = r.data
    const date = iso(d['Date'] ?? d['Transaction Date'] ?? d['Value Date'])
    if (!date) continue
    let amount = num(d['Amount'])
    if (!amount) {
      const cr = num(d['Credit'] ?? d['Deposit'] ?? d['Deposits'])
      const dr = num(d['Debit'] ?? d['Withdrawal'] ?? d['Withdrawals'])
      amount = Math.abs(cr) - Math.abs(dr)
    }
    if (!amount) continue
    out.push({ id: r.id, date, description: String(d['Description'] ?? d['Narration'] ?? d['Details'] ?? '').trim(), amount: round(amount) })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export interface BookMove {
  date: string
  memo: string
  amount: number
}

/** Cash and bank entries from the ledger, as signed money moves. */
export function bookMoves(entries: Entry[], cashAccount: string): BookMove[] {
  return entries
    .filter(e => e.account === cashAccount && e.date)
    .map(e => ({ date: e.date, memo: e.memo, amount: round(e.debit - e.credit) }))
    .filter(m => m.amount !== 0)
}

export interface Reconciliation {
  matched: { line: StatementLine; move: BookMove }[]
  /** In the bank but not in the books: record these. */
  bankOnly: StatementLine[]
  /** In the books but not in the bank: not cleared yet, or recorded wrongly. */
  booksOnly: BookMove[]
  statementTotal: number
  matchedTotal: number
}

export function reconcile(lines: StatementLine[], moves: BookMove[], windowDays = 5): Reconciliation {
  const used = new Set<number>()
  const matched: { line: StatementLine; move: BookMove }[] = []
  const bankOnly: StatementLine[] = []
  for (const line of lines) {
    let best = -1
    let bestGap = Infinity
    moves.forEach((m, i) => {
      if (used.has(i) || Math.abs(m.amount - line.amount) > 0.009) return
      const gap = days(m.date, line.date)
      if (gap <= windowDays && gap < bestGap) { best = i; bestGap = gap }
    })
    if (best >= 0) { used.add(best); matched.push({ line, move: moves[best] }) }
    else bankOnly.push(line)
  }
  // Only book moves inside the statement's dates can be compared fairly.
  const from = lines.length ? lines[0].date : ''
  const to = lines.length ? lines[lines.length - 1].date : ''
  const booksOnly = moves.filter((m, i) => !used.has(i) && from && m.date >= from && m.date <= to)
  return {
    matched,
    bankOnly,
    booksOnly,
    statementTotal: round(lines.reduce((s, l) => s + l.amount, 0)),
    matchedTotal: round(matched.reduce((s, m) => s + m.line.amount, 0)),
  }
}
