const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { buildLedger, balances, position, classify } = loadTs('lib/ledger.ts')
const insights = loadTs('lib/insights.ts')

const row = data => ({ id: 'r' + Math.random(), data })
const books = data => position(balances(buildLedger(data)))

test('an unpaid invoice: customer owes gross, sales and tax booked', () => {
  const p = books({ Invoices: [row({ 'Client Name': 'Raj', Amount: 10000, 'Tax Amount': 1800, 'Payment Status': 'Unpaid', 'Issue Date': '2026-11-01' })] })
  assert.equal(p.receivable, 11800)
  assert.equal(p.income, 10000)
  assert.equal(p.liabilities, 1800)
  assert.equal(p.cash, 0)
  assert.ok(p.balanced)
})

test('paying it moves money from receivable to cash', () => {
  const p = books({ Invoices: [row({ 'Client Name': 'Raj', Amount: 10000, 'Tax Amount': 1800, 'Payment Status': 'Paid', 'Issue Date': '2026-11-01' })] })
  assert.equal(p.receivable, 0)
  assert.equal(p.cash, 11800)
  assert.ok(p.balanced)
})

test('part payment', () => {
  const p = books({ Invoices: [row({ 'Client Name': 'Raj', Amount: 15000, 'Payment Status': 'Unpaid', 'Amount Received': 5000, 'Balance Due': 10000 })] })
  assert.equal(p.cash, 5000)
  assert.equal(p.receivable, 10000)
})

test('expense paid vs bill unpaid', () => {
  const p = books({ Expenses: [
    row({ Vendor: 'Landlord', Category: 'Rent', Amount: 20000, Status: 'Paid', Type: 'Expense', Date: '2026-11-01' }),
    row({ Vendor: 'Gupta Traders', Amount: 15000, Status: 'Unpaid', Type: 'Bill', Date: '2026-11-02' }),
  ] })
  assert.equal(p.expenses, 35000)
  assert.equal(p.cash, -20000)
  assert.equal(p.payable, 15000)
  assert.equal(p.profit, -35000)
  assert.ok(p.balanced)
})

test('owner capital, loan and drawings are journal entries and keep the sheet balanced', () => {
  const p = books({
    'Journal Entries': [
      row({ 'Debit Account': 'Cash and Bank', 'Credit Account': 'Owner Capital', Amount: 50000 }),
      row({ 'Debit Account': 'Cash and Bank', 'Credit Account': 'Bank Loan', Amount: 200000 }),
      row({ 'Debit Account': 'Owner Drawings', 'Credit Account': 'Cash and Bank', Amount: 10000 }),
    ],
  })
  assert.equal(p.cash, 240000)
  assert.equal(p.liabilities, 200000)
  assert.equal(p.equity, 40000)
  assert.ok(p.balanced)
})

test('everything together always balances', () => {
  const p = books({
    Invoices: [row({ 'Client Name': 'A', Amount: 1000, 'Tax Amount': 180, 'Payment Status': 'Paid' }), row({ 'Client Name': 'B', Amount: 500, 'Payment Status': 'Unpaid' })],
    Expenses: [row({ Category: 'Salary', Amount: 300, Status: 'Paid' }), row({ Vendor: 'V', Amount: 70, Type: 'Bill', Status: 'Unpaid' })],
    Returns: [row({ Customer: 'A', 'Refund Amount': 100, Status: 'Refunded' })],
    Assets: [row({ 'Asset Name': 'Laptop', 'Purchase Cost': 62000 })],
    'Journal Entries': [row({ 'Debit Account': 'Cash and Bank', 'Credit Account': 'Owner Capital', Amount: 100000 })],
  })
  assert.ok(p.balanced)
  assert.equal(p.cash, 100000 + 1180 - 300 - 100 - 62000)
})

test('account names are placed on the right side', () => {
  assert.equal(classify('Cash and Bank'), 'asset')
  assert.equal(classify('Owner Capital'), 'equity')
  assert.equal(classify('Bank Loan'), 'liability')
  assert.equal(classify('Rent'), 'expense')
  assert.equal(classify('Consulting income'), 'income')
})

test('bad rows are skipped, not crashed on', () => {
  const p = books({ Invoices: [row({ 'Client Name': 'X' }), row({ Amount: 'abc' })], 'Journal Entries': [row({ 'Debit Account': 'Cash' })] })
  assert.equal(p.assets, 0)
})

test('balance sheet card balances and explains negative cash', () => {
  const c = insights.computeInsight('balance_sheet', { Expenses: [row({ Category: 'Rent', Amount: 20000, Status: 'Paid' })] })
  assert.match(c.note, /started with/)
  assert.match(c.total, /Assets .* = Liabilities .* \+ Equity/)
})

test('trial balance card has equal totals', () => {
  const c = insights.computeInsight('trial_balance', { Invoices: [row({ 'Client Name': 'Raj', Amount: 1000, 'Payment Status': 'Unpaid' })] })
  assert.equal(c.total, 'Debits equal credits')
})

test('cash position and empty accounts', () => {
  const c = insights.computeInsight('cash_position', { 'Journal Entries': [row({ 'Debit Account': 'Cash and Bank', 'Credit Account': 'Owner Capital', Amount: 50000 })] })
  assert.match(c.total, /50,000/)
  assert.match(insights.computeInsight('balance_sheet', {}).note, /books build themselves/)
})

test('keywords', () => {
  const k = insights.pickInsightByKeywords
  assert.equal(k('show my balance sheet'), 'balance_sheet')
  assert.equal(k('what do i own and owe'), 'balance_sheet')
  assert.equal(k('show the trial balance'), 'trial_balance')
  assert.equal(k('how much cash do i have'), 'cash_position')
  assert.equal(k('show my assets'), 'assets_summary')
  assert.equal(k('what is my profit'), 'profit_loss')
})
