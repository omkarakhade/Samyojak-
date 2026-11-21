const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { nextSteps, noticed } = loadTs('lib/suggestions.ts')

const today = '2026-11-21'
const row = data => ({ id: 'r' + Math.random(), data })

test('after a deal is saved: invoice is suggested only if none was created', () => {
  const crmOnly = nextSteps([{ type: 'add', module: 'CRM', records: [{ Name: 'Prithviraj', Status: 'Converted' }] }])
  assert.equal(crmOnly[0].text, 'Invoice Prithviraj for ')
  assert.equal(crmOnly[0].mode, 'fill')
  const withInvoice = nextSteps([
    { type: 'add', module: 'CRM', records: [{ Name: 'Prithviraj', Status: 'Converted' }] },
    { type: 'add', module: 'Invoices', records: [{ 'Client Name': 'Prithviraj', Amount: 15000, 'Payment Status': 'Unpaid' }] },
  ])
  assert.ok(!withInvoice.some(s => /^Invoice Prithviraj/.test(s.label)))
  assert.ok(withInvoice.some(s => /due date for Prithviraj/.test(s.label)))
})

test('missing follow-up, deadline and reorder level are offered; paid invoices are not nagged', () => {
  const s = nextSteps([
    { type: 'add', module: 'CRM', records: [{ Name: 'Neha', Status: 'New' }] },
    { type: 'add', module: 'Projects', records: [{ 'Project Name': 'Website' }] },
    { type: 'add', module: 'Inventory', records: [{ 'Item Name': 'Mouse' }] },
    { type: 'add', module: 'Invoices', records: [{ 'Client Name': 'Raj', 'Payment Status': 'Paid' }] },
  ])
  assert.equal(s.length, 3)
  assert.ok(!s.some(x => /Raj/.test(x.label)))
})

test('nothing is suggested when the details were already given', () => {
  assert.equal(nextSteps([{ type: 'add', module: 'Projects', records: [{ 'Project Name': 'W', Deadline: '2026-12-01' }] }]).length, 0)
  assert.equal(nextSteps([{ type: 'update', module: 'CRM', label: 'Neha' }]).length, 0)
})

test('home: client with no invoice, overdue money, idle leads, low stock', () => {
  const data = {
    CRM: [row({ Name: 'Prithviraj', Status: 'Converted' }), row({ Name: 'Neha', Status: 'New' })],
    Invoices: [row({ 'Client Name': 'Raj', Amount: 5000, 'Payment Status': 'Unpaid', 'Due Date': '2026-11-01' })],
    Inventory: [row({ 'Item Name': 'Mouse', 'Current Stock': 2, 'Reorder Level': 5 })],
  }
  const labels = noticed(data, today).map(s => s.label)
  assert.ok(labels.some(l => /^Invoice Prithviraj/.test(l)))
  assert.ok(labels.includes('Show payment reminders'))
  assert.ok(labels.includes('Show my leads by status'))
  assert.ok(labels.includes('What should I reorder?'))
  assert.ok(noticed(data, today).length <= 4)
})

test('home: a billed client is not nagged, an empty account gets nothing', () => {
  const data = { CRM: [row({ Name: 'Prithviraj', Status: 'Converted' })], Invoices: [row({ 'Client Name': 'prithviraj', Amount: 1, 'Payment Status': 'Paid', 'Due Date': '2026-12-01' })] }
  assert.ok(!noticed(data, today).some(s => /^Invoice /.test(s.label)))
  assert.equal(noticed({}, today).length, 0)
})

test('home: overdue amount uses the remaining balance', () => {
  const data = { Invoices: [row({ 'Client Name': 'Raj', Amount: 15000, 'Balance Due': 10000, 'Payment Status': 'Unpaid', 'Due Date': '2026-11-01' })] }
  const s = noticed(data, today).find(x => x.label === 'Show payment reminders')
  assert.match(s.why, /10,000/)
})
