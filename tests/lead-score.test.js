const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { scoreLeads } = loadTs('lib/leadScore.ts')
const { computeInsight, pickInsightByKeywords } = loadTs('lib/insights.ts')

const row = (id, data) => ({ id, data })
const TODAY = '2026-11-22'

test('a ready, valuable lead with a late follow-up scores hot; a bare new lead scores cold', () => {
  const leads = scoreLeads([
    row('1', { Name: 'Neha', Status: 'Proposal', Email: 'n@x.com', Phone: '98', 'Deal Value': '80000', 'Next Follow-up Date': '2026-11-20', Notes: 'wants site' }),
    row('2', { Name: 'Raj', Status: 'New' }),
  ], TODAY)
  assert.equal(leads[0].name, 'Neha')
  assert.equal(leads[0].level, 'Hot')
  assert.ok(leads[0].score <= 100)
  assert.ok(leads[0].reasons.some(r => /late/.test(r)))
  assert.equal(leads[1].level, 'Cold')
})

test('won and lost leads are left out, rows without a name are skipped', () => {
  const leads = scoreLeads([
    row('1', { Name: 'A', Status: 'Won' }),
    row('2', { Name: 'B', Status: 'Lost' }),
    row('3', { Status: 'New' }),
    row('4', { Name: 'C', Status: 'Contacted' }),
  ], TODAY)
  assert.deepEqual(leads.map(l => l.name), ['C'])
})

test('old untouched leads are marked down', () => {
  const [fresh] = scoreLeads([row('1', { Name: 'F', Status: 'New', 'Created At': '2026-11-20' })], TODAY)
  const [old] = scoreLeads([row('1', { Name: 'O', Status: 'New', 'Created At': '2026-08-01' })], TODAY)
  assert.ok(fresh.score > old.score)
})

test('asking for lead scores or hot leads picks the report and builds the card', () => {
  assert.equal(pickInsightByKeywords('which leads should I call first'), 'lead_scores')
  assert.equal(pickInsightByKeywords('show hot leads'), 'lead_scores')
  assert.equal(pickInsightByKeywords('lead pipeline by status'), 'leads_by_status')
  const card = computeInsight('lead_scores', { CRM: [row('1', { Name: 'Neha', Status: 'Qualified', Phone: '9' })] })
  assert.equal(card.kind, 'table')
  assert.equal(card.rows.length, 1)
})
