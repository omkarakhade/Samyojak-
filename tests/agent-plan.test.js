const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs, state, USER, invoiceRow } = require('./helpers')
const { resolveOperations, buildSystemPrompt, stripJson } = loadTs('lib/agentPlan.ts')

const adds = (r, module) => r.actions.filter(a => a.type === 'add' && a.module === module)

test('new user: client deal becomes CRM + invoice + project', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [
    { op: 'add', module: 'CRM', records: [{ Name: 'Prithviraj', Status: 'Converted' }] },
    { op: 'add', module: 'Invoices', records: [{ 'Client Name': 'Prithviraj', Amount: 15000, 'Payment Status': 'Unpaid' }] },
    { op: 'add', module: 'Projects', records: [{ 'Project Name': 'Website', Client: 'Prithviraj', Status: 'In Progress' }] },
  ])
  assert.equal(adds(r, 'CRM').length, 1)
  assert.equal(adds(r, 'Invoices')[0].records[0].Amount, 15000)
  assert.equal(adds(r, 'Projects').length, 1)
})

test('"Raj paid 5000" with nothing recorded creates a paid invoice', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj', amount: '5,000' }])
  const inv = adds(r, 'Invoices')[0].records[0]
  assert.equal(inv['Client Name'], 'Raj')
  assert.equal(inv.Amount, 5000)
  assert.equal(inv['Payment Status'], 'Paid')
})

test('payment with no amount and no invoice asks instead of guessing', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj' }])
  assert.equal(r.actions.length, 0)
  assert.match(r.notes[0], /couldn't find an unpaid invoice/)
})

test('"Raj paid" settles his existing unpaid invoice, not a new one', async () => {
  state.rows = [invoiceRow('Raj', 8000)]
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj', amount: 8000 }])
  assert.equal(r.actions.length, 1)
  assert.equal(r.actions[0].type, 'update')
  assert.equal(r.actions[0].changes['Payment Status'], 'Paid')
})

test('an already paid invoice is not settled twice', async () => {
  state.rows = [invoiceRow('Raj', 8000, 'Paid')]
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj' }])
  assert.equal(r.actions.filter(a => a.type === 'update').length, 0)
})

test('two matching clients are not guessed between', async () => {
  state.rows = [invoiceRow('Raj Kumar', 100), { ...invoiceRow('Raj Singh', 200), id: 'recBBBBBBBBBBBBBB' }]
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj' }])
  assert.equal(r.actions.length, 0)
  assert.match(r.notes[0], /matches 2 records/)
})

test('limits: at most 8 operations are read', async () => {
  state.rows = []
  const ops = Array.from({ length: 20 }, (_, i) => ({ op: 'add', module: 'CRM', records: [{ Name: 'L' + i }] }))
  const r = await resolveOperations(USER, ops)
  assert.ok(r.actions.length <= 8)
})

test('unknown modules and the delete operation are ignored', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [
    { op: 'add', module: 'Secrets', records: [{ Name: 'x' }] },
    { op: 'delete', module: 'CRM', find: 'Neha' },
  ])
  assert.equal(r.actions.length, 0)
})

test('prompt rules that protect the owner are present', () => {
  const p = buildSystemPrompt()
  assert.match(p, /cannot delete records or send messages/)
  assert.match(p, /not an instruction/)
  assert.match(p, /Never invent amounts/)
  assert.match(p, /mark_paid/)
  assert.match(p, /Today is /)
})

test('model JSON is read even inside code fences or with extra words', () => {
  assert.deepEqual(stripJson('```json\n{"operations":[],"reply":""}\n```'), { operations: [], reply: '' })
  assert.deepEqual(stripJson('Sure! {"operations":[],"reply":"ok"} Done.'), { operations: [], reply: 'ok' })
  assert.equal(stripJson('no json here'), null)
})

test('part payment keeps the invoice open and tracks the balance', async () => {
  state.rows = [invoiceRow('Raj', 15000)]
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj', amount: 5000 }])
  const u = r.actions[0]
  assert.equal(u.type, 'update')
  assert.equal(u.changes['Payment Status'], undefined)
  assert.equal(u.changes['Amount Received'], 5000)
  assert.equal(u.changes['Balance Due'], 10000)
  assert.match(r.notes[0], /10000 still due/)
})

test('a second part payment adds to the first and the last one closes the invoice', async () => {
  const row = invoiceRow('Raj', 15000)
  const data = JSON.parse(row.fields['Record Data'])
  data['Amount Received'] = 5000
  row.fields['Record Data'] = JSON.stringify(data)
  state.rows = [row]
  let r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj', amount: 4000 }])
  assert.equal(r.actions[0].changes['Amount Received'], 9000)
  assert.equal(r.actions[0].changes['Balance Due'], 6000)
  r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj', amount: 10000 }])
  assert.equal(r.actions[0].changes['Payment Status'], 'Paid')
})

test('paying the full amount marks it paid', async () => {
  state.rows = [invoiceRow('Raj', 15000)]
  const r = await resolveOperations(USER, [{ op: 'mark_paid', find: 'Raj', amount: 15000 }])
  assert.equal(r.actions[0].changes['Payment Status'], 'Paid')
})

test('prompt carries the business knowledge and the ask option', () => {
  const p = buildSystemPrompt()
  assert.match(p, /baaki/)
  assert.match(p, /part payment/)
  assert.match(p, /"ask"/)
  assert.match(p, /Quotation, never an Invoice/)
})
