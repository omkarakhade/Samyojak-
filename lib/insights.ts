import type { UserRow } from '@/lib/userData'
import { stockLines, byWarehouse, expiring } from '@/lib/stockReports'
import { depreciationFor } from '@/lib/depreciation'
import { budgetVsActual } from '@/lib/budgets'
import { gstSummary } from '@/lib/gst'
import { statementLines, bookMoves, reconcile } from '@/lib/bank'
import { rateTable, conversionFor, BASE_CURRENCY } from '@/lib/currency'
import { openTickets, pendingApprovals } from '@/lib/tickets'
import { payrollFor, onLeaveOn, fieldValue } from '@/lib/payroll'
import { dueRecurring, monthlyRecurringTotal } from '@/lib/recurring'
import { materialNeeds, productCosts } from '@/lib/productionPlan'
import { buildLedger, balances, position, type AccountType } from '@/lib/ledger'
import { parseLineItems, itemKey } from '@/lib/lineItems'
import { scoreLeads } from '@/lib/leadScore'

/**
 * Answers that show: fixed, safe calculations over the user's own records.
 * The AI only PICKS which insight fits a question; the numbers are computed here in code.
 */

export type InsightId =
  | 'unpaid_invoices'
  | 'revenue_by_month'
  | 'leads_by_status'
  | 'lead_scores'
  | 'low_stock'
  | 'stock_abc'
  | 'returns_analysis'
  | 'demand_forecast'
  | 'production_status'
  | 'quality_summary'
  | 'timesheet_summary'
  | 'stock_value'
  | 'warehouse_stock'
  | 'expiring_stock'
  | 'bank_reconciliation'
  | 'budget_vs_actual'
  | 'depreciation'
  | 'gst_summary'
  | 'currency_exposure'
  | 'support_tickets'
  | 'approvals_pending'
  | 'payroll'
  | 'recurring_due'
  | 'production_materials'
  | 'product_cost'
  | 'balance_sheet'
  | 'trial_balance'
  | 'cash_position'
  | 'assets_summary'
  | 'reorder_plan'
  | 'top_clients'
  | 'receivables_aging'
  | 'client_concentration'
  | 'gst_return'
  | 'payment_reminders'
  | 'daily_brief'
  | 'recent_changes'
  | 'profit_loss'
  | 'bills_due'

export const INSIGHT_IDS: InsightId[] = [
  'unpaid_invoices',
  'revenue_by_month',
  'leads_by_status',
  'lead_scores',
  'low_stock',
  'stock_abc',
  'returns_analysis',
  'demand_forecast',
  'production_status',
  'quality_summary',
  'timesheet_summary',
  'stock_value',
  'warehouse_stock',
  'expiring_stock',
  'bank_reconciliation',
  'budget_vs_actual',
  'depreciation',
  'gst_summary',
  'currency_exposure',
  'support_tickets',
  'approvals_pending',
  'payroll',
  'recurring_due',
  'production_materials',
  'product_cost',
  'balance_sheet',
  'trial_balance',
  'cash_position',
  'assets_summary',
  'reorder_plan',
  'top_clients',
  'receivables_aging',
  'client_concentration',
  'gst_return',
  'payment_reminders',
  'daily_brief',
  'recent_changes',
  'profit_loss',
  'bills_due',
]

/** Everything the books are built from. Reports use whichever of these the plan includes. */
export const ACCOUNTING_MODULES = ['Invoices', 'Expenses', 'Returns', 'Assets', 'Journal Entries', 'Currency Rates']
export const ACCOUNTING_IDS: string[] = ['balance_sheet', 'trial_balance', 'cash_position', 'bank_reconciliation']

export const INSIGHT_MODULES: Record<InsightId, string[]> = {
  unpaid_invoices: ['Invoices'],
  revenue_by_month: ['Invoices'],
  leads_by_status: ['CRM'],
  lead_scores: ['CRM'],
  low_stock: ['Inventory'],
  stock_abc: ['Inventory'],
  returns_analysis: ['Returns'],
  demand_forecast: ['Invoices', 'Inventory'],
  production_status: ['Production Jobs'],
  quality_summary: ['Quality Issues', 'Production Jobs'],
  timesheet_summary: ['Timesheets'],
  stock_value: ['Inventory'],
  warehouse_stock: ['Inventory'],
  expiring_stock: ['Inventory'],
  bank_reconciliation: ['Bank Statement', ...ACCOUNTING_MODULES],
  budget_vs_actual: ['Budgets', 'Expenses'],
  depreciation: ['Assets'],
  gst_return: ['Invoices', 'Expenses'],
  currency_exposure: ['Invoices', 'Currency Rates'],
  support_tickets: ['Support Tickets'],
  approvals_pending: ['Approvals'],
  payroll: ['HR', 'Attendance', 'Leave Requests', 'Expense Claims'],
  recurring_due: ['Recurring Invoices'],
  production_materials: ['Production Jobs', 'Bills of Materials', 'Inventory'],
  product_cost: ['Bills of Materials', 'Inventory'],
  balance_sheet: ACCOUNTING_MODULES,
  trial_balance: ACCOUNTING_MODULES,
  cash_position: ACCOUNTING_MODULES,
  assets_summary: ['Assets'],
  reorder_plan: ['Inventory'],
  top_clients: ['Invoices'],
  receivables_aging: ['Invoices'],
  client_concentration: ['Invoices'],
  gst_summary: ['Invoices'],
  payment_reminders: ['Invoices'],
  daily_brief: ['CRM', 'Invoices', 'Inventory'],
  profit_loss: ['Invoices', 'Expenses'],
  bills_due: ['Expenses'],
  recent_changes: ['CRM', 'Invoices', 'Quotations', 'Inventory', 'HR', 'Projects', 'Recruiting', 'Expenses', 'Vendors', 'Purchase Orders', 'Returns', 'Production Jobs', 'Quality Issues', 'Timesheets', 'Assets', 'Journal Entries', 'Bills of Materials', 'Recurring Invoices', 'Sales Orders', 'Attendance', 'Leave Requests', 'Expense Claims', 'Support Tickets', 'Approvals', 'Bank Statement', 'Budgets', 'Currency Rates'],
}

export interface InsightCard {
  id: InsightId
  title: string
  kind: 'table' | 'bar'
  columns: string[]
  rows: (string | number)[][]
  bar?: { label: string; value: number }[]
  total?: string
  note?: string
}

type ByModule = Record<string, UserRow[]>

// ───────────── helpers ─────────────

export function toNumber(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v !== 'string') return 0
  const cleaned = v.replace(/[^0-9.\-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'AED', 'SGD'] as const

let currentCurrency = ''
/** Set the currency used by the formatters until changed again. Unknown values mean "no symbol". */
export function setCurrency(c: unknown) {
  currentCurrency = typeof c === 'string' && (CURRENCIES as readonly string[]).includes(c) ? c : ''
}

export function inr(n: number): string {
  const v = Math.round(n)
  if (!currentCurrency) return v.toLocaleString('en-US')
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCurrency, maximumFractionDigits: 0 }).format(v)
}

/** First column name (in order of the patterns) that appears in the data. */
export function findField(rows: UserRow[], patterns: (string | RegExp)[]): string | null {
  const keys = new Set<string>()
  rows.slice(0, 60).forEach(r => Object.keys(r.data).forEach(k => keys.add(k)))
  const list = Array.from(keys)
  for (const p of patterns) {
    const hit = list.find(k => (typeof p === 'string' ? k.toLowerCase() === p.toLowerCase() : p.test(k)))
    if (hit) return hit
  }
  return null
}

/** Accepts 2026-11-05, 05/11/2026, 5-11-26. Returns YYYY-MM or ''. */
export function monthKey(v: unknown): string {
  if (typeof v !== 'string' || !v.trim()) return ''
  const s = v.trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/)
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3]
    return `${year}-${m[2].padStart(2, '0')}`
  }
  return ''
}

