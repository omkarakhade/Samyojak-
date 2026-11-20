import type { UserRow } from '@/lib/userData'

/**
 * Answers that show: fixed, safe calculations over the user's own records.
 * The AI only PICKS which insight fits a question; the numbers are computed here in code.
 */

export type InsightId =
  | 'unpaid_invoices'
  | 'revenue_by_month'
  | 'leads_by_status'
  | 'low_stock'
  | 'stock_abc'
  | 'returns_analysis'
  | 'reorder_plan'
  | 'top_clients'
  | 'receivables_aging'
  | 'client_concentration'
  | 'gst_summary'
  | 'payment_reminders'
  | 'daily_brief'
  | 'recent_changes'
  | 'profit_loss'
  | 'bills_due'

export const INSIGHT_IDS: InsightId[] = [
  'unpaid_invoices',
  'revenue_by_month',
  'leads_by_status',
  'low_stock',
  'stock_abc',
  'returns_analysis',
  'reorder_plan',
  'top_clients',
  'receivables_aging',
  'client_concentration',
  'gst_summary',
  'payment_reminders',
  'daily_brief',
  'recent_changes',
  'profit_loss',
  'bills_due',
]

export const INSIGHT_MODULES: Record<InsightId, string[]> = {
  unpaid_invoices: ['Invoices'],
  revenue_by_month: ['Invoices'],
  leads_by_status: ['CRM'],
  low_stock: ['Inventory'],
  stock_abc: ['Inventory'],
  returns_analysis: ['Returns'],
  reorder_plan: ['Inventory'],
  top_clients: ['Invoices'],
  receivables_aging: ['Invoices'],
  client_concentration: ['Invoices'],
  gst_summary: ['Invoices'],
  payment_reminders: ['Invoices'],
  daily_brief: ['CRM', 'Invoices', 'Inventory'],
  profit_loss: ['Invoices', 'Expenses'],
  bills_due: ['Expenses'],
  recent_changes: ['CRM', 'Invoices', 'Quotations', 'Inventory', 'HR', 'Projects', 'Recruiting', 'Expenses', 'Vendors', 'Purchase Orders', 'Returns'],
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

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

const CLIENT_FIELDS = ['Client Name', /client|customer|party|buyer/i, /^name$/i]
const AMOUNT_FIELDS = ['Amount', /^amount/i, /grand.*total|total.*amount|^total$|net.*amount|invoice.*value|^value$/i]
const TAX_FIELDS = ['Tax Amount', /tax.*amount|gst.*amount|^gst$|^tax$|igst|cgst/i]
const STATUS_FIELDS = ['Payment Status', /payment.*status|^status$|paid/i]
const ISSUE_FIELDS = ['Issue Date', /issue.*date|invoice.*date|^date$/i]
const DUE_FIELDS = ['Due Date', /due/i]

function isPaid(v: unknown) {
  return /^\s*paid\s*$/i.test(String(v ?? ''))
}

// ───────────── insights ─────────────

export function computeInsight(id: InsightId, data: ByModule): InsightCard {
  const invoices = data.Invoices || []
  const leads = data.CRM || []
  const stock = data.Inventory || []
  const returns = data.Returns || []

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

    const sum = pending.reduce((s, r) => s + (amount ? toNumber(r.data[amount]) : 0), 0)
    const overdue = due ? pending.filter(r => { const d = dayKey(r.data[due]); return d && d < today }).length : 0

    return {
      id,
      title: 'Unpaid invoices',
      kind: 'table',
      columns: ['Client', 'Amount', 'Due', 'Status'],
      rows: pending.slice(0, 15).map(r => [
        client ? String(r.data[client] ?? '') : '—',
        amount ? inr(toNumber(r.data[amount])) : '—',
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
      const amt = amount ? inr(toNumber(r.data[amount])) : ''
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
      const amt = amount ? toNumber(r.data[amount]) : 0
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
  if (/recent (change|activity)|what did you (change|add|do)|activity log|audit|history of (change|import)/.test(t)) return 'recent_changes'
  if (/profit|loss|p&l|p and l|net income|earn(ed|ing)s?\b|kitna (bacha|kamaya)|margin/.test(t)) return 'profit_loss'
  if (/bills? (to pay|due)|what do i owe|i owe|payables?|unpaid bills|vendor.*(due|pay)/.test(t)) return 'bills_due'
  if (/remind|chase|draft.*(message|reminder)|dunning|collect.*(payment|money)/.test(t)) return 'payment_reminders'
  if (/focus on|needs? (my )?attention|today|daily brief|morning brief|priorit/.test(t)) return 'daily_brief'
  if (/\bgst\b|gstr|\bvat\b|sales tax|tax (summary|collected|due|report)|cgst|sgst|igst/.test(t)) return 'gst_summary'
  if (/aging|ageing|receivables?|how (old|late) (are|is)|overdue (by|bucket)|\b(30|60|90) days (late|overdue)|older than \d+ days/.test(t)) return 'receivables_aging'
  if (/concentration|depend(s|ent|ence)? on|too (much|many).*(one|single) client|(share|percent|%).*(top|biggest|best) (client|customer)|(top|biggest|best) (client|customer).*(share|percent|%)|client risk/.test(t)) return 'client_concentration'
  if (/unpaid|overdue|outstanding|pending (payment|invoice)|not paid|baki|bakaya|payment (due|pending)|who owes/.test(t)) return 'unpaid_invoices'
  if (/return(s|ed)?\b|refund|rma\b|warranty|wapas/.test(t) && !/return on|returns? policy/.test(t)) return 'returns_analysis'
  if (/abc (analysis|class)|stock value|inventory value|which (items?|products?) (matter|hold)|value of (my )?(stock|inventory)/.test(t)) return 'stock_abc'
  if (/reorder (plan|list|quantit)|what (should|do) i (order|reorder|buy)|how (much|many) (to )?(order|reorder)|purchase suggestion|restock plan|order kitna/.test(t)) return 'reorder_plan'
  if (/low stock|reorder|running out|out of stock|stock alert|kam stock/.test(t)) return 'low_stock'
  if (/top (client|customer)|best (client|customer)|biggest (client|customer)/.test(t)) return 'top_clients'
  if (/(revenue|sales|billing|billed|income|kamai).*(month|trend|chart|graph)|monthly (revenue|sales)|month.?wise/.test(t)) return 'revenue_by_month'
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
  const unpaidAmount = pending.reduce((s, r) => s + (amount ? toNumber(r.data[amount]) : 0), 0)
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
