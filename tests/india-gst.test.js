const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { gstRateForItem, suggestInvoiceRate, GST_GUIDE } = loadTs('lib/indiaGst.ts')
const { buildPhotoActions } = loadTs('lib/photoRecords.ts')

test('clothes are 5% up to 2500 each and 18% above', () => {
  assert.equal(gstRateForItem('Red Dress', 1500).rate, 5)
  assert.equal(gstRateForItem('Red Dress', 2500).rate, 5)
  assert.equal(gstRateForItem('Silk saree', 3000).rate, 18)
  assert.equal(gstRateForItem('Running shoes', 1999).rate, 5)
})

test('phones and laptops are 18%, basic foods 0%, cold drinks 40%', () => {
  assert.equal(gstRateForItem('Samsung mobile', 15000).rate, 18)
  assert.equal(gstRateForItem('Dell laptop').rate, 18)
  assert.equal(gstRateForItem('Fresh milk').rate, 0)
  assert.equal(gstRateForItem('Cold drink 2L').rate, 40)
  assert.equal(gstRateForItem('Milk chocolate').rate, 5)
})

test('unknown items give no guess', () => {
  assert.equal(gstRateForItem('Website design'), null)
  assert.equal(gstRateForItem('Widget'), null)
})

test('an invoice for dresses gets 5% GST, from the unit price the agent wrote', () => {
  const g = suggestInvoiceRate({ 'Client Name': 'Neha', 'Line Items': 'Dress x12 @1213.33', Amount: 14560 })
  assert.equal(g.rate, 5)
  assert.match(g.note, /5%/)
})

test('the price is worked out from the amount when only one line has no price', () => {
  assert.equal(suggestInvoiceRate({ 'Line Items': 'Dress x12', Amount: 14560 }).rate, 5)
  assert.equal(suggestInvoiceRate({ 'Line Items': 'Dress x2', Amount: 9000 }).rate, 18)
})

test('mixed items give a blended rate that keeps the tax total right', () => {
  const g = suggestInvoiceRate({ 'Line Items': 'Dress x10 @1000; Laptop x1 @40000' })
  // tax = 500 + 7200 = 7700 on 50000
  assert.equal(g.rate, 15.4)
})

test('the owner\'s own rate, a foreign currency, or an unknown item are left alone', () => {
  assert.equal(suggestInvoiceRate({ 'Line Items': 'Dress x2 @1000', 'Tax Rate': 18 }), null)
  assert.equal(suggestInvoiceRate({ 'Line Items': 'Dress x2 @1000', Currency: 'GBP' }), null)
  assert.equal(suggestInvoiceRate({ 'Line Items': 'Website x1 @15000' }), null)
})

test('the guide explains output and input tax', () => {
  assert.match(GST_GUIDE, /2,500/)
  assert.match(GST_GUIDE, /claimed back|claim(ed)? back/)
})

test('a supplier bill photo asks for what it could not see', () => {
  const r = buildPhotoActions({ kind: 'purchase_bill', items: [{ name: 'Red dress', qty: 12, unit_cost: 800 }] })
  assert.match(r.reply, /supplier's name/)
  assert.match(r.reply, /GST/)
  const full = buildPhotoActions({ kind: 'purchase_bill', supplier: 'Sharma Traders', bill_no: 'B1', gst_amount: 480, total: 10080, items: [{ name: 'Red dress', qty: 12, unit_cost: 800 }] })
  assert.doesNotMatch(full.reply, /I could not see/)
})
