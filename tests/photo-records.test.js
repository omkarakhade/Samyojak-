const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { buildPhotoActions } = loadTs('lib/photoRecords.ts')

test('a supplier bill adds stock and an unpaid bill with GST', () => {
  const r = buildPhotoActions({
    kind: 'purchase_bill', supplier: 'Sharma Traders', bill_no: 'B-77', date: '2026-11-20', gst_amount: 180, total: 1180,
    items: [{ name: 'Omni capsules', qty: 12, unit_cost: 50 }, { name: 'Gloves', qty: 10, unit_cost: 40 }],
  })
  assert.equal(r.actions.length, 2)
  assert.equal(r.actions[0].module, 'Inventory')
  assert.deepEqual(r.actions[0].records[0], { 'Item Name': 'Omni capsules', 'Current Stock': 12, 'Cost Price': 50 })
  const bill = r.actions[1].records[0]
  assert.equal(bill.Vendor, 'Sharma Traders')
  assert.equal(bill.Amount, 1000)
  assert.equal(bill['GST Amount'], 180)
  assert.equal(bill['Bill No'], 'B-77')
  assert.equal(bill.Status, 'Unpaid')
  assert.match(r.reply, /Nothing is saved until you do/)
})

test('a stock list only adds Inventory', () => {
  const r = buildPhotoActions({ kind: 'stock_list', items: [{ name: 'Red dress', qty: 12, unit_price: 800 }] })
  assert.equal(r.actions.length, 1)
  assert.deepEqual(r.actions[0].records[0], { 'Item Name': 'Red dress', 'Current Stock': 12, 'Unit Price': 800 })
})

test('unreadable, empty or invented rows save nothing', () => {
  assert.equal(buildPhotoActions(null).actions.length, 0)
  assert.equal(buildPhotoActions({ kind: 'stock_list', items: [] }).actions.length, 0)
  assert.equal(buildPhotoActions({ kind: 'stock_list', items: [{ name: '', qty: 5 }, { name: 'Pen', qty: 0 }] }).actions.length, 0)
})

test('a sales invoice is not recorded blindly', () => {
  const r = buildPhotoActions({ kind: 'sales_invoice', items: [{ name: 'Laptop', qty: 2 }] })
  assert.equal(r.actions.length, 0)
  assert.match(r.reply, /sales invoice/)
})

test('bad numbers and long text are cleaned', () => {
  const r = buildPhotoActions({ kind: 'purchase_bill', total: 'abc', items: [{ name: 'X'.repeat(500), qty: '5 pcs', unit_cost: '-3' }] })
  assert.equal(r.actions[0].records[0]['Item Name'].length, 100)
  assert.equal(r.actions[0].records[0]['Current Stock'], 5)
  assert.equal(r.actions[0].records[0]['Cost Price'], undefined)
})

test('a photographed sales invoice keeps its lines, total and GST rate for the next message', () => {
  const items = Array.from({ length: 13 }, () => ({ name: 'Red Dress – Elegant Fit', qty: 1, unit_price: 1500 }))
  const r = buildPhotoActions({ kind: 'sales_invoice', gst_amount: 975, total: 20475, items })
  assert.equal(r.actions.length, 0)
  assert.match(r.reply, /Red Dress – Elegant Fit x13 @1500/)
  assert.match(r.reply, /bill total 20475/)
  assert.match(r.reply, /GST rate 5%/)
  assert.match(r.reply, /Who was it for/)
  assert.ok(r.reply.length < 500)
})
