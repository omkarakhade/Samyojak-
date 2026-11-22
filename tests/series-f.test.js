const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs, state, USER } = require('./helpers')
const { annualTax, deductionsFor } = loadTs('lib/statutory.ts')
const { payrollFor } = loadTs('lib/payroll.ts')
const { depreciationFor, wholeMonths } = loadTs('lib/depreciation.ts')
const { stockLines, byWarehouse, expiring, planTransfer } = loadTs('lib/stockReports.ts')
const { budgetVsActual } = loadTs('lib/budgets.ts')
const { gstSummary } = loadTs('lib/gst.ts')
const { statementLines, bookMoves, reconcile } = loadTs('lib/bank.ts')
const { rateTable, conversionFor, currencyCode } = loadTs('lib/currency.ts')
const { buildLedger, balances, position } = loadTs('lib/ledger.ts')
const { resolveOperations } = loadTs('lib/agentPlan.ts')
const { computeInsight, pickInsightByKeywords } = loadTs('lib/insights.ts')

const row = (id, data) => ({ id, data })
const stored = (id, module, data) => ({ id, fields: { Module: module, 'Record Data': JSON.stringify(data) } })

// ───── payroll deductions ─────
test('PF is 12% up to the 15,000 ceiling; ESI only up to 21,000 gross; all off by default', () => {
  assert.deepEqual(deductionsFor({ Name: 'A' }, 20000, 20000), { pfEmployee: 0, pfEmployer: 0, esiEmployee: 0, esiEmployer: 0, tds: 0 })
  const d = deductionsFor({ PF: 'Yes', ESI: 'Yes' }, 20000, 20000)
  assert.equal(d.pfEmployee, 1800)
  assert.equal(d.pfEmployer, 1800)
  assert.equal(d.esiEmployee, 150) // 0.75% of 20,000
  assert.equal(d.esiEmployer, 650)
  assert.equal(deductionsFor({ ESI: 'Yes' }, 25000, 25000).esiEmployee, 0)
  assert.equal(deductionsFor({ PF: 'Yes' }, 10000, 10000).pfEmployee, 1200)
})

test('income tax estimate: nothing up to 12.75 lakh salary, then slabs with cess', () => {
  assert.equal(annualTax(1275000), 0) // 12.75L - 75k = 12L taxable, rebate
  assert.equal(annualTax(600000), 0)
  // 20 lakh salary: taxable 19.25L -> 0+20000+40000+60000+(19.25-16)*20% = 170000+... compute below
  const taxable = 2000000 - 75000
  const base = 0.05 * 400000 + 0.1 * 400000 + 0.15 * 400000 + 0.2 * (taxable - 1600000)
  assert.equal(Math.round(annualTax(2000000)), Math.round(base * 1.04))
  assert.ok(annualTax(1300000) < 50000) // marginal relief just above the limit
})

test('payroll uses deductions and reports what is owed to the government', () => {
  const p = payrollFor('2026-11', [row('s1', { Name: 'Simran', Salary: 20000, PF: 'Yes', ESI: 'Yes' }), row('s2', { Name: 'Ravi', Salary: 30000 })], [], [])
  const s = p.lines.find(l => l.employee === 'Simran')
  assert.equal(s.net, 20000 - 1800 - 150)
  assert.equal(s.employer, 1800 + 650)
  assert.equal(p.lines.find(l => l.employee === 'Ravi').net, 30000)
  assert.equal(p.dues, 1800 + 150 + 1800 + 650)
})

test('run_payroll records net pay plus one unpaid government bill, once', async () => {
  state.rows = [stored('recHR0000000000001', 'HR', { Name: 'Simran', Salary: 20000, PF: 'Yes' })]
  const r = await resolveOperations(USER, [{ op: 'run_payroll' }])
  const recs = r.actions.find(a => a.type === 'add' && a.module === 'Expenses').records
  assert.equal(recs.find(x => x.Vendor === 'Simran').Amount, 18200)
  const gov = recs.find(x => /Government/.test(x.Vendor))
  assert.equal(gov.Amount, 3600)
  assert.equal(gov.Status, 'Unpaid')
})

