const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { computeInvoice, money, GENERATOR_CONFIG } = loadTs('lib/freeInvoice.ts')
const { TAX_PAGES } = loadTs('lib/seoPages.ts')

test('totals add tax on the pre-tax sum and round to cents', () => {
  const t = computeInvoice([{ desc: 'bread', qty: 10, price: 2 }, { desc: 'cake', qty: 1, price: 3.333 }], 20)
  assert.equal(t.subtotal, 23.33)
  assert.equal(t.tax, 4.67)
  assert.equal(t.total, 28)
})

test('blank, zero or invalid lines and rates are ignored', () => {
  const t = computeInvoice([{ desc: '', qty: NaN, price: NaN }, { desc: 'x', qty: 0, price: 5 }], NaN)
  assert.deepEqual(t, { subtotal: 0, tax: 0, total: 0, rate: 0 })
})

test('every tax page has a generator setup and money is formatted', () => {
  for (const p of TAX_PAGES) assert.ok(GENERATOR_CONFIG[p.slug], p.slug)
  assert.equal(money('£', 1234.5), '£1,234.50')
})
