const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { parseLineItems, lineItemsTotal } = loadTs('lib/lineItems.ts')

test('reads "Item xQty @Price" lists', () => {
  const items = parseLineItems('Laptop x2 @50000; Mouse x5 @500')
  assert.equal(items.length, 2)
  assert.equal(lineItemsTotal(items), 102500)
})
test('a service line with only a name still parses', () => {
  assert.equal(parseLineItems('Website').length, 1)
})
