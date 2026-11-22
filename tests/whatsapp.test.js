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

test('invoice reminder uses the client, amount and due date; paid or phoneless invoices get none', () => {
  const link = invoiceWhatsapp({ 'Client Name': 'Sharma', 'Client Phone': '9876543210', Amount: '50000', 'Due Date': '2026-12-01', Status: 'Unpaid' })
  const text = decodeURIComponent(link.split('text=')[1])
  assert.ok(text.includes('Sharma') && text.includes('50000') && text.includes('2026-12-01'))
  assert.equal(invoiceWhatsapp({ 'Client Name': 'A', 'Client Phone': '9876543210', Status: 'Paid' }), '')
  assert.equal(invoiceWhatsapp({ 'Client Name': 'A', Status: 'Unpaid' }), '')
})
