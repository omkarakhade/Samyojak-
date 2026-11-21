const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs, state, USER, invoiceRow } = require('./helpers')
const { resolveOperations } = loadTs('lib/agentPlan.ts')
const { AGENT_MODULES } = loadTs('lib/agentTools.ts')
const insights = loadTs('lib/insights.ts')

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
const plusDays = n => new Date(Date.now() + n * 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
const quoteRow = (client, amount, status, id = 'recQQQQQQQQQQQQQQ') => ({
  id,
  fields: { Module: 'Quotations', 'Record Data': JSON.stringify({ 'Client Name': client, Amount: amount, Status: status }) },
})
const row = data => ({ id: 'rec' + Math.random().toString(36).slice(2, 16).padEnd(14, 'x'), data })

test('agent knows the new modules', () => {
  assert.ok(AGENT_MODULES.includes('Timesheets'))
  assert.ok(AGENT_MODULES.includes('Assets'))
})

test('accepted quote becomes an unpaid invoice and the quote is marked Accepted', async () => {
  state.rows = [quoteRow('Mehta', 40000, 'Sent')]
  const r = await resolveOperations(USER, [{ op: 'convert_quote', find: 'Mehta' }])
  const add = r.actions.find(a => a.type === 'add')
  const upd = r.actions.find(a => a.type === 'update')
  assert.equal(add.module, 'Invoices')
  assert.equal(add.records[0]['Client Name'], 'Mehta')
  assert.equal(add.records[0].Amount, 40000)
  assert.equal(add.records[0]['Payment Status'], 'Unpaid')
  assert.equal(add.records[0]['Issue Date'], today)
  assert.equal(upd.module, 'Quotations')
  assert.equal(upd.changes.Status, 'Accepted')
  assert.equal(upd.before.Status, 'Sent')
})

test('no quotation found says so and creates nothing', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [{ op: 'convert_quote', find: 'Mehta' }])
  assert.equal(r.actions.length, 0)
  assert.match(r.notes[0], /couldn't find a quotation/)
})

test('two open quotes for one name are not guessed between', async () => {
  state.rows = [quoteRow('Mehta Co', 1, 'Sent'), quoteRow('Mehta Ltd', 2, 'Draft', 'recRRRRRRRRRRRRRR')]
  const r = await resolveOperations(USER, [{ op: 'convert_quote', find: 'Mehta' }])
  assert.equal(r.actions.length, 0)
  assert.match(r.notes[0], /matches 2 quotations/)
})

test('keywords route to the new reports without hijacking old ones', () => {
  assert.equal(insights.pickInsightByKeywords('how many hours did we log this month'), 'timesheet_summary')
  assert.equal(insights.pickInsightByKeywords('show my timesheets'), 'timesheet_summary')
  assert.equal(insights.pickInsightByKeywords('which assets have warranty expiring'), 'assets_summary')
  assert.equal(insights.pickInsightByKeywords('who has the laptop'), 'assets_summary')
  assert.equal(insights.pickInsightByKeywords('who has not paid me'), 'unpaid_invoices')
  assert.equal(insights.pickInsightByKeywords('show returns and refunds'), 'returns_analysis')
})

test('timesheet report: hours, billable value, missing rates', () => {
  const m = today.slice(0, 7)
  const data = { Timesheets: [
    row({ Date: m + '-02', Person: 'Omkar', Project: 'Website', Hours: 3, Billable: 'Yes', 'Hourly Rate': 1000 }),
    row({ Date: m + '-03', Person: 'Simran', Project: 'Website', Hours: 2, Billable: 'Yes' }),
    row({ Date: m + '-03', Person: 'Omkar', Project: 'Internal', Hours: 1, Billable: 'No' }),
    row({ Date: '2020-01-01', Person: 'Old', Project: 'Ancient', Hours: 50 }),
  ] }
  const c = insights.computeInsight('timesheet_summary', data)
  assert.equal(c.rows[0][0], 'Website')
  assert.equal(c.rows[0][1], 5)
  assert.match(c.total, /6 hours/)
  assert.match(c.note, /no hourly rate/)
  assert.ok(!c.rows.some(r => r[0] === 'Ancient'))
})

test('assets report: cost, warranty soon, repair, retired excluded', () => {
  const data = { Assets: [
    row({ 'Asset Name': 'Dell laptop', Category: 'Laptop', 'Purchase Cost': 62000, Status: 'In use', 'Assigned To': 'Simran', 'Warranty Until': plusDays(20) }),
    row({ 'Asset Name': 'Printer', Category: 'Office', 'Purchase Cost': 8000, Status: 'In repair', 'Assigned To': 'Front desk' }),
    row({ 'Asset Name': 'Old PC', Category: 'Laptop', 'Purchase Cost': 30000, Status: 'Retired' }),
  ] }
  const c = insights.computeInsight('assets_summary', data)
  assert.match(c.total, /2 assets/)
  assert.match(c.note, /Warranty ends soon: Dell laptop \(20 days\)/)
  assert.match(c.note, /1 asset is in repair/)
  assert.equal(c.rows.length, 2)
})

test('empty accounts get a helpful nudge, not an error', () => {
  assert.match(insights.computeInsight('timesheet_summary', {}).note, /worked 3 hours/)
  assert.match(insights.computeInsight('assets_summary', {}).note, /No assets recorded/)
})

test('unpaid report counts only the balance of a part-paid invoice', () => {
  const data = { Invoices: [row({ 'Client Name': 'Raj', Amount: 15000, 'Payment Status': 'Unpaid', 'Amount Received': 5000, 'Balance Due': 10000 }),
                             row({ 'Client Name': 'Sam', Amount: 2000, 'Payment Status': 'Unpaid' })] }
  const c = insights.computeInsight('unpaid_invoices', data)
  assert.match(c.total, /2 unpaid/)
  assert.ok(String(c.total).includes('12,000'), c.total)
})
