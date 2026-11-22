const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs, state, USER } = require('./helpers')
const { materialNeeds, productCosts, findBomRow, bomComponents } = loadTs('lib/productionPlan.ts')
const { resolveOperations } = loadTs('lib/agentPlan.ts')
const { computeInsight, pickInsightByKeywords } = loadTs('lib/insights.ts')

const row = (id, data) => ({ id, data })
const bom = row('b1', { Product: 'Bracket', Components: 'Steel sheet x2; Bolt x8', 'Labour Cost': 10 })
const inv = [
  row('i1', { 'Item Name': 'Steel sheet', 'Current Stock': 100, 'Unit Price': 50 }),
  row('i2', { 'Item Name': 'Bolt', 'Current Stock': 2000, 'Unit Price': 1 }),
  row('i3', { 'Item Name': 'Bracket', 'Current Stock': 0, 'Unit Price': 300 }),
]

test('BOM parts and lookup ignore case', () => {
  assert.deepEqual(bomComponents(bom.data).map(c => [c.name, c.qty]), [['Steel sheet', 2], ['Bolt', 8]])
  assert.ok(findBomRow([bom], 'bracket'))
  assert.equal(findBomRow([bom], 'Gear'), null)
})

test('materials needed for 500 brackets, and what is short', () => {
  const jobs = [row('j1', { Product: 'Bracket', 'Quantity Planned': 500, 'Quantity Made': 0, Status: 'In Progress' })]
  const p = materialNeeds(jobs, [bom], inv)
  const steel = p.needs.find(n => n.name === 'Steel sheet')
  assert.equal(steel.need, 1000)
  assert.equal(steel.short, 900)
  assert.equal(p.needs.find(n => n.name === 'Bolt').short, 2000)
  assert.equal(p.openJobs, 1)
})

test('finished jobs are ignored; made quantity reduces need; missing BOM is reported', () => {
  const jobs = [
    row('j1', { Product: 'Bracket', 'Quantity Planned': 500, 'Quantity Made': 400, Status: 'In Progress' }),
    row('j2', { Product: 'Bracket', 'Quantity Planned': 999, Status: 'Done' }),
    row('j3', { Product: 'Gear', 'Quantity Planned': 10, Status: 'Planned' }),
  ]
  const p = materialNeeds(jobs, [bom], inv)
  assert.equal(p.needs.find(n => n.name === 'Steel sheet').need, 200)
  assert.deepEqual(p.noBom, ['Gear'])
  assert.equal(p.openJobs, 2)
})

test('cost to make one unit adds parts and labour', () => {
  const c = productCosts([bom], inv)[0]
  assert.equal(c.material, 2 * 50 + 8 * 1)
  assert.equal(c.total, 118)
  assert.equal(c.selling, 300)
})

test('unpriced parts are flagged', () => {
  const c = productCosts([bom], [inv[0]])[0]
  assert.deepEqual(c.unpriced, ['Bolt'])
})

test('questions route to the new reports', () => {
  assert.equal(pickInsightByKeywords('what materials do I need to buy for production'), 'production_materials')
  assert.equal(pickInsightByKeywords('can I make 500 brackets'), 'production_materials')
  assert.equal(pickInsightByKeywords('what does it cost to make a bracket'), 'product_cost')
})

test('reports compute from data', () => {
  const data = { 'Production Jobs': [row('j1', { Product: 'Bracket', 'Quantity Planned': 10, Status: 'Planned' })], 'Bills of Materials': [bom], Inventory: inv }
  const m = computeInsight('production_materials', data, '2026-11-22')
  assert.ok(m.rows.some(r => r[0] === 'Steel sheet'))
  const c = computeInsight('product_cost', data, '2026-11-22')
  assert.equal(c.rows[0][0], 'Bracket')
})

test('finish_job resolves a job and marks it done', async () => {
  state.rows = [{ id: 'recJOB000000000001', fields: { Module: 'Production Jobs', 'Record Data': JSON.stringify({ Product: 'Bracket', 'Quantity Planned': 500, Status: 'In Progress' }) } }]
  const r = await resolveOperations(USER, [{ op: 'finish_job', find: 'bracket', made: 480, done: true }])
  const u = r.actions.find(a => a.type === 'update')
  assert.ok(u, JSON.stringify(r))
  assert.equal(u.kind, 'finish_job')
  assert.equal(u.changes['Quantity Made'], 480)
  assert.equal(u.changes.Status, 'Done')
})

test('finish_job with no matching job says so instead of guessing', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [{ op: 'finish_job', find: 'bracket', made: 5 }])
  assert.equal(r.actions.length, 0)
  assert.ok(r.notes.length > 0)
})
