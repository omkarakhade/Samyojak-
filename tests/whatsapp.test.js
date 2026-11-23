const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { whatsappNumber, whatsappLink, invoiceWhatsapp } = loadTs('lib/whatsapp.ts')

test('numbers are cleaned and given a country code', () => {
  assert.equal(whatsappNumber('+91 98765 43210'), '919876543210')
  assert.equal(whatsappNumber('98765-43210'), '919876543210')
  assert.equal(whatsappNumber('09876543210'), '919876543210')
  assert.equal(whatsappNumber('0044 7911 123456'), '447911123456')
  assert.equal(whatsappNumber('123'), '')
  assert.equal(whatsappNumber('9876543210', ''), '9876543210') // no default country: used as typed
})

test('link opens wa.me with an encoded message', () => {
  const l = whatsappLink('9876543210', 'Hi & bye')
  assert.equal(l, 'https://wa.me/919876543210?text=Hi%20%26%20bye')
  assert.equal(whatsappLink('', 'x'), '')
})

test('invoice message has the whole invoice; paid ones get a thank-you; no phone gets none', () => {
  const link = invoiceWhatsapp({ 'Client Name': 'Sharma', 'Client Phone': '9876543210', 'Line Items': 'Laptop x1 @12000', Amount: '12000', 'Tax Rate': '18%', 'Tax Amount': '2160', Total: '14160', 'Due Date': '2026-12-01', 'Payment Status': 'Unpaid' })
  const text = decodeURIComponent(link.split('text=')[1])
  for (const part of ['Sharma', 'Laptop x1', '12000', '18%', '2160', '14160', '2026-12-01', 'Unpaid']) assert.ok(text.includes(part), part)
  const paid = decodeURIComponent(invoiceWhatsapp({ 'Client Name': 'A', 'Client Phone': '9876543210', Total: '500', 'Payment Status': 'Paid' }).split('text=')[1])
  assert.ok(paid.includes('received your payment') && paid.includes('Paid') && !paid.includes('Due date'))
  assert.equal(invoiceWhatsapp({ 'Client Name': 'A', 'Payment Status': 'Unpaid' }), '')
})
