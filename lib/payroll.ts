// Monthly payroll from what the owner has recorded: HR salaries, Attendance and approved unpaid Leave.
// Pure maths, no storage. Salary is the monthly amount. Pay is cut for absent days only:
// pay = salary x (working days - lost days) / working days, with Sundays as the weekly day off.

import { deductionsFor } from '@/lib/statutory'

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
const norm = (s: unknown) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
const iso = (v: unknown) => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''))
  return m ? m[1] : ''
}

/** The value of the first field on a record whose name matches (exact name first). */
export function fieldValue(d: Record<string, any>, exact: string, pattern: RegExp): unknown {
  const k = pick(d, exact, pattern)
  return k ? d[k] : undefined
}

/** Days in YYYY-MM that are not Sundays. */
export function workingDays(month: string): number {
  const [y, m] = month.split('-').map(Number)
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  let n = 0
  for (let d = 1; d <= days; d++) if (new Date(Date.UTC(y, m - 1, d)).getUTCDay() !== 0) n++
  return n
}

const isSunday = (date: string) => new Date(date + 'T00:00:00Z').getUTCDay() === 0

export interface PayLine {
  employee: string
  salary: number
  workingDays: number
  lostDays: number
  /** Pay for the month after absent days, before deductions. */
  earned: number
  pf: number
  esi: number
  tds: number
  /** Employer's own PF and ESI share, on top of the salary. */
  employer: number
  /** What the person receives. */
  net: number
  note: string
}

export interface Payroll {
  month: string
  lines: PayLine[]
  total: number
  /** Employee deductions plus employer shares: owed to the government (PF, ESI, TDS). */
  dues: number
  noSalary: string[]
}

export function payrollFor(month: string, staff: Row[], attendance: Row[], leaves: Row[]): Payroll {
  const wd = workingDays(month)
  const lost = new Map<string, number>()
  const add = (name: string, n: number) => lost.set(norm(name), (lost.get(norm(name)) || 0) + n)

  for (const a of attendance) {
    const d = a.data
    const date = iso(d[pick(d, 'Date', /date/i) || ''])
    if (!date.startsWith(month) || isSunday(date)) continue
    const who = d[pick(d, 'Employee', /employee|name|person|staff/i) || '']
    const st = norm(d[pick(d, 'Status', /status|attend/i) || ''])
    if (!who) continue
    if (/^absent|^a$/.test(st)) add(String(who), 1)
    else if (/half/.test(st)) add(String(who), 0.5)
  }
  for (const l of leaves) {
    const d = l.data
    if (!/^approved$/i.test(String(d[pick(d, 'Status', /status/i) || ''] ?? '').trim())) continue
    if (!/unpaid|loss of pay|lop/i.test(String(d[pick(d, 'Leave Type', /type|kind/i) || ''] ?? ''))) continue
    const who = d[pick(d, 'Employee', /employee|name|person|staff/i) || '']
    const from = iso(d[pick(d, 'From', /from|start/i) || ''])
    const to = iso(d[pick(d, 'To', /^to$|end|until/i) || '']) || from
    if (!who || !from) continue
    // Walk the days of the leave that fall inside this month.
    for (let t = Date.parse(from + 'T00:00:00Z'), end = Date.parse(to + 'T00:00:00Z'), n = 0; t <= end && n < 62; t += 86400000, n++) {
      const day = new Date(t).toISOString().slice(0, 10)
      if (day.startsWith(month) && !isSunday(day)) add(String(who), 1)
    }
  }

  const lines: PayLine[] = []
  const noSalary: string[] = []
  for (const s of staff) {
    const d = s.data
    const nameK = pick(d, 'Name', /^name$|employee/i)
    const name = nameK ? String(d[nameK] ?? '').trim() : ''
    if (!name) continue
    const salK = pick(d, 'Salary', /salary|pay|ctc/i)
    const salary = salK ? num(d[salK]) : 0
    if (!(salary > 0)) { noSalary.push(name); continue }
    const lostDays = Math.min(wd, lost.get(norm(name)) || 0)
    const earned = Math.round((salary * (wd - lostDays)) / wd)
    const ded = deductionsFor(d, earned, salary)
    const net = Math.max(0, earned - ded.pfEmployee - ded.esiEmployee - ded.tds)
    const notes: string[] = []
    if (lostDays > 0) notes.push(`${lostDays} day${lostDays === 1 ? '' : 's'} cut`)
    lines.push({
      employee: name,
      salary,
      workingDays: wd,
      lostDays,
      earned,
      pf: ded.pfEmployee,
      esi: ded.esiEmployee,
      tds: ded.tds,
      employer: ded.pfEmployer + ded.esiEmployer,
      net,
      note: notes.join(', '),
    })
  }
  lines.sort((a, b) => b.net - a.net)
  const dues = lines.reduce((s, l) => s + l.pf + l.esi + l.tds + l.employer, 0)
  return { month, lines, total: lines.reduce((s, l) => s + l.net, 0), dues, noSalary }
}

/** People on approved leave on a given date. */
export function onLeaveOn(date: string, leaves: Row[]): string[] {
  const out: string[] = []
  for (const l of leaves) {
    const d = l.data
    if (!/^approved$/i.test(String(d[pick(d, 'Status', /status/i) || ''] ?? '').trim())) continue
    const who = d[pick(d, 'Employee', /employee|name|person|staff/i) || '']
    const from = iso(d[pick(d, 'From', /from|start/i) || ''])
    const to = iso(d[pick(d, 'To', /^to$|end|until/i) || '']) || from
    if (who && from && date >= from && date <= to) out.push(String(who))
  }
  return out
}