// ───── depreciation ─────
test('straight-line depreciation by whole months, capped at cost less salvage', () => {
  assert.equal(wholeMonths('2026-01-15', '2026-11-14'), 9)
  assert.equal(wholeMonths('2026-01-15', '2026-11-15'), 10)
  const l = depreciationFor([row('a', { 'Asset Name': 'Laptop', 'Purchase Cost': 60000, 'Purchase Date': '2025-11-01', 'Useful Life Years': 5, 'Salvage Value': 0 })], '2026-11-22')[0]
  assert.equal(l.monthly, 1000)
  assert.equal(l.accumulated, 12000)
  assert.equal(l.bookValue, 48000)
  const old = depreciationFor([row('a', { 'Asset Name': 'Old', 'Purchase Cost': 10000, 'Purchase Date': '2000-01-01', 'Useful Life Years': 5, 'Salvage Value': 1000 })], '2026-11-22')[0]
  assert.equal(old.bookValue, 1000)
  assert.equal(old.monthsLeft, 0)
  assert.equal(depreciationFor([row('a', { 'Purchase Cost': 5000, 'Purchase Date': '2025-01-01' })], '2026-11-22').length, 0)
})

test('depreciation flows into the books and they still balance', () => {
  const data = {
    'Journal Entries': [row('j', { Date: '2025-10-01', 'Debit Account': 'Cash and Bank', 'Credit Account': 'Owner Capital', Amount: 100000 })],
    Assets: [row('a', { 'Asset Name': 'Laptop', 'Purchase Cost': 60000, 'Purchase Date': '2025-11-01', 'Useful Life Years': 5 })],
  }
  const pos = position(balances(buildLedger(data, '2026-11-22')))
  assert.equal(pos.expenses, 12000)
  assert.equal(pos.profit, -12000)
  assert.equal(pos.balanced, true)
  assert.equal(pos.assets, 100000 - 60000 + 60000 - 12000)
})

// ───── currency ─────
test('currency codes, latest rate wins, own rate beats the table, missing rate is flagged', () => {
  assert.equal(currencyCode('$'), 'USD')
  assert.equal(currencyCode('US Dollar'), 'USD')
  assert.equal(currencyCode(''), 'INR')
  const rates = rateTable([row('1', { Currency: 'USD', Rate: 80, Date: '2026-01-01' }), row('2', { Currency: 'usd', Rate: 84, Date: '2026-11-01' })])
  assert.equal(rates.get('USD'), 84)
  assert.equal(conversionFor({ Currency: 'USD' }, rates).rate, 84)
  assert.equal(conversionFor({ Currency: 'USD', 'Exchange Rate': 90 }, rates).rate, 90)
  assert.equal(conversionFor({ Currency: 'EUR' }, rates).missingRate, true)
  assert.equal(conversionFor({}, rates).rate, 1)
})

test('a dollar invoice is kept in rupees in the books', () => {
  const data = {
    Invoices: [row('i', { 'Client Name': 'Acme', Amount: 500, Currency: 'USD', 'Payment Status': 'Unpaid', 'Issue Date': '2026-11-01' })],
    'Currency Rates': [row('r', { Currency: 'USD', Rate: 84, Date: '2026-11-01' })],
  }
  const pos = position(balances(buildLedger(data, '2026-11-22')))
  assert.equal(pos.income, 42000)
  assert.equal(pos.receivable, 42000)
})

// ───── stock ─────
const inv = [
  row('1', { 'Item Name': 'Steel sheet', 'Current Stock': 100, 'Cost Price': 40, 'Unit Price': 60, Warehouse: 'Main' }),
  row('2', { 'Item Name': 'Steel sheet', 'Current Stock': 20, 'Cost Price': 40, Warehouse: 'Pune shop' }),
  row('3', { 'Item Name': 'Paint', 'Current Stock': 10, 'Unit Price': 200, 'Batch No': 'B7', 'Expiry Date': '2026-12-10' }),
  row('4', { 'Item Name': 'Glue', 'Current Stock': 5, 'Cost Price': 10, 'Expiry Date': '2026-10-01' }),
]

test('stock value uses cost, falls back to price and says so', () => {
  const l = stockLines(inv)
  assert.equal(l[0].value, 4000)
  assert.equal(l[0].basis, 'cost')
  assert.equal(l[2].basis, 'price')
  assert.equal(l[2].value, 2000)
  assert.equal(l[2].warehouse, 'Main')
})

