const test = require('node:test')
const assert = require('node:assert')
const { loadTs } = require('./helpers')
const { suggestTax } = loadTs('lib/worldTax.ts')
const { gstRateForItem } = loadTs('lib/indiaGst.ts')

test('India medicines and cars are added but flagged to confirm', () => {
  assert.equal(gstRateForItem('Paracetamol tablets').confirm, true)
  assert.equal(gstRateForItem('Maruti car').rate, 18)
  assert.equal(gstRateForItem('Honda scooter').confirm, true)
  const g = suggestTax({ 'Line Items': 'Medicines x2 @100', Amount: 200 })
  assert.equal(g.rate, 5)
  assert.match(g.note, /not fully sure/)
})
test('UK: food 0, restaurant 20, default 20', () => {
  assert.equal(suggestTax({ Currency: 'GBP', 'Line Items': 'Bread x2 @1', Amount: 2 }).rate, 0)
  assert.equal(suggestTax({ Currency: 'GBP', 'Line Items': 'Chocolate x2 @1', Amount: 2 }).rate, 20)
})
test('UAE, Singapore, Australia, NZ defaults by country', () => {
  assert.equal(suggestTax({ Country: 'UAE', Currency: 'AED', 'Line Items': 'Laptop x1 @3000', Amount: 3000 }).rate, 5)
  assert.equal(suggestTax({ Country: 'Singapore', Currency: 'SGD' , 'Line Items': 'Desk x1 @500', Amount: 500 }).rate, 9)
  assert.equal(suggestTax({ Currency: 'AUD', 'Line Items': 'Bread x1 @4', Amount: 4 }).rate, 0)
  assert.equal(suggestTax({ Currency: 'NZD', 'Line Items': 'Desk x1 @100', Amount: 100 }).rate, 15)
})
test('Canada by province, US by state', () => {
  assert.equal(suggestTax({ Currency: 'CAD', Province: 'Ontario', 'Line Items': 'Desk x1 @100', Amount: 100 }).rate, 13)
  assert.equal(suggestTax({ Currency: 'USD', State: 'Texas', 'Line Items': 'Desk x1 @100', Amount: 100 }).rate, 6.25)
  assert.match(suggestTax({ Currency: 'USD', 'Line Items': 'Desk x1 @100', Amount: 100 }).note, /state/)
})
test('Europe by country; unchecked country asks to confirm; named rate wins', () => {
  assert.equal(suggestTax({ Currency: 'EUR', Country: 'Germany', 'Line Items': 'Desk x1 @100', Amount: 100 }).rate, 19)
  assert.match(suggestTax({ Country: 'Japan', 'Line Items': 'Desk x1 @100', Amount: 100 }).note, /not fully sure/)
  assert.equal(suggestTax({ Currency: 'GBP', 'Tax Rate': 5, 'Line Items': 'Desk x1 @100' }), null)
})
