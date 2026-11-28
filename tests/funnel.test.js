const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { funnelStage, funnelCounts } = loadTs('lib/funnel.ts')

test('stage follows the furthest thing a person has done', () => {
  assert.equal(funnelStage({}), 'signed_up')
  assert.equal(funnelStage({ records: 3 }), 'added_data')
  assert.equal(funnelStage({ records: 3, invoices: 1 }), 'made_invoice')
  assert.equal(funnelStage({ records: 3, invoices: 1, subscription_status: 'active' }), 'paying')
  assert.equal(funnelStage({ subscription_status: 'trial' }), 'signed_up')
})

test('counts are cumulative and leave the owner out', () => {
  const c = funnelCounts([
    { is_admin: true, records: 27, invoices: 7 },
    {}, {}, { records: 2 }, { records: 5, invoices: 2 }, { records: 5, invoices: 2, subscription_status: 'active' },
  ])
  assert.deepEqual(c, { signed_up: 5, added_data: 3, made_invoice: 2, paying: 1 })
})
