const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { withInvoiceTax } = loadTs('lib/invoiceTax.ts')

test('GST 18% is added on top by default', () => {
  const r = withInvoiceTax({ 'Client Name': 'Raj', Amount: 12000 })
  assert.equal(r.Amount, 12000)
  assert.equal(r['Tax Amount'], 2160)
  assert.equal(r.Total, 14160)
  assert.equal(r['Tax Rate'], '18%')
})

test('another rate, no tax, and price including tax', () => {
  assert.equal(withInvoiceTax({ Amount: 1000, 'Tax Rate': 5 })['Tax Amount'], 50)
  const none = withInvoiceTax({ Amount: 1000, 'Tax Rate': 0 })
  assert.equal(none.Total, 1000)
  const inc = withInvoiceTax({ Amount: 11800, 'Tax Inclusive': 'yes' })
  assert.equal(inc.Amount, 10000)
  assert.equal(inc.Total, 11800)
  assert.equal(inc['Tax Inclusive'], undefined)
})

test('records that already have tax, or no amount, are left alone', () => {
  const had = withInvoiceTax({ Amount: 100, 'Tax Amount': 5, Total: 105 })
  assert.equal(had.Total, 105)
  assert.equal(withInvoiceTax({ 'Client Name': 'X' })['Tax Amount'], undefined)
})

test('tax follows the invoice currency', () => {
  const uk = withInvoiceTax({ Amount: 1000, Currency: 'GBP' })
  assert.equal(uk['Tax Rate'], '20%')
  assert.equal(uk['Tax Label'], 'VAT')
  assert.equal(uk.Total, 1200)
  const ae = withInvoiceTax({ Amount: 1000, Currency: 'aed' })
  assert.equal(ae['Tax Amount'], 50)
  const us = withInvoiceTax({ Amount: 1000, Currency: 'USD' })
  assert.equal(us.Total, 1000)
  const unknown = withInvoiceTax({ Amount: 1000, Currency: 'XYZ' })
  assert.equal(unknown['Tax Label'], 'GST')
  assert.equal(withInvoiceTax({ Amount: 1000, Currency: 'GBP', 'Tax Rate': 5 })['Tax Amount'], 50)
})
