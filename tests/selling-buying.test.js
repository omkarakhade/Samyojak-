const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs, state, USER } = require('./helpers')
const { nextBillingDate, dueRecurring, monthlyRecurringTotal } = loadTs('lib/recurring.ts')
const { resolveOperations } = loadTs('lib/agentPlan.ts')
const { computeInsight, pickInsightByKeywords } = loadTs('lib/insights.ts')
const { sanitizeActions } = loadTs('lib/agentTools.ts')

const row = (id, data) => ({ id, data })
const stored = (id, module, data) => ({ id, fields: { Module: module, 'Record Data': JSON.stringify(data) } })

test('billing dates move by one period and keep month ends', () => {
  assert.equal(nextBillingDate('2026-01-31', 'Monthly'), '2026-02-28')
  assert.equal(nextBillingDate('2026-12-15', 'Monthly'), '2027-01-15')
  assert.equal(nextBillingDate('2026-11-01', 'Quarterly'), '2027-02-01')
  assert.equal(nextBillingDate('2026-11-01', 'Weekly'), '2026-11-08')
  assert.equal(nextBillingDate('2026-11-01', 'Yearly'), '2027-11-01')
})

test('only active recurring bills whose date has come are due; missed periods are counted', () => {
  const rows = [
    row('a', { 'Client Name': 'Prithviraj', Amount: 2000, Frequency: 'Monthly', 'Next Date': '2026-11-01', Status: 'Active' }),
    row('b', { 'Client Name': 'Later', Amount: 500, Frequency: 'Monthly', 'Next Date': '2026-12-01' }),
    row('c', { 'Client Name': 'Paused', Amount: 500, Frequency: 'Monthly', 'Next Date': '2026-10-01', Status: 'Paused' }),
    row('d', { 'Client Name': 'Behind', Amount: 100, Frequency: 'Monthly', 'Next Date': '2026-08-15' }),
  ]
  const due = dueRecurring(rows, '2026-11-22')
  assert.deepEqual(due.map(d => d.client), ['Behind', 'Prithviraj'])
  assert.equal(due[1].nextAfter, '2026-12-01')
  assert.equal(due[0].missed, 4)
  assert.equal(due[0].nextAfter, '2026-12-15')
  assert.equal(monthlyRecurringTotal(rows.filter(r => r.id !== 'c')), 2600)
})

test('bill_recurring makes an invoice and moves the next date', async () => {
  state.rows = [stored('recREC00000000001', 'Recurring Invoices', { 'Client Name': 'Prithviraj', Description: 'Website maintenance', Amount: 2000, Frequency: 'Monthly', 'Next Date': '2026-09-01', Status: 'Active' })]
  const r = await resolveOperations(USER, [{ op: 'bill_recurring' }])
  const inv = r.actions.find(a => a.type === 'add' && a.module === 'Invoices')
  assert.equal(inv.records[0].Amount, 2000)
  assert.equal(inv.records[0]['Payment Status'], 'Unpaid')
  const up = r.actions.find(a => a.type === 'update' && a.module === 'Recurring Invoices')
  assert.ok(up.changes['Next Date'] > '2026-09-01')
})

test('bill_recurring with nothing due says so', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [{ op: 'bill_recurring' }])
  assert.equal(r.actions.length, 0)
  assert.match(r.notes[0], /No recurring bills/)
})

test('receive_po updates the order with the receipt kind; already received is refused', async () => {
  state.rows = [stored('recPO000000000001', 'Purchase Orders', { 'PO Number': 'PO-1', Vendor: 'Steel Traders', Item: 'Steel sheet', Quantity: 100, Status: 'Ordered' })]
  const r = await resolveOperations(USER, [{ op: 'receive_po', find: 'Steel Traders' }])
  const u = r.actions[0]
  assert.equal(u.kind, 'receive_po')
  assert.equal(u.changes.Status, 'Received')
  state.rows = [stored('recPO000000000001', 'Purchase Orders', { Vendor: 'Steel Traders', Item: 'Steel sheet', Quantity: 100, Status: 'Received', 'Stock Received': 'Steel sheet:100' })]
  const r2 = await resolveOperations(USER, [{ op: 'receive_po', find: 'Steel Traders' }])
  assert.equal(r2.actions.length, 0)
  assert.match(r2.notes[0], /already received/)
})

test('the model cannot forge stock-receipt fields', () => {
  const out = sanitizeActions([{ type: 'add', module: 'Purchase Orders', records: [{ Vendor: 'X', 'Stock Received': 'Steel sheet:9999' }] }])
  assert.equal(out[0].records[0]['Stock Received'], undefined)
})

test('convert_order invoices the order and marks it delivered', async () => {
  state.rows = [stored('recSO000000000001', 'Sales Orders', { 'Order No': 'SO-1', 'Client Name': 'Mehta', 'Line Items': 'Laptop x2 @50000', Amount: 100000, Status: 'Confirmed' })]
  const r = await resolveOperations(USER, [{ op: 'convert_order', find: 'Mehta' }])
  const inv = r.actions.find(a => a.type === 'add' && a.module === 'Invoices')
  assert.equal(inv.records[0].Amount, 100000)
  assert.equal(inv.records[0]['Line Items'], 'Laptop x2 @50000')
  assert.equal(r.actions.find(a => a.type === 'update').changes.Status, 'Delivered')
})

test('recurring questions route to the recurring report', () => {
  assert.equal(pickInsightByKeywords('which recurring bills are due'), 'recurring_due')
  assert.equal(pickInsightByKeywords('who do I bill monthly'), 'recurring_due')
  const m = computeInsight('recurring_due', { 'Recurring Invoices': [row('a', { 'Client Name': 'P', Amount: 2000, Frequency: 'Monthly', 'Next Date': '2000-01-01' })] })
  assert.equal(m.rows[0][0], 'P')
})
