const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { qrMatrix, qrSvg, productQrText, QR_MAX_BYTES } = loadTs('lib/qr.ts')

test('QR matrix has the right size and finder patterns', () => {
  const m = qrMatrix('Hello')
  assert.equal(m.length, 21) // version 1
  assert.equal(m[0].length, 21)
  // top-left finder: dark ring, light ring, dark centre
  assert.equal(m[0][0], true)
  assert.equal(m[1][1], false)
  assert.equal(m[3][3], true)
  // fixed dark module
  assert.equal(m[21 - 8][8], true)
})

test('longer text uses a bigger version', () => {
  assert.equal(qrMatrix('x'.repeat(15)).length, 25) // version 2 (v1-M holds 14 bytes)
  assert.equal(qrMatrix('x'.repeat(213)).length, 57) // version 10
})

test('too long text is refused', () => {
  assert.throws(() => qrMatrix('x'.repeat(QR_MAX_BYTES + 1)))
})

test('svg output is a valid, self-contained picture', () => {
  const svg = qrSvg('Shirt | SKU 1 | 499', 200)
  assert.ok(svg.startsWith('<svg'))
  assert.ok(svg.includes('width="200"'))
})

test('label text is readable and fits', () => {
  assert.equal(productQrText('Blue Shirt', 'SH-1', '499'), 'Blue Shirt | SKU SH-1 | 499')
  assert.equal(productQrText('Tea', '', ''), 'Tea')
  assert.ok(productQrText('n'.repeat(500), 'A', '1').length <= QR_MAX_BYTES)
})
