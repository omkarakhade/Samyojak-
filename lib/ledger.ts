// Double-entry books, built automatically from what the owner already recorded.
// Nobody sets up a chart of accounts: every invoice, payment, expense, bill, refund, asset and journal entry
// is turned into balanced debit/credit lines here, so the trial balance and balance sheet always agree.
// Pure functions (no storage, no network), so they are easy to test.

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export interface Entry {
  date: string
  account: string
  type: AccountType
  debit: number
  credit: number
  memo: string
  source: string
}

type Row = { id: string; data: Record<string, any> }
import { rateTable, conversionFor } from '@/lib/currency'
import { depreciationFor } from '@/lib/depreciation'

export type LedgerData = Record<string, Row[]>

export const CASH = 'Cash and Bank'
export const AR = 'Accounts Receivable'
export const AP = 'Accounts Payable'
export const SALES = 'Sales'
export const TAX = 'Tax Payable'
export const FIXED = 'Fixed Assets'
export const RETURNS = 'Sales Returns'
export const CAPITAL = 'Owner Capital'
export const DEPRECIATION = 'Depreciation'
export const ACC_DEPRECIATION = 'Accumulated Depreciation'

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
function iso(v: unknown): string {
  const s = String(v ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const t = Date.parse(s)
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : ''
}
function pick(d: Record<string, any>, names: string[]): any {
  for (const n of names) if (d[n] !== undefined && String(d[n]).trim() !== '') return d[n]
  const keys = Object.keys(d)
  for (const n of names) {
    const hit = keys.find(k => k.toLowerCase() === n.toLowerCase())
    if (hit && String(d[hit]).trim() !== '') return d[hit]
  }
  return undefined
}
const paid = (v: unknown) => /^(paid|settled|received|complete[d]?)$/i.test(String(v ?? '').trim())
const money = (n: number) => Math.round(n * 100) / 100

/** Which side of the books a free-text account name belongs to (used for journal entries typed by the owner). */
export function classify(name: string): AccountType {
  const t = name.toLowerCase()
  if (/capital|equity|drawing|owner|proprietor|retained|reserve|partner/.test(t)) return 'equity'
  if (/payable|loan|borrow|liabilit|credit card|overdraft|deposit received|advance (from|received)|deferred|gst|vat|tax payable|duty/.test(t)) return 'liability'
  if (/cash|bank|receivable|debtor|inventory|stock|asset|prepaid|deposit|equipment|machinery|vehicle|furniture|computer|investment|advance (to|paid)/.test(t)) return 'asset'
  if (/sales|revenue|income|interest received|commission received|service fee|fees earned|discount received/.test(t)) return 'income'
  return 'expense'
}

function pair(out: Entry[], date: string, source: string, memo: string, amount: number,
  debit: { account: string; type: AccountType }, credit: { account: string; type: AccountType }) {
  const a = money(amount)
  if (!(a > 0)) return
  out.push({ date, account: debit.account, type: debit.type, debit: a, credit: 0, memo, source })
  out.push({ date, account: credit.account, type: credit.type, debit: 0, credit: a, memo, source })
}

const asset = (account: string) => ({ account, type: 'asset' as AccountType })
const liab = (account: string) => ({ account, type: 'liability' as AccountType })
const income = (account: string) => ({ account, type: 'income' as AccountType })
const expense = (account: string) => ({ account, type: 'expense' as AccountType })

export function buildLedger(data: LedgerData, today?: string): Entry[] {
  const out: Entry[] = []
  const rates = rateTable(data['Currency Rates'] || [])
  const asOf = today || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  // Invoices: what you billed, the tax you collected for the government, and the money that came in.
  for (const r of data.Invoices || []) {
    const d = r.data
    const client = String(pick(d, ['Client Name', 'Client', 'Customer']) ?? 'Customer')
    const date = iso(pick(d, ['Issue Date', 'Date', 'Invoice Date']))
    let net = num(pick(d, ['Amount']))
    let tax = num(pick(d, ['Tax Amount']))
    if (!(net > 0)) { net = num(pick(d, ['Total'])); tax = 0 }
    if (!(net > 0)) continue
    // Foreign-currency invoices are kept in rupees in the books.
    const fx = conversionFor(d, rates).rate
    net = money(net * fx)
    tax = money(tax * fx)
    const gross = net + tax
    const memo = `Invoice to ${client}`
    pair(out, date, 'Invoices', memo, net, asset(AR), income(SALES))
    pair(out, date, 'Invoices', memo, tax, asset(AR), liab(TAX))
    const status = pick(d, ['Payment Status', 'Status'])
    const payDate = iso(pick(d, ['Paid Date'])) || date
    if (paid(status)) {
      pair(out, payDate, 'Payments', `Payment from ${client}`, gross, asset(CASH), asset(AR))
    } else {
      const got = num(pick(d, ['Amount Received'])) * fx
      if (got > 0) pair(out, payDate, 'Payments', `Part payment from ${client}`, Math.min(got, gross), asset(CASH), asset(AR))
    }
  }

  // Expenses and bills: cost goes to its category, and either cash went out or you now owe the supplier.
  for (const r of data.Expenses || []) {
    const d = r.data
    const amount = num(pick(d, ['Amount', 'Total'])) * conversionFor(d, rates).rate
    if (!(amount > 0)) continue
    const isBill = /^bill$/i.test(String(pick(d, ['Type']) ?? ''))
    const category = String(pick(d, ['Category']) ?? '').trim() || (isBill ? 'Purchases' : 'General Expenses')
    const vendor = String(pick(d, ['Vendor', 'Vendor Name']) ?? '').trim()
    const date = iso(pick(d, ['Date', 'Bill Date', 'Expense Date', 'Due Date']))
    const memo = `${isBill ? 'Bill' : 'Expense'}${vendor ? ' from ' + vendor : ''}`
    const settled = paid(pick(d, ['Status', 'Payment Status']))
    pair(out, date, 'Expenses', memo, amount, expense(category), settled ? asset(CASH) : liab(AP))
  }

  // Refunds paid to customers.
  for (const r of data.Returns || []) {
    const d = r.data
    const amount = num(pick(d, ['Refund Amount']))
    if (!(amount > 0) || !/^refunded$/i.test(String(pick(d, ['Status']) ?? '').trim())) continue
    pair(out, iso(pick(d, ['Return Date'])), 'Returns', `Refund to ${pick(d, ['Customer']) ?? 'customer'}`, amount, income(RETURNS), asset(CASH))
  }

  // Things the business owns: bought for cash unless a journal entry says otherwise.
  for (const r of data.Assets || []) {
    const d = r.data
    const cost = num(pick(d, ['Purchase Cost', 'Cost']))
    if (!(cost > 0)) continue
    pair(out, iso(pick(d, ['Purchase Date'])), 'Assets', `Bought ${pick(d, ['Asset Name']) ?? 'asset'}`, cost, asset(FIXED), asset(CASH))
  }

  // Depreciation to date for assets that have a Useful Life Years: written down automatically, nothing to post.
  for (const line of depreciationFor(data.Assets || [], asOf)) {
    pair(out, asOf, 'Depreciation', `Depreciation on ${line.asset}`, line.accumulated, expense(DEPRECIATION), asset(ACC_DEPRECIATION))
  }

  // Money moves that are not a sale or an expense: capital put in, loans, drawings.
  for (const r of data['Journal Entries'] || []) {
    const d = r.data
    const dr = String(pick(d, ['Debit Account', 'Debit']) ?? '').trim()
    const cr = String(pick(d, ['Credit Account', 'Credit']) ?? '').trim()
    const amount = num(pick(d, ['Amount']))
    if (!dr || !cr || !(amount > 0)) continue
    pair(out, iso(pick(d, ['Date'])), 'Journal', String(pick(d, ['Narration', 'Notes']) ?? 'Journal entry'),
      amount, { account: dr, type: classify(dr) }, { account: cr, type: classify(cr) })
  }
  return out
}

export interface Balance {
  account: string
  type: AccountType
  debit: number
  credit: number
  /** Natural balance: positive when the account is on its normal side. */
  balance: number
}

const ORDER: AccountType[] = ['asset', 'liability', 'equity', 'income', 'expense']

export function balances(entries: Entry[]): Balance[] {
  const map = new Map<string, Balance>()
  for (const e of entries) {
    const key = e.account.toLowerCase()
    const cur = map.get(key) || { account: e.account, type: e.type, debit: 0, credit: 0, balance: 0 }
    cur.debit += e.debit
    cur.credit += e.credit
    map.set(key, cur)
  }
  const list = Array.from(map.values())
  for (const b of list) {
    b.debit = money(b.debit)
    b.credit = money(b.credit)
    const net = b.debit - b.credit
    b.balance = money(b.type === 'asset' || b.type === 'expense' ? net : -net)
  }
  return list.sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || a.account.localeCompare(b.account))
}

export interface Position {
  cash: number
  receivable: number
  payable: number
  income: number
  expenses: number
  profit: number
  assets: number
  liabilities: number
  /** Capital put in minus drawings, plus profit so far. */
  equity: number
  balanced: boolean
}

export function position(list: Balance[]): Position {
  const sum = (t: AccountType) => money(list.filter(b => b.type === t).reduce((s, b) => s + b.balance, 0))
  const get = (name: string) => list.find(b => b.account.toLowerCase() === name.toLowerCase())?.balance || 0
  const assets = sum('asset')
  const liabilities = sum('liability')
  const incomeTotal = sum('income')
  const expenses = sum('expense')
  const profit = money(incomeTotal - expenses)
  const equity = money(sum('equity') + profit)
  return {
    cash: get(CASH),
    receivable: get(AR),
    payable: get(AP),
    income: incomeTotal,
    expenses,
    profit,
    assets,
    liabilities,
    equity,
    balanced: Math.abs(assets - liabilities - equity) < 0.01,
  }
}
