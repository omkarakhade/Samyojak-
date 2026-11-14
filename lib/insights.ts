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
  | 'top_clients'
  | 'gst_summary'
  | 'payment_reminders'
  | 'daily_brief'
  | 'recent_changes'

export const INSIGHT_IDS: InsightId[] = [
  'unpaid_invoices',
  'revenue_by_month',
  'leads_by_status',
  'low_stock',
  'top_clients',
  'gst_summary',
  'payment_reminders',
  'daily_brief',
  'recent_changes',
]

export const INSIGHT_MODULES: Record<InsightId, string[]> = {
  unpaid_invoices: ['Invoices'],
  revenue_by_month: ['Invoices'],
  leads_by_status: ['CRM'],
  low_stock: ['Inventory'],
  top_clients: ['Invoices'],
  gst_summary: ['Invoices'],
  payment_reminders: ['Invoices'],
  daily_brief: ['CRM', 'Invoices', 'Inventory'],
  recent_changes: ['CRM', 'Invoices', 'Quotations', 'Inventory', 'HR', 'Projects', 'Recruiting'],
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

export function inr(n: number): string {
  return Math.round(n).toLocaleString('en-US')
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

  if (id === 'recent_changes') {
    const batches = new Map<string, { when: string; module: string; source: string; n: number }>()
    for (const [module, list] of Object.entries(data)) {
      for (const r of list) {
        const key = String(r.meta?.importId || '')
        if (!key) continue
        const src = String(r.meta?.source || '')
        const at = String(r.meta?.importedAt || '')
        const cur = batches.get(key) || { when: at, module, source: src, n: 0 }
        cur.n += 1
        batches.set(key, cur)
      }
    }
    const list = Array.from(batches.values()).sort((a, b) => b.when.localeCompare(a.when)).slice(0, 12)
    const label = (s: string) => (s === 'agent_entry' ? 'Added by the assistant' : s === 'csv_import' ? 'Imported from a sheet' : 'Added')
    return {
      id,
      title: 'Recent changes',
      kind: 'table',
      columns: ['When', 'Where', 'What', 'Rows'],
      rows: list.map(b => [b.when ? b.when.slice(0, 16).replace('T', ' ') + ' UTC' : '—', b.module, label(b.source), b.n]),
      note: list.length === 0 ? 'Nothing added through the chat yet.' : 'Shows what was added by the assistant or by sheet imports. Use Undo on the message where it happened to reverse it.',
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
          : 'Copy a message and send it by email or chat. Nothing is sent automatically.',
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
  if (/remind|chase|draft.*(message|reminder)|dunning|collect.*(payment|money)/.test(t)) return 'payment_reminders'
  if (/focus on|needs? (my )?attention|today|daily brief|morning brief|priorit/.test(t)) return 'daily_brief'
  if (/\bgst\b|gstr|\bvat\b|sales tax|tax (summary|collected|due|report)|cgst|sgst|igst/.test(t)) return 'gst_summary'
  if (/unpaid|overdue|outstanding|pending (payment|invoice)|not paid|baki|bakaya|payment (due|pending)|who owes/.test(t)) return 'unpaid_invoices'
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