test('stock by warehouse groups rows; no Warehouse means Main', () => {
  const w = byWarehouse(inv)
  assert.equal(w.find(x => x.warehouse === 'Main').items, 3)
  assert.equal(w.find(x => x.warehouse === 'Pune shop').units, 20)
})

test('expiring stock lists expired and soon-to-expire batches, soonest first', () => {
  const e = expiring(inv, '2026-11-22', 60)
  assert.deepEqual(e.map(x => x.item), ['Glue', 'Paint'])
  assert.equal(e[0].daysLeft < 0, true)
  assert.equal(e[1].daysLeft, 18)
})

test('transfers: moves between rows, creates a destination row, refuses too much', () => {
  const ok = planTransfer(inv, 'steel sheet', 'Main', 'Pune shop', 30)
  assert.equal(ok.ok, true)
  assert.equal(ok.fromStock, 70)
  assert.equal(ok.toStock, 50)
  const fresh = planTransfer(inv, 'Steel sheet', 'Main', 'Mumbai', 10)
  assert.equal(fresh.newRow.Warehouse, 'Mumbai')
  assert.equal(fresh.newRow['Current Stock'], 10)
  assert.equal(fresh.newRow['Cost Price'], 40)
  assert.equal(planTransfer(inv, 'Steel sheet', 'Main', 'Pune shop', 500).ok, false)
  assert.equal(planTransfer(inv, 'Steel sheet', 'Goa', 'Pune shop', 1).ok, false)
  assert.equal(planTransfer(inv, 'Steel sheet', 'Main', 'main', 1).ok, false)
})

test('transfer_stock by chat: updates both rows; new warehouse adds a row', async () => {
  state.rows = [stored('recINV0000000001', 'Inventory', { 'Item Name': 'Steel sheet', 'Current Stock': 100, Warehouse: 'Main' })]
  const r = await resolveOperations(USER, [{ op: 'transfer_stock', item: 'Steel sheet', to: 'Pune shop', qty: 40 }])
  const up = r.actions.find(a => a.type === 'update')
  assert.equal(up.changes['Current Stock'], 60)
  const add = r.actions.find(a => a.type === 'add' && a.module === 'Inventory')
  assert.equal(add.records[0]['Current Stock'], 40)
  assert.equal(add.records[0].Warehouse, 'Pune shop')
})

// ───── budgets ─────
test('budget vs actual: over, close, unbudgeted, standing vs month-specific', () => {
  const budgets = [
    row('1', { Category: 'Marketing', 'Monthly Budget': 20000 }),
    row('2', { Category: 'Rent', 'Monthly Budget': 10000 }),
    row('3', { Category: 'Rent', 'Monthly Budget': 12000, Month: '2026-11' }),
    row('4', { Category: 'Travel', 'Monthly Budget': 5000, Month: '2026-10' }),
  ]
  const exp = [
    row('a', { Category: 'marketing', Amount: 25000, Date: '2026-11-03' }),
    row('b', { Category: 'Rent', Amount: 10000, Date: '2026-11-01' }),
    row('c', { Category: 'Food', Amount: 700, Date: '2026-11-05' }),
    row('d', { Category: 'Marketing', Amount: 999, Date: '2026-10-05' }),
  ]
  const r = budgetVsActual(budgets, exp, '2026-11')
  assert.equal(r.lines.find(l => l.category === 'Marketing').status, 'over')
  assert.equal(r.lines.find(l => l.category === 'Rent').budget, 12000)
  assert.equal(r.lines.find(l => l.category === 'Rent').status, 'close')
  assert.equal(r.lines.some(l => l.category === 'Travel'), false)
  assert.deepEqual(r.unbudgeted, [{ category: 'Food', spent: 700 }])
})