function dayKey(v: unknown): string {
  if (typeof v !== 'string') return ''
  const s = v.trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/)
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3]
    return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  }
  return ''
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[Math.max(0, Math.min(11, parseInt(m, 10) - 1))]} ${y}`
}

/** Whole days from date a to date b (both YYYY-MM-DD). Positive when b is later. */
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

interface Sale { key: string; name: string; qty: number; day: string }

/**
 * Every item sold, with its date, read from the invoices.
 * Uses the "Line Items" text when present; otherwise one item per invoice from an Item/Product + Quantity pair
 * (what most CSV exports from other software look like).
 */
function collectSales(invoices: UserRow[]): Sale[] {
  const dateF = findField(invoices, ISSUE_FIELDS)
  if (!dateF) return []
  const linesF = findField(invoices, ['Line Items', /^line.?items?$|^items$/i])
  const itemF = findField(invoices, ['Item', 'Item Name', 'Product', /^item|^product/i])
  const qtyF = findField(invoices, ['Quantity', /^qty$|^quantity/i])
  const sales: Sale[] = []
  for (const r of invoices) {
    const day = dayKey(r.data[dateF])
    if (!day) continue
    const lines = linesF ? parseLineItems(r.data[linesF]) : []
    if (lines.length > 0) {
      for (const l of lines) sales.push({ key: itemKey(l.name), name: l.name, qty: l.qty, day })
    } else if (itemF && qtyF) {
      const name = String(r.data[itemF] ?? '').trim()
      const qty = toNumber(r.data[qtyF])
      if (name && qty > 0) sales.push({ key: itemKey(name), name, qty, day })
    }
  }
  return sales
}

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

const CLIENT_FIELDS = ['Client Name', /client|customer|party|buyer/i, /^name$/i]
const AMOUNT_FIELDS = ['Amount', /^amount/i, /grand.*total|total.*amount|^total$|net.*amount|invoice.*value|^value$/i]
const TAX_FIELDS = ['Tax Amount', /tax.*amount|gst.*amount|^gst$|^tax$|igst|cgst/i]
const STATUS_FIELDS = ['Payment Status', /payment.*status|^status$|paid/i]
const ISSUE_FIELDS = ['Issue Date', /issue.*date|invoice.*date|^date$/i]
const DUE_FIELDS = ['Due Date', /due/i]

/** What is still owed on an invoice: the balance after part payments, or the full amount when nothing was paid yet. */
function owed(data: Record<string, any>, amountKey: string | null): number {
  const bal = toNumber(data['Balance Due'])
  if (bal > 0) return bal
  return amountKey ? toNumber(data[amountKey]) : 0
}

function isPaid(v: unknown) {
  return /^\s*paid\s*$/i.test(String(v ?? ''))
}

// ───────────── insights ─────────────

export function computeInsight(id: InsightId, data: ByModule): InsightCard {
  const invoices = data.Invoices || []
  const leads = data.CRM || []
  const stock = data.Inventory || []
  const returns = data.Returns || []
  const jobs = data['Production Jobs'] || []
  const issues = data['Quality Issues'] || []

  if (id === 'unpaid_invoices') {
    const client = findField(invoices, CLIENT_FIELDS)
    const amount = findField(invoices, AMOUNT_FIELDS)
    const status = findField(invoices, STATUS_FIELDS)
    const due = findField(invoices, DUE_FIELDS)
    const today = todayIST()

    const pending = status ? invoices.filter(r => !isPaid(r.data[status])) : []
    pending.sort((a, b) => {
      const da = due ? dayKey(a.data[due]) || '9999' : '9999'
      const db = due ? dayKey(b.data[due]) || '9999' : '9999'
      return da < db ? -1 : da > db ? 1 : 0
    })

    const sum = pending.reduce((s, r) => s + owed(r.data, amount), 0)
    const overdue = due ? pending.filter(r => { const d = dayKey(r.data[due]); return d && d < today }).length : 0

    return {
      id,
      title: 'Unpaid invoices',
      kind: 'table',
      columns: ['Client', 'Amount', 'Due', 'Status'],
      rows: pending.slice(0, 15).map(r => [
        client ? String(r.data[client] ?? '') : '—',
        amount ? inr(owed(r.data, amount)) : '—',
        due ? String(r.data[due] ?? '—') : '—',
        status ? String(r.data[status] ?? '—') : '—',
      ]),
      total: pending.length ? `${pending.length} unpaid · ${inr(sum)}` : undefined,
      note: !status
        ? 'Your invoices have no payment status column, so I cannot tell which are unpaid.'
        : pending.length === 0
          ? 'Nothing unpaid. All invoices are marked paid.'
          : overdue
            ? `${overdue} of these ${overdue === 1 ? 'is' : 'are'} past the due date.${pending.length > 15 ? ' Showing the first 15.' : ''}`
            : pending.length > 15 ? 'Showing the first 15.' : undefined,
    }
  }

  if (id === 'revenue_by_month' || id === 'gst_summary') {
    const amount = findField(invoices, AMOUNT_FIELDS)
    const tax = findField(invoices, TAX_FIELDS)
    const issue = findField(invoices, ISSUE_FIELDS)

    const byMonth = new Map<string, { base: number; tax: number; n: number }>()
    for (const r of invoices) {
      const k = issue ? monthKey(r.data[issue]) : ''
      if (!k) continue
      const cur = byMonth.get(k) || { base: 0, tax: 0, n: 0 }
      cur.base += amount ? toNumber(r.data[amount]) : 0
      cur.tax += tax ? toNumber(r.data[tax]) : 0
      cur.n += 1
      byMonth.set(k, cur)
    }
    const keys = Array.from(byMonth.keys()).sort().slice(-6)

    if (id === 'revenue_by_month') {
      const bar = keys.map(k => ({ label: monthLabel(k), value: Math.round(byMonth.get(k)!.base) }))
      return {
        id,
        title: 'Billed per month (before tax)',
        kind: 'bar',
        columns: ['Month', 'Invoices', 'Billed'],
        rows: keys.map(k => [monthLabel(k), byMonth.get(k)!.n, inr(byMonth.get(k)!.base)]),
        bar,
        total: keys.length ? inr(keys.reduce((s, k) => s + byMonth.get(k)!.base, 0)) : undefined,
        note: keys.length ? 'Last 6 months with invoices.' : 'No invoices with a readable issue date yet.',
      }
    }

    return {
      id,
      title: 'Tax collected per month',
      kind: 'table',
      columns: ['Month', 'Amount before tax', 'Tax collected'],
      rows: keys.map(k => {
        const v = byMonth.get(k)!
        return [monthLabel(k), inr(v.base), inr(v.tax)]
      }),
      total: keys.length ? `Tax total ${inr(keys.reduce((s, k) => s + byMonth.get(k)!.tax, 0))}` : undefined,
      note: tax
        ? 'Works with any tax: GST, VAT or sales tax. Amount before tax is the invoice amount. Check against your return before filing.'
        : 'Your invoices have no tax column yet, so tax shows as zero.',
    }
  }

  if (id === 'profit_loss') {
    const exp = data.Expenses || []
    const iAmount = findField(invoices, AMOUNT_FIELDS)
    const iIssue = findField(invoices, ISSUE_FIELDS)
    const eAmount = findField(exp, ['Amount', /^amount/i])
    const eDate = findField(exp, ['Date', /^date$|bill.*date|expense.*date/i])
    const by = new Map<string, { inc: number; out: number }>()
    for (const r of invoices) {
      const k = iIssue ? monthKey(r.data[iIssue]) : ''
      if (!k) continue
      const c = by.get(k) || { inc: 0, out: 0 }
      c.inc += iAmount ? toNumber(r.data[iAmount]) : 0
      by.set(k, c)
    }
    for (const r of exp) {
      const k = eDate ? monthKey(r.data[eDate]) : ''
      if (!k) continue
      const c = by.get(k) || { inc: 0, out: 0 }
      c.out += eAmount ? toNumber(r.data[eAmount]) : 0
      by.set(k, c)
    }
    const keys = Array.from(by.keys()).sort().slice(-6)
    const profit = (k: string) => by.get(k)!.inc - by.get(k)!.out
    const tot = keys.reduce((s, k) => s + profit(k), 0)
    return {
      id,
      title: 'Profit and loss per month',
      kind: 'bar',
      columns: ['Month', 'Billed', 'Spent', 'Profit'],
      rows: keys.map(k => [monthLabel(k), inr(by.get(k)!.inc), inr(by.get(k)!.out), inr(profit(k))]),
      bar: keys.map(k => ({ label: monthLabel(k), value: Math.round(profit(k)) })),
      total: keys.length ? `Profit ${inr(tot)}` : undefined,
      note: keys.length
        ? 'Billed is invoice amount before tax, whether or not it is paid yet. Spent is your recorded expenses and bills. This is a simple view, not a tax-ready statement.'
        : 'Add invoices and expenses with dates and I can show your profit.',
    }
  }

  if (id === 'bills_due') {
    const exp = data.Expenses || []
    const vendor = findField(exp, ['Vendor', /vendor|supplier|payee/i])
    const amount = findField(exp, ['Amount', /^amount/i])
    const status = findField(exp, ['Status', /status|paid/i])
    const due = findField(exp, ['Due Date', /due/i])
    const today = todayIST()
    const open = status ? exp.filter(r => !isPaid(r.data[status])) : []
    open.sort((a, b) => (due ? dayKey(a.data[due]) || '9999' : '').localeCompare(due ? dayKey(b.data[due]) || '9999' : ''))
    const sum = open.reduce((s, r) => s + (amount ? toNumber(r.data[amount]) : 0), 0)
    const late = due ? open.filter(r => { const d = dayKey(r.data[due]); return d && d < today }).length : 0
    return {
      id,
      title: 'Bills to pay',
      kind: 'table',
      columns: ['Vendor', 'Amount', 'Due'],
      rows: open.slice(0, 15).map(r => [vendor ? String(r.data[vendor] ?? '') : '—', amount ? inr(toNumber(r.data[amount])) : '—', due ? String(r.data[due] ?? '—') : '—']),
      total: open.length ? `${open.length} unpaid · ${inr(sum)}` : undefined,
      note: !status ? 'Your expenses have no status column, so I cannot tell which bills are unpaid.'
        : open.length === 0 ? 'No unpaid bills.' : late ? `${late} ${late === 1 ? 'is' : 'are'} past the due date.` : undefined,
    }
  }

  if (id === 'recent_changes') {
    const log = (data.Activity || []).slice().sort((x, y) => String(y.data.When || '').localeCompare(String(x.data.When || '')))
    // Rows are saved a moment before their log line, so look back two minutes when matching them.
    const firstLogAt = log.length ? Date.parse(String(log[log.length - 1].data.When || '')) : NaN
    const firstLog = Number.isFinite(firstLogAt) ? new Date(firstLogAt - 120000).toISOString() : '9999'
    const rows: { when: string; cells: (string | number)[] }[] = log.map(r => ({
      when: String(r.data.When || ''),
      cells: [String(r.data.When || '').slice(0, 16).replace('T', ' ') + ' UTC', String(r.data.Action || ''), String(r.data.Where || ''), String(r.data.Summary || ''), String(r.data.By || '')],
    }))
    // Earlier changes from before the log existed, and sheet imports, come from the import markers.
    const batches = new Map<string, { when: string; module: string; source: string; n: number }>()
    for (const [module, list] of Object.entries(data)) {
      if (module === 'Activity') continue
      for (const r of list) {
        const key = String(r.meta?.importId || '')
        if (!key) continue
        const src = String(r.meta?.source || '')
        const at = String(r.meta?.importedAt || '')
        if (src === 'agent_entry' && at >= firstLog) continue // already in the log
        const cur = batches.get(key) || { when: at, module, source: src, n: 0 }
        cur.n += 1
        batches.set(key, cur)
      }
    }
    for (const bt of Array.from(batches.values())) {
      const what = bt.source === 'agent_entry' ? 'Added' : bt.source === 'csv_import' ? 'Imported' : 'Added'
      rows.push({ when: bt.when, cells: [bt.when ? bt.when.slice(0, 16).replace('T', ' ') + ' UTC' : '—', what, bt.module, `${bt.n} row${bt.n === 1 ? '' : 's'}${bt.source === 'csv_import' ? ' from a sheet' : bt.source === 'agent_entry' ? ' by the assistant' : ''}`, bt.source === 'csv_import' ? 'Import' : 'Earlier entry'] })
    }
    rows.sort((x, y) => y.when.localeCompare(x.when))
    const shown = rows.slice(0, 20)
    return {
      id,
      title: 'What the assistant did',
      kind: 'table',
      columns: ['When', 'What', 'Where', 'Details', 'Approved by'],
      rows: shown.map(r => r.cells),
      total: shown.length ? `${shown.length} most recent` : undefined,
      note: shown.length === 0 ? 'Nothing has been added or changed through the chat yet.' : 'Every change the assistant makes needs your approval first. Use Undo on the chat message where it happened to reverse it.',
    }
  }

  if (id === 'payment_reminders') {
    const client = findField(invoices, CLIENT_FIELDS)
    const amount = findField(invoices, AMOUNT_FIELDS)
    const status = findField(invoices, STATUS_FIELDS)
    const due = findField(invoices, DUE_FIELDS)
    const num = findField(invoices, ['Invoice No', /invoice.*(no|number|#)|^inv/i])
    const today = todayIST()
    const pending = status ? invoices.filter(r => !isPaid(r.data[status])) : []
    const overdue = due ? pending.filter(r => { const d = dayKey(r.data[due]); return d && d < today }) : pending
    overdue.sort((a, b) => (due ? (dayKey(a.data[due]) || '9999') : '').localeCompare(due ? (dayKey(b.data[due]) || '9999') : ''))
    const rows = overdue.slice(0, 10).map(r => {
      const name = client ? String(r.data[client] ?? '').trim() : ''
      const amt = amount ? inr(owed(r.data, amount)) : ''
      const ref = num && r.data[num] ? ` ${r.data[num]}` : ''
      const when = due && r.data[due] ? ` that was due on ${r.data[due]}` : ''
      const draft = `Hi${name ? ' ' + name : ''}, a friendly reminder about invoice${ref}${amt ? ' for ' + amt : ''}${when}. Could you let us know when we can expect the payment? Thank you!`
      return [name || '—', amt || '—', draft]
    })
    return {
      id,
      title: 'Payment reminders, ready to send',
      kind: 'table',
      columns: ['Client', 'Amount', 'Draft message'],
      rows,
      total: overdue.length ? `${overdue.length} reminder${overdue.length === 1 ? '' : 's'} drafted` : undefined,
      note: !status
        ? 'Your invoices have no payment status column, so I cannot tell who to remind.'
        : overdue.length === 0
          ? 'Nobody is overdue. Nothing to chase.'
          : 'Tap WhatsApp to open the message ready to send, then pick the customer. You can also copy it for email. Nothing is sent automatically.',
    }
  }

  if (id === 'daily_brief') {
    const sum = computeSummary(data)
    const items: (string | number)[][] = []
    if (data.Invoices) {
      items.push(['Payments', sum.invoices.overdueCount > 0 ? `${sum.invoices.overdueCount} overdue invoice${sum.invoices.overdueCount === 1 ? '' : 's'}` : 'No overdue invoices', sum.invoices.unpaidCount > 0 ? `${sum.invoices.unpaidCount} unpaid · ${inr(sum.invoices.unpaidAmount)}` : 'All paid'])
    }
    if (data.CRM) {
      items.push(['Leads', sum.leads.fresh > 0 ? `${sum.leads.fresh} new lead${sum.leads.fresh === 1 ? '' : 's'} to contact` : 'No new leads waiting', `${sum.leads.total} in total`])
    }
    if (data.Inventory) {
      items.push(['Stock', sum.inventory.low > 0 ? `${sum.inventory.low} item${sum.inventory.low === 1 ? '' : 's'} low` : 'Stock levels fine', `${sum.inventory.items} items tracked`])
    }
    return {
      id,
      title: 'What needs your attention today',
      kind: 'table',
      columns: ['Area', 'Focus', 'Detail'],
      rows: items,
      note: items.length === 0 ? 'Add some data first, then I can tell you what to focus on.' : 'Ask me to open any of these, for example "Who has not paid me?"',
    }
  }

  if (id === 'lead_scores') {
    const leads = scoreLeads(data['CRM'] || [], todayIST())
    const hot = leads.filter(l => l.level === 'Hot').length
    return {
      id,
      title: 'Lead scores (0-100)',
      kind: 'table',
      columns: ['Lead', 'Score', 'Level', 'Why', 'Next step'],
      rows: leads.slice(0, 15).map(l => [l.name, l.score, l.level, l.reasons.join(', ') || '—', l.next]),
      total: leads.length ? `${leads.length} open lead${leads.length === 1 ? '' : 's'} · ${hot} hot` : undefined,
      note: leads.length === 0
        ? 'No open leads yet. Tell me, for example, "new lead Neha 98xxxxxx, interested in a website".'
        : 'Score comes from the stage, contact details, deal value and follow-up date. Call the hot ones first.',
    }
  }

  if (id === 'leads_by_status') {
    const status = findField(leads, ['Status', /status|stage/i])
    const counts = new Map<string, number>()
    for (const r of leads) {
      const s = (status ? String(r.data[status] ?? '').trim() : '') || 'No status'
      counts.set(s, (counts.get(s) || 0) + 1)
    }
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
    return {
      id,
      title: 'Leads by status',
      kind: 'bar',
      columns: ['Status', 'Leads'],
      rows: entries.map(([s, n]) => [s, n]),
      bar: entries.map(([s, n]) => ({ label: s, value: n })),
      total: `${leads.length} leads`,
      note: leads.length === 0 ? 'No leads yet.' : undefined,
    }
  }

  if (id === 'low_stock') {
    const name = findField(stock, ['Item Name', /item|product|name/i])
    const qty = findField(stock, ['Current Stock', /current.*stock|^stock$|quantity|qty/i])
    const min = findField(stock, ['Reorder Level', /reorder|minimum|min.*stock/i])
    const low = stock.filter(r => {
      if (!qty) return false
      const q = toNumber(r.data[qty])
      const m = min ? toNumber(r.data[min]) : 0
      return min ? q <= m : q <= 0
    })
    return {
      id,
      title: 'Low stock',
      kind: 'table',
      columns: ['Item', 'In stock', 'Reorder at'],
      rows: low.slice(0, 20).map(r => [
        name ? String(r.data[name] ?? '') : '—',
        qty ? toNumber(r.data[qty]) : '—',
        min ? toNumber(r.data[min]) : '—',
      ]),
      total: low.length ? `${low.length} item${low.length === 1 ? '' : 's'} to reorder` : undefined,
      note: !qty
        ? 'Your inventory has no stock column, so I cannot check levels.'
        : low.length === 0 ? 'Nothing is below its reorder level.' : undefined,
    }
  }

  if (id === 'demand_forecast') {
    // Weekly sales per item over the last 12 weeks -> average, a buffer for busy weeks, and a reorder point.
    const WEEKS = 12
    const LEAD_WEEKS = 2 // time a supplier usually takes to deliver
    const Z = 1.65 // ~95% chance of not running out during the lead time
    const today = todayIST()
    const sales = collectSales(invoices)

    const nameF = findField(stock, ['Item Name', /item|product|name/i])
    const qtyF = findField(stock, ['Current Stock', /current.*stock|^stock$|quantity|qty/i])
    const onHand = new Map<string, number>()
    if (nameF && qtyF) for (const r of stock) onHand.set(itemKey(String(r.data[nameF] ?? '')), toNumber(r.data[qtyF]))

    const perItem = new Map<string, { name: string; weekly: number[]; maxAge: number }>()
    for (const s of sales) {
      const age = daysBetween(s.day, today)
      if (age < 0 || age >= WEEKS * 7) continue
      const cur = perItem.get(s.key) || { name: s.name, weekly: new Array(WEEKS).fill(0), maxAge: 0 }
      cur.weekly[Math.floor(age / 7)] += s.qty
      cur.maxAge = Math.max(cur.maxAge, age)
      perItem.set(s.key, cur)
    }

    const forecasts = Array.from(perItem.entries()).map(([key, v]) => {
      const weeks = Math.min(WEEKS, Math.max(4, Math.ceil((v.maxAge + 1) / 7)))
      const used = v.weekly.slice(0, weeks)
      const mean = used.reduce((a, b) => a + b, 0) / weeks
      const variance = used.reduce((a, b) => a + (b - mean) ** 2, 0) / weeks
      const reorderPoint = mean * LEAD_WEEKS + Z * Math.sqrt(variance) * Math.sqrt(LEAD_WEEKS)
      const have = onHand.has(key) ? (onHand.get(key) as number) : null
      const daysLeft = have !== null && mean > 0 ? Math.floor(have / (mean / 7)) : null
      const needOrder = have !== null && have <= reorderPoint
      const orderQty = needOrder ? Math.max(1, Math.ceil(reorderPoint + mean * 4 - (have as number))) : 0
      return { name: v.name, mean, have, daysLeft, needOrder, orderQty }
    })
    forecasts.sort((a, b) => {
      if (a.needOrder !== b.needOrder) return a.needOrder ? -1 : 1
      const da = a.daysLeft === null ? 1e9 : a.daysLeft
      const db = b.daysLeft === null ? 1e9 : b.daysLeft
      return da - db
    })
    const need = forecasts.filter(f => f.needOrder).length
    const unknown = forecasts.filter(f => f.have === null).length
    const notes: string[] = []
    if (unknown) notes.push(`${unknown} sold item${unknown === 1 ? ' is' : 's are'} not in Inventory under the same name, so I can not check their stock.`)
    notes.push('Based on your recent sales, a 2 week supplier delivery time and a buffer for busy weeks.')
    return {
      id,
      title: 'Demand forecast',
      kind: 'table',
      columns: ['Item', 'Sold / week', 'In stock', 'Days left', 'Order now'],
      rows: forecasts.slice(0, 15).map(f => [
        f.name,
        Math.round(f.mean * 10) / 10,
        f.have === null ? '—' : f.have,
        f.daysLeft === null ? '—' : f.daysLeft,
        f.needOrder ? f.orderQty : '—',
      ]),
      total: forecasts.length ? `${need} of ${forecasts.length} item${forecasts.length === 1 ? '' : 's'} need ordering now` : undefined,
      note: forecasts.length === 0
        ? 'I can not see what you sold yet. Add items to invoices (for example "Laptop x2 @50000") with an issue date, and I will forecast demand from them.'
        : notes.join(' '),
    }
  }

  if (id === 'production_status') {
    // Where every job stands, how far along the running ones are, and which are past their due date.
    const jobF = findField(jobs, ['Job No', /job|order|^name$/i])
    const prodF = findField(jobs, ['Product', /product|item/i])
    const planF = findField(jobs, ['Quantity Planned', /planned|target|^qty$|quantity/i])
    const madeF = findField(jobs, ['Quantity Made', /made|produced|completed|done qty/i])
    const dueF = findField(jobs, ['Due Date', /due|deadline/i])
    const statusF = findField(jobs, ['Status', /status|stage/i])
    const today = todayIST()

    const order = ['Planned', 'In Progress', 'On Hold', 'Done']
    const groups = new Map<string, { n: number; planned: number; made: number }>()
    const late: string[] = []
    let activePlanned = 0
    let activeMade = 0
    for (const r of jobs) {
      const raw = statusF ? String(r.data[statusF] ?? '').trim() : ''
      const st = order.find(o => o.toLowerCase() === raw.toLowerCase()) || raw || 'No status'
      const planned = planF ? toNumber(r.data[planF]) : 0
      const made = madeF ? toNumber(r.data[madeF]) : 0
      const g = groups.get(st) || { n: 0, planned: 0, made: 0 }
      g.n++; g.planned += planned; g.made += made
      groups.set(st, g)
      if (st !== 'Done') {
        activePlanned += planned
        activeMade += made
        const d = dueF ? dayKey(r.data[dueF]) : ''
        if (d && d < today) {
          const name = (jobF ? String(r.data[jobF] ?? '').trim() : '') || (prodF ? String(r.data[prodF] ?? '').trim() : '') || 'a job'
          late.push(name)
        }
      }
    }
    const entries = Array.from(groups.entries()).sort((a, b) => {
      const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0])
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    const pct = activePlanned > 0 ? Math.min(100, Math.round((activeMade / activePlanned) * 100)) : 0
    const onHold = groups.get('On Hold')?.n || 0
    const notes: string[] = []
    if (late.length) notes.push(`${late.length} job${late.length === 1 ? ' is' : 's are'} past the due date: ${late.slice(0, 4).join(', ')}${late.length > 4 ? '...' : ''}.`)
    if (onHold) notes.push(`${onHold} job${onHold === 1 ? ' is' : 's are'} on hold.`)
    return {
      id,
      title: 'Production jobs by status',
      kind: 'bar',
      columns: ['Status', 'Jobs', 'Made / planned'],
      rows: entries.map(([k, v]) => [k, v.n, `${v.made} / ${v.planned}`]),
      bar: entries.map(([k, v]) => ({ label: k, value: v.n })),
      total: jobs.length ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} · open jobs ${pct}% made` : undefined,
      note: jobs.length === 0 ? 'No production jobs yet.' : notes.join(' ') || 'Nothing is late.',
    }
  }

  if (id === 'stock_value') {
    const lines = stockLines(data.Inventory || []).filter(l => l.stock > 0)
    const total = lines.reduce((s, l) => s + l.value, 0)
    const priceOnly = lines.filter(l => l.basis === 'price').length
    const none = lines.filter(l => l.basis === 'none').map(l => l.item)
    const notes: string[] = []
    if (priceOnly) notes.push(`${priceOnly} item${priceOnly === 1 ? ' is' : 's are'} valued at the selling price because no Cost Price is recorded, so the value is higher than your real cost.`)
    if (none.length) notes.push(`No price at all for: ${none.slice(0, 5).join(', ')}.`)
    return {
      id,
      title: 'Stock value',
      kind: 'table',
      columns: ['Item', 'Where', 'Stock', 'Cost each', 'Value'],
      rows: lines.sort((a, b) => b.value - a.value).slice(0, 25).map(l => [l.item, l.warehouse, l.stock, l.unitCost > 0 ? inr(l.unitCost) : '—', inr(l.value)]),
      total: lines.length ? `Total stock value ${inr(total)}` : undefined,
      note: lines.length === 0 ? 'No stock recorded yet.' : notes.join(' ') || 'Add a Cost Price to each item for an exact value.',
    }
  }

  if (id === 'warehouse_stock') {
    const list = byWarehouse(data.Inventory || [])
    return {
      id,
      title: 'Stock by warehouse',
      kind: 'table',
      columns: ['Warehouse', 'Items', 'Units', 'Value'],
      rows: list.map(w => [w.warehouse, w.items, w.units, inr(w.value)]),
      total: list.length ? `${list.length} location${list.length === 1 ? '' : 's'}` : undefined,
      note: list.length === 0 ? 'No stock recorded yet.' : list.length === 1 ? 'Everything is in one place. Say "move 50 steel sheets to the Pune shop" to start using a second warehouse.' : undefined,
    }
  }

  if (id === 'expiring_stock') {
    const list = expiring(data.Inventory || [], todayIST(), 60)
    return {
      id,
      title: 'Stock expiring soon',
      kind: 'table',
      columns: ['Item', 'Batch', 'Where', 'Stock', 'Expires', 'Days left'],
      rows: list.slice(0, 25).map(l => [l.item, l.batch || '—', l.warehouse, l.stock, l.expiry, l.daysLeft < 0 ? `expired ${-l.daysLeft}d ago` : l.daysLeft]),
      total: list.length ? `${list.length} batch${list.length === 1 ? '' : 'es'}` : undefined,
      note: list.length === 0 ? 'Nothing expires in the next 60 days. Record a Batch No and Expiry Date on Inventory items to track this.' : 'Sell or use the oldest batches first.',
    }
  }

  if (id === 'bank_reconciliation') {
    const lines = statementLines(data['Bank Statement'] || [])
    if (lines.length === 0) {
      return { id, title: 'Bank reconciliation', kind: 'table', columns: ['', 'Count'], rows: [], note: 'Upload your bank statement (a CSV with Date, Description and Amount, or Debit and Credit columns) in Bank Statement, then ask me to reconcile.' }
    }
    const rec = reconcile(lines, bookMoves(buildLedger(data as any), 'Cash and Bank'))
    const rows: (string | number)[][] = [
      ...rec.bankOnly.slice(0, 12).map(l => ['In bank, not in books', l.date, l.description || '—', inr(l.amount)]),
      ...rec.booksOnly.slice(0, 12).map(m => ['In books, not in bank', m.date, m.memo, inr(m.amount)]),
    ]
    return {
      id,
      title: 'Bank reconciliation',
      kind: 'table',
      columns: ['What', 'Date', 'Detail', 'Amount'],
      rows,
      total: `${rec.matched.length} matched · ${rec.bankOnly.length} only in bank · ${rec.booksOnly.length} only in books`,
      note: rows.length === 0
        ? 'Every bank line matches your books.'
        : rec.bankOnly.length ? `Record the ${rec.bankOnly.length} bank line${rec.bankOnly.length === 1 ? '' : 's'} that are missing from your books (an expense, a payment received, or a journal entry). Lines "only in books" may simply not have cleared yet.` : 'These entries are in your books but not in the bank yet. They may not have cleared.',
    }
  }

  if (id === 'budget_vs_actual') {
    const month = todayIST().slice(0, 7)
    const r = budgetVsActual(data.Budgets || [], data.Expenses || [], month)
    const over = r.lines.filter(l => l.status === 'over')
    const notes: string[] = []
    if (over.length) notes.push(`Over budget: ${over.slice(0, 4).map(l => `${l.category} (${inr(l.spent - l.budget)} over)`).join(', ')}.`)
    if (r.unbudgeted.length) notes.push(`Spending with no budget: ${r.unbudgeted.slice(0, 4).map(u => `${u.category} ${inr(u.spent)}`).join(', ')}.`)
    return {
      id,
      title: `Budget for ${month}`,
      kind: 'table',
      columns: ['Category', 'Budget', 'Spent', 'Left', 'Used'],
      rows: r.lines.map(l => [l.category, inr(l.budget), inr(l.spent), inr(l.left), `${l.percent}%`]),
      total: r.lines.length ? `Spent ${inr(r.totalSpent)} of ${inr(r.totalBudget)} budgeted` : undefined,
      note: r.lines.length === 0 ? 'No budgets yet. Tell me, for example, "budget 20000 a month for marketing".' : notes.join(' ') || undefined,
    }
  }

  if (id === 'depreciation') {
    const list = depreciationFor(data.Assets || [], todayIST())
    const withoutLife = (data.Assets || []).filter(r => !(toNumber(r.data['Useful Life Years'] ?? r.data['Useful Life']) > 0)).length
    return {
      id,
      title: 'Asset depreciation',
      kind: 'table',
      columns: ['Asset', 'Cost', 'Per month', 'Written off', 'Book value'],
      rows: list.slice(0, 25).map(l => [l.asset, inr(l.cost), inr(l.monthly), inr(l.accumulated), inr(l.bookValue)]),
      total: list.length ? `Book value ${inr(list.reduce((s, l) => s + l.bookValue, 0))} of ${inr(list.reduce((s, l) => s + l.cost, 0))} bought` : undefined,
      note: list.length === 0
        ? 'Add a Useful Life Years (for example 5 for a laptop) to an asset and I will write it down every month automatically.'
        : withoutLife ? `${withoutLife} asset${withoutLife === 1 ? ' has' : 's have'} no Useful Life Years, so ${withoutLife === 1 ? 'it is' : 'they are'} not depreciated.` : 'The books include this depreciation automatically.',
    }
  }

  if (id === 'gst_return') {
    const now = todayIST()
    const d = new Date(Date.parse(now.slice(0, 7) + '-01T00:00:00Z'))
    d.setUTCMonth(d.getUTCMonth() - (Number(now.slice(8, 10)) <= 20 ? 1 : 0))
    const month = d.toISOString().slice(0, 7)
    const g = gstSummary(data.Invoices || [], data.Expenses || [], month)
    const notes: string[] = []
    if (g.noTax > 0) notes.push(`${g.noTax} invoice${g.noTax === 1 ? ' has' : 's have'} no tax recorded.`)
    if (g.badGstin.length) notes.push(`Check the GSTIN for: ${g.badGstin.slice(0, 4).join(', ')}.`)
    if (g.inputCredit === 0) notes.push('No tax on purchases is recorded, so input credit is zero. Add a GST Amount to expenses to claim it.')
    notes.push('These are the figures for your return. File them on the GST portal (GSTR-1 by the 11th, GSTR-3B by the 20th of next month).')
    return {
      id,
      title: `GST for ${month}`,
      kind: 'table',
      columns: ['', 'Invoices', 'Taxable value', 'Tax'],
      rows: [
        ['Sales to businesses (B2B)', g.b2b.invoices, inr(g.b2b.taxable), inr(g.b2b.tax)],
        ['Sales to consumers (B2C)', g.b2c.invoices, inr(g.b2c.taxable), inr(g.b2c.tax)],
        ['Tax on sales', '', '', inr(g.outputTax)],
        ['Tax paid on purchases (credit)', '', '', inr(g.inputCredit)],
        [g.netPayable >= 0 ? 'Tax to pay' : 'Credit to carry forward', '', '', inr(Math.abs(g.netPayable))],
      ],
      total: `${g.b2b.invoices + g.b2c.invoices} invoices · ${g.netPayable >= 0 ? 'pay' : 'credit'} ${inr(Math.abs(g.netPayable))}`,
      note: notes.join(' '),
    }
  }

  if (id === 'currency_exposure') {
    const rates = rateTable(data['Currency Rates'] || [])
    const by = new Map<string, { code: string; original: number; base: number; count: number; missing: boolean }>()
    for (const r of data.Invoices || []) {
      const dd = r.data
      if (isPaid(dd['Payment Status'] ?? dd['Status'])) continue
      const left = owed(dd, dd['Amount'] !== undefined ? 'Amount' : 'Total')
      if (!(left > 0)) continue
      const c = conversionFor(dd, rates)
      const cur = by.get(c.currency) || { code: c.currency, original: 0, base: 0, count: 0, missing: false }
      cur.original += left
      cur.base += left * c.rate
      cur.count++
      cur.missing = cur.missing || c.missingRate
      by.set(c.currency, cur)
    }
    const list = Array.from(by.values()).sort((a, b) => b.base - a.base)
    const missing = list.filter(l => l.missing).map(l => l.code)
    return {
      id,
      title: 'Money owed by currency',
      kind: 'table',
      columns: ['Currency', 'Invoices', 'Owed', `In ${BASE_CURRENCY}`],
      rows: list.map(l => [l.code, l.count, Math.round(l.original), l.missing ? 'rate missing' : inr(l.base)]),
      total: list.length ? `${inr(list.filter(l => !l.missing).reduce((s, l) => s + l.base, 0))} in total` : undefined,
      note: list.length === 0 ? 'No unpaid invoices.' : missing.length ? `I have no exchange rate for ${missing.join(', ')}. Tell me, for example, "1 USD is 84 rupees".` : list.length === 1 && list[0].code === BASE_CURRENCY ? 'All your invoices are in rupees. Add a Currency (like USD) to an invoice to bill someone abroad.' : undefined,
    }
  }

  if (id === 'support_tickets') {
    const list = openTickets(data['Support Tickets'] || [], todayIST())
    const late = list.filter(t => t.lateBy > 0)
    return {
      id,
      title: 'Open support tickets',
      kind: 'table',
      columns: ['Customer', 'Problem', 'Priority', 'Reply by', 'Late'],
      rows: list.slice(0, 25).map(t => [t.who || '—', t.subject || '—', t.priority, t.due, t.lateBy > 0 ? `${t.lateBy} day${t.lateBy === 1 ? '' : 's'}` : '—']),
      total: list.length ? `${list.length} open${late.length ? ` · ${late.length} late` : ''}` : undefined,
      note: (data['Support Tickets'] || []).length === 0
        ? 'No tickets yet. Tell me, for example, "Mehta says the invoice PDF will not open, high priority".'
        : list.length === 0 ? 'No open tickets. Everything is resolved.' : late.length ? `${late.length} ticket${late.length === 1 ? ' is' : 's are'} past the reply deadline. Reply to those first.` : undefined,
    }
  }

  if (id === 'approvals_pending') {
    const list = pendingApprovals(data.Approvals || [])
    return {
      id,
      title: 'Waiting for your approval',
      kind: 'table',
      columns: ['Request', 'Asked by', 'Amount', 'Date'],
      rows: list.slice(0, 25).map(a => [a.what, a.by || '—', a.amount > 0 ? inr(a.amount) : '—', a.date || '—']),
      total: list.length ? `${list.length} waiting` : undefined,
      note: list.length === 0 ? 'Nothing is waiting for you.' : 'Tell me your decision, for example "approve the Mehta discount".',
    }
  }

  if (id === 'payroll') {
    const today = todayIST()
    const month = today.slice(0, 7)
    const pay = payrollFor(month, data.HR || [], data.Attendance || [], data['Leave Requests'] || [])
    const notes: string[] = []
    const off = onLeaveOn(today, data['Leave Requests'] || [])
    if (off.length) notes.push(`On leave today: ${off.slice(0, 5).join(', ')}.`)
    const pending = (data['Leave Requests'] || []).filter(r => /^pending$/i.test(String(fieldValue(r.data, 'Status', /status/i) ?? ''))).length
    if (pending) notes.push(`${pending} leave request${pending === 1 ? ' is' : 's are'} waiting for your approval.`)
    const claims = (data['Expense Claims'] || []).filter(r => /^(submitted|approved)$/i.test(String(fieldValue(r.data, 'Status', /status/i) ?? '')))
    const claimSum = claims.reduce((s, r) => s + toNumber(fieldValue(r.data, 'Amount', /amount/i)), 0)
    if (claims.length) notes.push(`${claims.length} expense claim${claims.length === 1 ? '' : 's'} to pay back (${inr(claimSum)}).`)
    if (pay.noSalary.length) notes.push(`No salary recorded for: ${pay.noSalary.slice(0, 5).join(', ')}.`)
    if (pay.dues > 0) notes.push(`Owed to the government (PF, ESI and tax, with the employer share): ${inr(pay.dues)}.`)
    else if (pay.lines.length) notes.push('PF, ESI and tax are off for everyone. Say "turn on PF for Simran" (or ESI, or TDS) to include them.')
    if (pay.lines.length) notes.push('Say "run payroll" and I will record each salary as a paid expense.')
    return {
      id,
      title: `Payroll for ${month}`,
      kind: 'table',
      columns: ['Employee', 'Earned', 'Deductions', 'To pay'],
      rows: pay.lines.slice(0, 30).map(l => [l.employee, inr(l.earned), l.pf + l.esi + l.tds > 0 ? `PF ${l.pf} · ESI ${l.esi} · tax ${l.tds}` : (l.lostDays > 0 ? `${l.lostDays} day${l.lostDays === 1 ? '' : 's'} cut` : '—'), inr(l.net)]),
      total: pay.lines.length ? `${pay.lines.length} people · ${inr(pay.total)}` : undefined,
      note: pay.lines.length === 0 ? 'No salaries recorded yet. Add people in HR with a monthly Salary.' : notes.join(' ') || undefined,
    }
  }

  if (id === 'recurring_due') {
    const rows = data['Recurring Invoices'] || []
    const due = dueRecurring(rows, todayIST())
    const monthly = monthlyRecurringTotal(rows)
    return {
      id,
      title: 'Recurring bills due',
      kind: 'table',
      columns: ['Client', 'For', 'Amount', 'Due', 'Missed'],
      rows: due.map(d => [d.client, d.description || '—', inr(d.amount), d.dueDate, d.missed > 1 ? `${d.missed} times` : '—']),
      total: due.length ? `${due.length} due · ${inr(due.reduce((s, d) => s + d.amount, 0))}` : undefined,
      note: rows.length === 0
        ? 'No recurring bills yet. Tell me, for example, "Prithviraj monthly maintenance 2000".'
        : due.length === 0
          ? `Nothing is due today. Your active recurring bills bring in about ${inr(monthly)} a month.`
          : `Say "bill the recurring clients" and I will make these invoices. Active recurring bills bring in about ${inr(monthly)} a month.`,
    }
  }

  if (id === 'production_materials') {
    // Can the open jobs be made with what is in stock, and what has to be bought?
    const plan = materialNeeds(data['Production Jobs'] || [], data['Bills of Materials'] || [], data.Inventory || [])
    const short = plan.needs.filter(n => n.short > 0)
    const notes: string[] = []
    if (short.length) notes.push(`${short.length} material${short.length === 1 ? ' is' : 's are'} short. Buy these before the jobs run out of parts.`)
    else if (plan.needs.length) notes.push('You have enough of every material for the open jobs.')
    if (plan.noBom.length) notes.push(`No bill of materials yet for: ${plan.noBom.slice(0, 5).join(', ')}. Tell me what goes into one unit and I will include it.`)
    const notInInv = plan.needs.filter(n => !n.inInventory)
    if (notInInv.length) notes.push(`Not in Inventory yet: ${notInInv.slice(0, 5).map(n => n.name).join(', ')}.`)
    return {
      id,
      title: 'Materials for open jobs',
      kind: 'table',
      columns: ['Material', 'Needed', 'In stock', 'To buy'],
      rows: plan.needs.slice(0, 20).map(n => [n.name, n.need, n.stock, n.short > 0 ? n.short : '—']),
      total: plan.openJobs ? `${plan.openJobs} open job${plan.openJobs === 1 ? '' : 's'}${short.length ? ` · ${short.length} short` : ''}` : undefined,
      note: plan.openJobs === 0 ? 'No open production jobs.' : notes.join(' ') || undefined,
    }
  }

  if (id === 'product_cost') {
    // What one unit costs to make, from the parts' prices in Inventory plus labour.
    const costs = productCosts(data['Bills of Materials'] || [], data.Inventory || [])
    const notes: string[] = []
    const unpriced = costs.filter(c => c.unpriced.length)
    if (unpriced.length) notes.push(`Some parts have no price in Inventory, so these costs are too low: ${unpriced.slice(0, 3).map(c => `${c.product} (${c.unpriced.slice(0, 3).join(', ')})`).join('; ')}.`)
    const losing = costs.filter(c => c.selling > 0 && c.total > c.selling)
    if (losing.length) notes.push(`${losing.map(c => c.product).slice(0, 3).join(', ')} cost${losing.length === 1 ? 's' : ''} more to make than the selling price.`)
    return {
      id,
      title: 'Cost to make one unit',
      kind: 'table',
      columns: ['Product', 'Materials', 'Labour', 'Cost', 'Sells for', 'Margin'],
      rows: costs.slice(0, 20).map(c => [
        c.product,
        inr(c.material),
        c.labour > 0 ? inr(c.labour) : '—',
        inr(c.total),
        c.selling > 0 ? inr(c.selling) : '—',
        c.selling > 0 && c.total > 0 ? `${Math.round(((c.selling - c.total) / c.selling) * 100)}%` : '—',
      ]),
      total: costs.length ? `${costs.length} product${costs.length === 1 ? '' : 's'} with a bill of materials` : undefined,
      note: costs.length === 0 ? 'No bills of materials yet. Tell me, for example, "one bracket needs 2 steel sheets and 8 bolts".' : notes.join(' ') || undefined,
    }
  }

  if (id === 'balance_sheet' || id === 'trial_balance' || id === 'cash_position') {
    const list = balances(buildLedger(data))
    const pos = position(list)
    const hasAny = list.length > 0
    const empty = 'Nothing to show yet. Once you record an invoice, an expense, or tell me what money you started with, the books build themselves.'

    if (id === 'cash_position') {
      const rows: (string | number)[][] = [
        ['Cash and bank', inr(pos.cash)],
        ['Customers owe you', inr(pos.receivable)],
        ['You owe suppliers', inr(pos.payable)],
        ['Cash + owed to you - you owe', inr(pos.cash + pos.receivable - pos.payable)],
      ]
      const notes: string[] = []
      if (pos.cash < 0) notes.push('Cash is below zero because I do not know what money you started with. Tell me, for example, "I started with 50000 in the bank".')
      if (pos.receivable > 0 && pos.cash + pos.receivable - pos.payable > pos.cash) notes.push('Part of your money is still with customers. Ask me for payment reminders.')
      return {
        id,
        title: 'Cash position',
        kind: 'table',
        columns: ['', 'Amount'],
        rows: hasAny ? rows : [],
        total: hasAny ? `Cash and bank ${inr(pos.cash)}` : undefined,
        note: hasAny ? notes.join(' ') || undefined : empty,
      }
    }

    if (id === 'trial_balance') {
      const rows: (string | number)[][] = list.map(b => {
        const net = b.debit - b.credit
        return [b.account, net > 0 ? inr(net) : '', net < 0 ? inr(-net) : '']
      })
      const totalDebit = list.reduce((s, b) => s + Math.max(0, b.debit - b.credit), 0)
      const totalCredit = list.reduce((s, b) => s + Math.max(0, b.credit - b.debit), 0)
      if (hasAny) rows.push(['Total', inr(totalDebit), inr(totalCredit)])
      return {
        id,
        title: 'Trial balance',
        kind: 'table',
        columns: ['Account', 'Debit', 'Credit'],
        rows,
        total: hasAny ? (Math.abs(totalDebit - totalCredit) < 0.01 ? 'Debits equal credits' : 'Debits and credits differ') : undefined,
        note: hasAny ? 'Built automatically from your invoices, payments, expenses, bills, refunds, assets and journal entries.' : empty,
      }
    }

    // balance_sheet
    const section = (title: string, type: AccountType): (string | number)[][] => {
      const items = list.filter(b => b.type === type && Math.abs(b.balance) >= 0.005)
      return [[title.toUpperCase(), ''], ...items.map(b => ['  ' + b.account, inr(b.balance)])]
    }
    const equityItems = list.filter(b => b.type === 'equity' && Math.abs(b.balance) >= 0.005)
    const rows: (string | number)[][] = [
      ...section('Assets', 'asset'),
      ['Total assets', inr(pos.assets)],
      ...section('Liabilities', 'liability'),
      ['Total liabilities', inr(pos.liabilities)],
      ['EQUITY', ''],
      ...equityItems.map(b => ['  ' + b.account, inr(-(b.debit - b.credit))] as (string | number)[]),
      ['  Profit so far', inr(pos.profit)],
      ['Total equity', inr(pos.equity)],
    ]
    const notes: string[] = []
    if (pos.cash < 0) notes.push('Cash is below zero because I do not know what money you started with. Tell me, for example, "I put 50000 of my own money in".')
    if (!pos.balanced) notes.push('The sheet does not balance, which should not happen. Please tell me.')
    return {
      id,
      title: 'Balance sheet',
      kind: 'table',
      columns: ['', 'Amount'],
      rows: hasAny ? rows : [],
      total: hasAny ? `Assets ${inr(pos.assets)} = Liabilities ${inr(pos.liabilities)} + Equity ${inr(pos.equity)}` : undefined,
      note: hasAny ? notes.join(' ') || undefined : empty,
    }
  }

  if (id === 'timesheet_summary') {
    // Hours this month per project, and what the billable hours are worth.
    const sheet = data.Timesheets || []
    const dateF = findField(sheet, ['Date', /date|day/i])
    const projF = findField(sheet, ['Project', /project|task|client/i])
    const hoursF = findField(sheet, ['Hours', /hours|hrs|duration|time/i])
    const billF = findField(sheet, ['Billable', /billable/i])
    const rateF = findField(sheet, ['Hourly Rate', /rate/i])
    const personF = findField(sheet, ['Person', /person|employee|who|name/i])
    const month = todayIST().slice(0, 7)
    const inMonth = sheet.filter(r => !dateF || monthKey(r.data[dateF]) === month)
    const by = new Map<string, { hours: number; value: number }>()
    const people = new Map<string, number>()
    let billableHours = 0
    let total = 0
    let noRate = 0
    for (const r of inMonth) {
      const h = hoursF ? toNumber(r.data[hoursF]) : 0
      if (!(h > 0)) continue
      const proj = (projF ? String(r.data[projF] ?? '').trim() : '') || 'No project'
      const isBillable = !billF || /^(yes|y|true|1|billable)$/i.test(String(r.data[billF] ?? '').trim())
      const rate = rateF ? toNumber(r.data[rateF]) : 0
      const cur = by.get(proj) || { hours: 0, value: 0 }
      cur.hours += h
      if (isBillable) {
        billableHours += h
        cur.value += h * rate
        if (!(rate > 0)) noRate += h
      }
      by.set(proj, cur)
      total += h
      const who = personF ? String(r.data[personF] ?? '').trim() : ''
      if (who) people.set(who, (people.get(who) || 0) + h)
    }
    const entries = Array.from(by.entries()).sort((a, b) => b[1].hours - a[1].hours)
    const worth = entries.reduce((t, e) => t + e[1].value, 0)
    const round1 = (n: number) => Math.round(n * 10) / 10
    const notes: string[] = []
    if (billableHours > 0) notes.push(`${round1(billableHours)} of ${round1(total)} hours are billable.`)
    if (worth > 0) notes.push(`Billable hours with a rate are worth ${inr(worth)}.`)
    if (noRate > 0) notes.push(`${round1(noRate)} billable hour${noRate === 1 ? ' has' : 's have'} no hourly rate, so they are not valued.`)
    const topPerson = Array.from(people.entries()).sort((a, b) => b[1] - a[1])[0]
    if (topPerson && people.size > 1) notes.push(`Most hours: ${topPerson[0]} (${round1(topPerson[1])}).`)
    return {
      id,
      title: 'Hours this month',
      kind: 'table',
      columns: ['Project', 'Hours', 'Billable value'],
      rows: entries.slice(0, 12).map(e => [e[0], round1(e[1].hours), e[1].value > 0 ? inr(e[1].value) : '—']),
      total: total > 0 ? `${round1(total)} hours logged this month` : undefined,
      note: sheet.length === 0 ? 'No time logged yet. Tell me, for example, "worked 3 hours on the website today".' : total === 0 ? 'No hours logged this month.' : notes.join(' ') || undefined,
    }
  }

  if (id === 'assets_summary') {
    // What the business owns, where it is, who has it, and what needs attention.
    const assets = data.Assets || []
    const nameF = findField(assets, ['Asset Name', /asset|item|name/i])
    const catF = findField(assets, ['Category', /category|type/i])
    const costF = findField(assets, ['Purchase Cost', /cost|price|value/i])
    const statusF = findField(assets, ['Status', /status|state/i])
    const warF = findField(assets, ['Warranty Until', /warranty/i])
    const whoF = findField(assets, ['Assigned To', /assigned|holder|user/i])
    const today = todayIST()
    const gone = (v: unknown) => /^(retired|sold|scrapped|disposed)$/i.test(String(v ?? '').trim())
    const active = assets.filter(r => !(statusF && gone(r.data[statusF])))
    const by = new Map<string, { n: number; cost: number }>()
    const expiring: string[] = []
    let inRepair = 0
    let unassigned = 0
    for (const r of active) {
      const cat = (catF ? String(r.data[catF] ?? '').trim() : '') || 'Uncategorised'
      const cur = by.get(cat) || { n: 0, cost: 0 }
      cur.n++
      cur.cost += costF ? toNumber(r.data[costF]) : 0
      by.set(cat, cur)
      const st = statusF ? String(r.data[statusF] ?? '') : ''
      if (/repair|service/i.test(st)) inRepair++
      if (whoF && !String(r.data[whoF] ?? '').trim() && !/stock|spare/i.test(st)) unassigned++
      const w = warF ? dayKey(r.data[warF]) : ''
      if (w) {
        const left = daysBetween(today, w)
        if (left >= 0 && left <= 60) expiring.push(`${nameF ? String(r.data[nameF] ?? 'Asset') : 'Asset'} (${left} days)`)
      }
    }
    const entries = Array.from(by.entries()).sort((a, b) => b[1].cost - a[1].cost)
    const totalCost = entries.reduce((t, e) => t + e[1].cost, 0)
    const notes: string[] = []
    if (expiring.length) notes.push(`Warranty ends soon: ${expiring.slice(0, 5).join(', ')}.`)
    if (inRepair) notes.push(`${inRepair} asset${inRepair === 1 ? ' is' : 's are'} in repair.`)
    if (unassigned) notes.push(`${unassigned} asset${unassigned === 1 ? ' has' : 's have'} nobody assigned.`)
    return {
      id,
      title: 'Assets you own',
      kind: 'table',
      columns: ['Category', 'Assets', 'Purchase cost'],
      rows: entries.slice(0, 12).map(e => [e[0], e[1].n, e[1].cost > 0 ? inr(e[1].cost) : '—']),
      total: active.length ? `${active.length} asset${active.length === 1 ? '' : 's'}${totalCost > 0 ? ' · ' + inr(totalCost) : ''}` : undefined,
      note: assets.length === 0 ? 'No assets recorded yet. Tell me, for example, "bought a Dell laptop for 62000 and gave it to Simran".' : notes.join(' ') || undefined,
    }
  }

  if (id === 'quality_summary') {
    // Open problems by seriousness, whether each has a fix recorded, and how much of what you make is affected.
    const defectF = findField(issues, ['Defect', /defect|problem|issue|description/i])
    const unitsF = findField(issues, ['Quantity Affected', /affected|units|qty|quantity/i])
    const sevF = findField(issues, ['Severity', /severity|priority/i])
    const capaF = findField(issues, ['Corrective Action', /corrective|action|fix|capa/i])
    const statusF = findField(issues, ['Status', /status|stage/i])
    const dateF = findField(issues, ['Reported Date', /reported|date/i])
    const madeF = findField(jobs, ['Quantity Made', /made|produced|completed/i])
    const today = todayIST()

    const isClosed = (v: unknown) => /^(fixed|closed|resolved|done)$/i.test(String(v ?? '').trim())
    const open = issues.filter(r => !(statusF && isClosed(r.data[statusF])))
    const sevOrder = ['Critical', 'Major', 'Minor']
    const bySev = new Map<string, number>()
    let noFix = 0
    let oldest = 0
    const byDefect = new Map<string, number>()
    for (const r of open) {
      const raw = sevF ? String(r.data[sevF] ?? '').trim() : ''
      const sev = sevOrder.find(s => s.toLowerCase() === raw.toLowerCase()) || raw || 'Not rated'
      bySev.set(sev, (bySev.get(sev) || 0) + 1)
      if (!(capaF && String(r.data[capaF] ?? '').trim())) noFix++
      const d = dateF ? dayKey(r.data[dateF]) : ''
      if (d) oldest = Math.max(oldest, daysBetween(d, today))
      const defect = defectF ? String(r.data[defectF] ?? '').trim().toLowerCase() : ''
      if (defect) byDefect.set(defect, (byDefect.get(defect) || 0) + 1)
    }
    const entries = Array.from(bySev.entries()).sort((a, b) => {
      const ia = sevOrder.indexOf(a[0]); const ib = sevOrder.indexOf(b[0])
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    const affected = issues.reduce((t, r) => t + (unitsF ? toNumber(r.data[unitsF]) : 0), 0)
    const made = jobs.reduce((t, r) => t + (madeF ? toNumber(r.data[madeF]) : 0), 0)
    const rate = made > 0 ? Math.round((affected / made) * 1000) / 10 : 0
    const critical = bySev.get('Critical') || 0
    const topDefect = Array.from(byDefect.entries()).sort((a, b) => b[1] - a[1])[0]
    const notes: string[] = []
    if (critical) notes.push(`${critical} critical issue${critical === 1 ? ' is' : 's are'} still open. Fix these first.`)
    if (noFix) notes.push(`${noFix} open issue${noFix === 1 ? ' has' : 's have'} no corrective action written down yet.`)
    if (oldest > 14) notes.push(`The oldest open issue is ${oldest} days old.`)
    if (topDefect && topDefect[1] > 1) notes.push(`"${topDefect[0]}" keeps coming back (${topDefect[1]} times), so look for the root cause.`)
    if (made > 0) notes.push(`${affected} unit${affected === 1 ? '' : 's'} affected out of ${made} made (${rate}%).`)
    return {
      id,
      title: 'Open quality issues',
      kind: 'bar',
      columns: ['Severity', 'Open issues'],
      rows: entries.map(([k, v]) => [k, v]),
      bar: entries.map(([k, v]) => ({ label: k, value: v })),
      total: issues.length ? `${open.length} open of ${issues.length} issue${issues.length === 1 ? '' : 's'}` : undefined,
      note: issues.length === 0 ? 'No quality issues recorded.' : open.length === 0 ? 'No open issues. Everything reported is fixed or closed.' : notes.join(' ') || undefined,
    }
  }

  if (id === 'returns_analysis') {
    // Why things come back, what it costs, and the patterns worth a closer look.
    const reasonF = findField(returns, ['Reason', /reason|cause/i])
    const refundF = findField(returns, ['Refund Amount', /refund|amount|value/i])
    const custF = findField(returns, ['Customer', /customer|client|name/i])
    const itemF = findField(returns, ['Item', /item|product|sku/i])
    const statusF = findField(returns, ['Status', /status|stage/i])
    const qtyF = findField(returns, ['Quantity', /^qty$|quantity/i])

    const byReason = new Map<string, { n: number; refund: number }>()
    const byItem = new Map<string, number>()
    const byCust = new Map<string, number>()
    let totalRefund = 0
    let waiting = 0
    for (const r of returns) {
      const reason = (reasonF ? String(r.data[reasonF] ?? '').trim() : '') || 'Not recorded'
      const refund = refundF ? toNumber(r.data[refundF]) : 0
      const cur = byReason.get(reason) || { n: 0, refund: 0 }
      cur.n++
      cur.refund += refund
      byReason.set(reason, cur)
      totalRefund += refund
      const item = itemF ? String(r.data[itemF] ?? '').trim() : ''
      if (item) byItem.set(item, (byItem.get(item) || 0) + (qtyF ? Math.max(1, toNumber(r.data[qtyF])) : 1))
      const cust = custF ? String(r.data[custF] ?? '').trim() : ''
      if (cust) byCust.set(cust, (byCust.get(cust) || 0) + 1)
      if (statusF && /^(requested|approved|received|pending|open)$/i.test(String(r.data[statusF] ?? '').trim())) waiting++
    }
    const reasons = Array.from(byReason.entries()).sort((a, b) => b[1].n - a[1].n)
    const topItem = Array.from(byItem.entries()).sort((a, b) => b[1] - a[1])[0]
    const repeat = Array.from(byCust.entries()).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 3)
    const notes: string[] = []
    if (topItem) notes.push(`${topItem[0]} comes back most (${topItem[1]} unit${topItem[1] === 1 ? '' : 's'}).`)
    if (repeat.length) notes.push(`Repeat returners worth a look: ${repeat.map(([c, n]) => `${c} (${n})`).join(', ')}.`)
    if (waiting) notes.push(`${waiting} return${waiting === 1 ? ' is' : 's are'} still waiting for a decision or refund.`)
    return {
      id,
      title: 'Returns by reason',
      kind: 'bar',
      columns: ['Reason', 'Returns', 'Refunded'],
      rows: reasons.map(([k, v]) => [k, v.n, inr(v.refund)]),
      bar: reasons.map(([k, v]) => ({ label: k, value: v.n })),
      total: returns.length ? `${returns.length} return${returns.length === 1 ? '' : 's'} · ${inr(totalRefund)} refunded` : undefined,
      note: returns.length === 0 ? 'No returns recorded yet.' : notes.join(' ') || undefined,
    }
  }

  if (id === 'stock_abc' || id === 'reorder_plan') {
    const name = findField(stock, ['Item Name', /item|product|name/i])
    const qty = findField(stock, ['Current Stock', /current.*stock|^stock$|quantity|qty/i])
    const min = findField(stock, ['Reorder Level', /reorder|minimum|min.*stock/i])
    const price = findField(stock, ['Unit Price', /unit.*price|^price$|cost|rate/i])
    const items = stock.map(r => ({
      name: name ? String(r.data[name] ?? '').trim() || '—' : '—',
      q: qty ? toNumber(r.data[qty]) : 0,
      m: min ? toNumber(r.data[min]) : 0,
      p: price ? toNumber(r.data[price]) : 0,
    }))

    if (id === 'stock_abc') {
      // Rank by money tied up in stock. A = the items making up the first 80%, B = next 15%, C = the rest.
      const ranked = items.map(i => ({ ...i, value: i.q * i.p })).filter(i => i.value > 0).sort((a, b) => b.value - a.value)
      const totalValue = ranked.reduce((t, i) => t + i.value, 0)
      let running = 0
      const classed = ranked.map(i => {
        const before = running
        running += i.value
        const cls = before < totalValue * 0.8 ? 'A' : before < totalValue * 0.95 ? 'B' : 'C'
        return { ...i, cls }
      })
      const counts = { A: 0, B: 0, C: 0 } as Record<string, number>
      classed.forEach(i => { counts[i.cls]++ })
      return {
        id,
        title: 'Stock value ranking (ABC)',
        kind: 'table',
        columns: ['Item', 'Stock value', 'Class'],
        rows: classed.slice(0, 20).map(i => [i.name, inr(i.value), i.cls]),
        total: classed.length ? `${inr(totalValue)} in stock: ${counts.A} A, ${counts.B} B, ${counts.C} C items` : undefined,
        note: !qty || !price
          ? 'I need both a stock column and a price column to rank items by value.'
          : classed.length === 0
            ? 'No items with both stock and price yet.'
            : 'A items hold about 80% of your stock value, so count and protect those first. C items are the long tail.',
      }
    }

    // reorder_plan: for items at or below their reorder level, suggest ordering back up to twice that level.
    const toOrder = items
      .filter(i => (min ? i.q <= i.m : i.q <= 0))
      .map(i => {
        const target = Math.max(i.m * 2, 1)
        const suggested = Math.max(Math.ceil(target - i.q), 1)
        return { ...i, suggested, cost: suggested * i.p }
      })
      .sort((a, b) => (a.q - a.m) - (b.q - b.m))
    const totalCost = toOrder.reduce((t, i) => t + i.cost, 0)
    return {
      id,
      title: 'Reorder plan',
      kind: 'table',
      columns: ['Item', 'In stock', 'Order qty', 'Est. cost'],
      rows: toOrder.slice(0, 20).map(i => [i.name, i.q, i.suggested, price ? inr(i.cost) : '—']),
      total: toOrder.length
        ? `${toOrder.length} item${toOrder.length === 1 ? '' : 's'} to order${price ? `, about ${inr(totalCost)}` : ''}`
        : undefined,
      note: !qty
        ? 'Your inventory has no stock column, so I cannot plan reorders.'
        : toOrder.length === 0
          ? 'Nothing is below its reorder level.'
          : 'Order quantities bring each item back up to twice its reorder level. This is a starting point, not a sales forecast.',
    }
  }

  if (id === 'receivables_aging') {
    // Unpaid money grouped by how late it is, so the owner sees what is slipping from "late" to "probably lost".
    const amount = findField(invoices, AMOUNT_FIELDS)
    const status = findField(invoices, STATUS_FIELDS)
    const due = findField(invoices, DUE_FIELDS)
    const issued = findField(invoices, ISSUE_FIELDS)
    const today = todayIST()
    const buckets = [
      { label: 'Not due yet', count: 0, sum: 0 },
      { label: '1-30 days late', count: 0, sum: 0 },
      { label: '31-60 days late', count: 0, sum: 0 },
      { label: '61-90 days late', count: 0, sum: 0 },
      { label: 'Over 90 days late', count: 0, sum: 0 },
      { label: 'No date', count: 0, sum: 0 },
    ]
    const pending = status ? invoices.filter(r => !isPaid(r.data[status])) : []
    for (const r of pending) {
      const amt = owed(r.data, amount)
      // No due date: assume payment is due 30 days after the issue date.
      let dueDay = due ? dayKey(r.data[due]) : ''
      if (!dueDay && issued) {
        const issueDay = dayKey(r.data[issued])
        if (issueDay) {
          const t = new Date(`${issueDay}T00:00:00Z`)
          t.setUTCDate(t.getUTCDate() + 30)
          dueDay = t.toISOString().slice(0, 10)
        }
      }
      let b = 5
      if (dueDay) {
        const late = daysBetween(dueDay, today)
        b = late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : late <= 90 ? 3 : 4
      }
      buckets[b].count++
      buckets[b].sum += amt
    }
    const shown = buckets.filter(b => b.count > 0)
    const total = shown.reduce((t, b) => t + b.sum, 0)
    const oldMoney = buckets[3].sum + buckets[4].sum
    return {
      id,
      title: 'Unpaid invoices by age',
      kind: 'bar',
      columns: ['Age', 'Invoices', 'Amount'],
      rows: shown.map(b => [b.label, b.count, inr(b.sum)]),
      bar: shown.map(b => ({ label: b.label, value: Math.round(b.sum) })),
      total: pending.length ? `${pending.length} unpaid · ${inr(total)}` : undefined,
      note: !status
        ? 'Your invoices have no payment status column, so I cannot tell which are unpaid.'
        : pending.length === 0
          ? 'Nothing unpaid. All invoices are marked paid.'
          : oldMoney > 0
            ? `${inr(oldMoney)} is more than 60 days late. The older money gets, the harder it is to collect, so call these clients first.`
            : 'Nothing is more than 60 days late.',
    }
  }

  if (id === 'client_concentration') {
    // How much of your billing depends on a few clients. A large share in one client is a business risk.
    const client = findField(invoices, CLIENT_FIELDS)
    const amount = findField(invoices, AMOUNT_FIELDS)
    const totals = new Map<string, number>()
    for (const r of invoices) {
      const c = client ? String(r.data[client] ?? '').trim() : ''
      if (!c) continue
      totals.set(c, (totals.get(c) || 0) + (amount ? toNumber(r.data[amount]) : 0))
    }
    const ranked = Array.from(totals.entries()).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
    const all = ranked.reduce((t, [, v]) => t + v, 0)
    const share = (v: number) => (all > 0 ? Math.round((v / all) * 100) : 0)
    const top1 = ranked.length ? share(ranked[0][1]) : 0
    const top3 = share(ranked.slice(0, 3).reduce((t, [, v]) => t + v, 0))
    const risk = ranked.length < 3 ? 'few clients' : top1 >= 40 || top3 >= 75 ? 'high' : top1 >= 25 || top3 >= 60 ? 'medium' : 'low'
    return {
      id,
      title: 'How much you depend on top clients',
      kind: 'bar',
      columns: ['Client', 'Billed', 'Share'],
      rows: ranked.slice(0, 8).map(([c, v]) => [c, inr(v), `${share(v)}%`]),
      bar: ranked.slice(0, 8).map(([c, v]) => ({ label: c, value: share(v) })),
      total: ranked.length ? `Top client ${top1}% · top 3 clients ${top3}%` : undefined,
      note: ranked.length === 0
        ? 'No invoices with a client name and amount yet.'
        : risk === 'high'
          ? 'High dependence: losing one of these clients would hurt badly. Try to win more clients so no single one is above about 25-30%.'
          : risk === 'medium'
            ? 'Moderate dependence on a few clients. Keep growing the rest of your client base.'
            : risk === 'few clients'
              ? 'You have very few billed clients so far, so every client is a large share. This will spread out as you add more.'
              : 'Your billing is well spread across clients.',
    }
  }

  // top_clients
  const client = findField(invoices, CLIENT_FIELDS)
  const amount = findField(invoices, AMOUNT_FIELDS)
  const totals = new Map<string, number>()
  for (const r of invoices) {
    const c = client ? String(r.data[client] ?? '').trim() : ''
    if (!c) continue
    totals.set(c, (totals.get(c) || 0) + (amount ? toNumber(r.data[amount]) : 0))
  }
  const top = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
  return {
    id: 'top_clients',
    title: 'Top clients by billing',
    kind: 'bar',
    columns: ['Client', 'Billed'],
    rows: top.map(([c, v]) => [c, inr(v)]),
    bar: top.map(([c, v]) => ({ label: c, value: Math.round(v) })),
    note: top.length === 0 ? 'No invoices with a client name yet.' : undefined,
  }
}

