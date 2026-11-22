// Budget against actual spending, by expense category, for one month. Pure maths, no storage.

type Row = { id: string; data: Record<string, any> }

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const norm = (s: unknown) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

export interface BudgetLine {
  category: string
  budget: number
  spent: number
  left: number
  percent: number
  status: 'over' | 'close' | 'ok'
}

export interface BudgetReport {
  month: string
  lines: BudgetLine[]
  /** Categories with spending this month but no budget. */
  unbudgeted: { category: string; spent: number }[]
  totalBudget: number
  totalSpent: number
}

/** A budget row may name a Month (YYYY-MM) for that month only, or leave it blank for every month. */
export function budgetVsActual(budgets: Row[], expenses: Row[], month: string): BudgetReport {
  const wanted = new Map<string, { category: string; budget: number }>()
  for (const b of budgets || []) {
    const d = b.data
    const m = String(d['Month'] ?? '').slice(0, 7)
    if (m && m !== month) continue
    const category = String(d['Category'] ?? '').trim()
    const amount = num(d['Monthly Budget'] ?? d['Budget'] ?? d['Amount'])
    if (!category || !(amount > 0)) continue
    const key = norm(category)
    const cur = wanted.get(key)
    // A budget for this exact month beats a standing one.
    if (!cur || m) wanted.set(key, { category, budget: amount })
  }
  const spent = new Map<string, { category: string; spent: number }>()
  for (const e of expenses || []) {
    const d = e.data
    const date = String(d['Date'] ?? d['Bill Date'] ?? d['Expense Date'] ?? d['Due Date'] ?? '').slice(0, 7)
    if (date !== month) continue
    const amount = num(d['Amount'] ?? d['Total'])
    if (!(amount > 0)) continue
    const category = String(d['Category'] ?? '').trim() || 'General Expenses'
    const key = norm(category)
    const cur = spent.get(key) || { category, spent: 0 }
    cur.spent += amount
    spent.set(key, cur)
  }
  const lines: BudgetLine[] = []
  wanted.forEach((w, key) => {
    const s = spent.get(key)?.spent || 0
    const percent = Math.round((s / w.budget) * 100)
    lines.push({ category: w.category, budget: w.budget, spent: Math.round(s), left: Math.round(w.budget - s), percent, status: s > w.budget ? 'over' : percent >= 80 ? 'close' : 'ok' })
  })
  lines.sort((a, b) => b.percent - a.percent)
  const unbudgeted: { category: string; spent: number }[] = []
  spent.forEach((s, key) => { if (!wanted.has(key)) unbudgeted.push({ category: s.category, spent: Math.round(s.spent) }) })
  unbudgeted.sort((a, b) => b.spent - a.spent)
  return {
    month,
    lines,
    unbudgeted,
    totalBudget: lines.reduce((s, l) => s + l.budget, 0),
    totalSpent: Math.round(Array.from(spent.values()).reduce((s, x) => s + x.spent, 0)),
  }
}