// ───── GST ─────
test('GST return: B2B vs B2C, input credit, net payable, bad GSTIN', () => {
  const inv = [
    row('1', { 'Client Name': 'Acme', Amount: 100000, 'Tax Amount': 18000, GSTIN: '27ABCDE1234F1Z5', 'Issue Date': '2026-10-05' }),
    row('2', { 'Client Name': 'Walk-in', Amount: 5000, 'Tax Amount': 900, 'Issue Date': '2026-10-09' }),
    row('3', { 'Client Name': 'Bad', Amount: 1000, 'Tax Amount': 180, GSTIN: '123', 'Issue Date': '2026-10-10' }),
    row('4', { 'Client Name': 'Other month', Amount: 9999, 'Tax Amount': 1800, 'Issue Date': '2026-09-10' }),
    row('5', { 'Client Name': 'NoTax', Amount: 2000, 'Issue Date': '2026-10-11' }),
  ]
  const exp = [row('e', { Amount: 11800, 'GST Amount': 1800, Date: '2026-10-07' })]
  const g = gstSummary(inv, exp, '2026-10')
  assert.equal(g.b2b.invoices, 2)
  assert.equal(g.b2c.invoices, 2)
  assert.equal(g.outputTax, 19080)
  assert.equal(g.inputCredit, 1800)
  assert.equal(g.netPayable, 17280)
  assert.deepEqual(g.badGstin, ['Bad'])
  assert.equal(g.noTax, 1)
})

// ───── bank reconciliation ─────
test('bank statement lines: one signed column or credit/debit, day-first dates', () => {
  const l = statementLines([
    row('1', { Date: '15/11/2026', Description: 'NEFT Raj', Amount: 5000 }),
    row('2', { Date: '2026-11-16', Description: 'Rent', Debit: 20000 }),
    row('3', { Date: '2026-11-17', Description: 'Cash dep', Credit: 1000 }),
  ])
  assert.deepEqual(l.map(x => x.amount), [5000, -20000, 1000])
  assert.equal(l[0].date, '2026-11-15')
})

test('reconciliation matches by amount and date window, once each', () => {
  const data = {
    Invoices: [row('i', { 'Client Name': 'Raj', Amount: 5000, 'Payment Status': 'Paid', 'Issue Date': '2026-11-10', 'Paid Date': '2026-11-14' })],
    Expenses: [row('e', { Vendor: 'Landlord', Category: 'Rent', Amount: 20000, Status: 'Paid', Date: '2026-11-16' }), row('e2', { Vendor: 'Paper', Amount: 300, Status: 'Paid', Date: '2026-11-18' })],
  }
  const moves = bookMoves(buildLedger(data, '2026-11-22'), 'Cash and Bank')
  const lines = statementLines([
    row('1', { Date: '2026-11-15', Description: 'NEFT Raj', Amount: 5000 }),
    row('2', { Date: '2026-11-17', Description: 'Rent', Amount: -20000 }),
    row('3', { Date: '2026-11-19', Description: 'Bank charge', Amount: -350 }),
  ])
  const rec = reconcile(lines, moves)
  assert.equal(rec.matched.length, 2)
  assert.deepEqual(rec.bankOnly.map(l => l.description), ['Bank charge'])
  assert.deepEqual(rec.booksOnly.map(m => m.amount), [-300])
})

// ───── routing ─────
test('Series F questions route to the right report without hijacking old ones', () => {
  const p = t => pickInsightByKeywords(t)
  assert.equal(p('what is my stock worth'), 'stock_value')
  assert.equal(p('stock value'), 'stock_value')
  assert.equal(p('stock by warehouse'), 'warehouse_stock')
  assert.equal(p('which items are expiring'), 'expiring_stock')
  assert.equal(p('reconcile my bank statement'), 'bank_reconciliation')
  assert.equal(p('how am i doing against budget'), 'budget_vs_actual')
  assert.equal(p('asset depreciation'), 'depreciation')
  assert.equal(p('prepare my gst return'), 'gst_return')
  assert.equal(p('how much do clients abroad owe in dollars'), 'currency_exposure')
  assert.equal(p('show low stock'), 'low_stock')
  assert.equal(p('which assets have warranty expiring'), 'assets_summary')
  assert.equal(p('gst summary'), 'gst_summary')
})

test('reports compute without crashing on empty data', () => {
  for (const id of ['stock_value', 'warehouse_stock', 'expiring_stock', 'bank_reconciliation', 'budget_vs_actual', 'depreciation', 'gst_return', 'currency_exposure']) {
    const c = computeInsight(id, {})
    assert.ok(c.title, id)
    assert.ok(Array.isArray(c.rows), id)
  }
})