// ───────────── question → insight (keywords first, AI only as backup) ─────────────

export function pickInsightByKeywords(q: string): InsightId | null {
  const t = q.toLowerCase()
  if (/stock (value|worth|valuation)|inventory (value|worth|valuation)|value of (my )?(stock|inventory)|how much is my (stock|inventory) worth/.test(t)) return 'stock_value'
  if (/warehouses?|stock (by|in|at) (location|shop|godown|store)|godown|where is my stock/.test(t)) return 'warehouse_stock'
  if (!/warrant|assets?\b|subscription|licen[cs]e|contract/.test(t) && /expir(y|ing|ed)|shelf life|best before|batch(es)? (expir|stock|number)/.test(t)) return 'expiring_stock'
  if (/reconcil|bank statement|bank (match|mismatch)|match(ing)? (my )?bank/.test(t)) return 'bank_reconciliation'
  if (/budgets?|overspend|over budget|spending limit/.test(t)) return 'budget_vs_actual'
  if (/depreciat|book value|written down|asset value/.test(t)) return 'depreciation'
  if (/gstr|gst (return|filing|file|due|payable)|file (my )?gst|tax (due|payable) (to )?(the )?government|input (tax )?credit/.test(t)) return 'gst_return'
  if (/currenc(y|ies)|foreign|exchange rate|dollars?|usd|owed in|international (clients?|invoices?)/.test(t)) return 'currency_exposure'
  if (/(support )?tickets?|complaints?|customer (issues?|problems?)|sla\b|open issues|unanswered/.test(t)) return 'support_tickets'
  if (/approvals?|waiting for (my )?(approval|decision|yes)|pending (requests?|decisions?)|needs? my (ok|approval)/.test(t)) return 'approvals_pending'
  if (/payroll|salar(y|ies)|pay(ing)? (my )?(staff|employees|team|people)|who('s| is| are) on leave|leave (balance|requests?)|expense claims?|attendance/.test(t)) return 'payroll'
  if (/recurring|subscriptions? (due|bill)|(monthly|regular|repeat) (bills?|clients?|invoices?)|bill (the )?(monthly|recurring)|what('s| is) due to bill|retainers?/.test(t)) return 'recurring_due'
  if (/(materials?|components?|raw (material|stock)|parts?).*(need|short|requir|enough|buy)|can i (make|build|produce)|enough (materials?|stock|parts?) (to|for)|what (do i|should i) (buy|order).*(production|jobs?)|material (requirement|shortage|plan)|\bmrp\b/.test(t)) return 'production_materials'
  if (/(cost|price) (to|of) (make|making|produc|build|manufactur)|how much does it cost to make|production cost|\bbom\b.*cost|product cost|margin on (my )?products?|cost per unit/.test(t)) return 'product_cost'
  if (/balance sheet|net worth|assets and liabilities|what (do )?i own and (do )?(i )?owe/.test(t)) return 'balance_sheet'
  if (/trial balance|general ledger|\bledger\b|chart of accounts|debits? (and|&) credits?/.test(t)) return 'trial_balance'
  if (/cash (in hand|balance|position|flow)|bank balance|how much (cash|money) (do i have|is (there|left)|in)|cash kitna|paisa kitna/.test(t)) return 'cash_position'
  if (/recent (change|activity)|what did you (change|add|do)|activity log|audit|history of (change|import)/.test(t)) return 'recent_changes'
  if (/profit|loss|p&l|p and l|net income|earn(ed|ing)s?\b|kitna (bacha|kamaya)|margin/.test(t)) return 'profit_loss'
  if (/bills? (to pay|due)|what do i owe|i owe|payables?|unpaid bills|vendor.*(due|pay)/.test(t)) return 'bills_due'
  if (/remind|chase|draft.*(message|reminder)|dunning|collect.*(payment|money)/.test(t)) return 'payment_reminders'
  if (/focus on|needs? (my )?attention|today|daily brief|morning brief|priorit/.test(t)) return 'daily_brief'
  if (/\bgst\b|gstr|\bvat\b|sales tax|tax (summary|collected|due|report)|cgst|sgst|igst/.test(t)) return 'gst_summary'
  if (/aging|ageing|receivables?|how (old|late) (are|is)|overdue (by|bucket)|\b(30|60|90) days (late|overdue)|older than \d+ days/.test(t)) return 'receivables_aging'
  if (/concentration|depend(s|ent|ence)? on|too (much|many).*(one|single) client|(share|percent|%).*(top|biggest|best) (client|customer)|(top|biggest|best) (client|customer).*(share|percent|%)|client risk/.test(t)) return 'client_concentration'
  if (/unpaid|overdue|outstanding|pending (payment|invoice)|not paid|baki|bakaya|payment (due|pending)|who owes/.test(t)) return 'unpaid_invoices'
  if (/forecast|demand|days of stock|how long (will|does|do) .*(stock|last)|will .*run out|when .*run out|sales velocity|what (will|should) .*sell/.test(t)) return 'demand_forecast'
  if (/production|work order|\bjobs?\b.*(late|status|running|pending|delay)|(late|running|pending|delayed) jobs?|shop floor|manufactur/.test(t)) return 'production_status'
  if (/timesheets?|hours (logged|worked|spent|booked)|how many hours|billable|man.?hours|time (spent|tracking)/.test(t)) return 'timesheet_summary'
  if (/\bassets?\b|equipment register|warranty (expir|end)|who (has|got) (the |my )?(laptop|phone|machine)|asset register/.test(t)) return 'assets_summary'
  if (/quality|defect|non.?conformance|\bncr\b|\bcapa\b|rejection|complaint/.test(t)) return 'quality_summary'
  if (/return(s|ed)?\b|refund|rma\b|warranty|wapas/.test(t) && !/return on|returns? policy/.test(t)) return 'returns_analysis'
  if (/abc (analysis|class)|stock value|inventory value|which (items?|products?) (matter|hold)|value of (my )?(stock|inventory)/.test(t)) return 'stock_abc'
  if (/reorder (plan|list|quantit)|what (should|do) i (order|reorder|buy)|how (much|many) (to )?(order|reorder)|purchase suggestion|restock plan|order kitna/.test(t)) return 'reorder_plan'
  if (/low stock|reorder|running out|out of stock|stock alert|kam stock/.test(t)) return 'low_stock'
  if (/top (client|customer)|best (client|customer)|biggest (client|customer)/.test(t)) return 'top_clients'
  if (/(revenue|sales|billing|billed|income|kamai).*(month|trend|chart|graph)|monthly (revenue|sales)|month.?wise/.test(t)) return 'revenue_by_month'
  if (/lead.?scor|score.*leads?|leads?.*score|hot leads?|best leads?|which leads?.*(call|chase|follow|first|priorit)|prioriti[sz]e.*leads?/.test(t)) return 'lead_scores'
  if (/lead.*(status|stage|pipeline|funnel|breakdown)|pipeline|funnel|how many leads|leads (by|per)/.test(t)) return 'leads_by_status'
  return null
}

// ───────────── side-panel summary ─────────────

export interface Summary {
  leads: { total: number; fresh: number }
  invoices: { count: number; unpaidCount: number; unpaidAmount: number; overdueCount: number; billedThisMonth: number }
  inventory: { items: number; low: number }
  hasData: boolean
}

export function computeSummary(data: ByModule): Summary {
  const leads = data.CRM || []
  const invoices = data.Invoices || []
  const stock = data.Inventory || []

  const leadStatus = findField(leads, ['Status', /status|stage/i])
  const fresh = leads.filter(r => !leadStatus || /^\s*new\s*$/i.test(String(r.data[leadStatus] ?? ''))).length

  const amount = findField(invoices, AMOUNT_FIELDS)
  const status = findField(invoices, STATUS_FIELDS)
  const due = findField(invoices, DUE_FIELDS)
  const issue = findField(invoices, ISSUE_FIELDS)
  const today = todayIST()
  const thisMonth = today.slice(0, 7)

  const pending = status ? invoices.filter(r => !isPaid(r.data[status])) : []
  const unpaidAmount = pending.reduce((s, r) => s + owed(r.data, amount), 0)
  const overdueCount = due ? pending.filter(r => { const d = dayKey(r.data[due]); return d && d < today }).length : 0
  const billedThisMonth = invoices.reduce(
    (s, r) => s + (issue && monthKey(r.data[issue]) === thisMonth && amount ? toNumber(r.data[amount]) : 0),
    0
  )

  const low = computeInsight('low_stock', data).rows.length

  return {
    leads: { total: leads.length, fresh },
    invoices: { count: invoices.length, unpaidCount: pending.length, unpaidAmount, overdueCount, billedThisMonth },
    inventory: { items: stock.length, low },
    hasData: leads.length + invoices.length + stock.length > 0,
  }
}
