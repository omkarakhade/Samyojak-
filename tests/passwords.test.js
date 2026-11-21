const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { checkPasswordRules } = loadTs('lib/passwordRules.ts')
const { parseRange } = loadTs('lib/passwordBreach.ts')
const ctx = { email: 'omkar.akhade@gmail.com', name: 'Omkar Akhade', company: 'Samyojak' }

for (const bad of ['short1', 'password123456', 'P@ssw0rd', 'Password2026!', 'Samyojak@2026', '1234567890123', 'aaaaaaaaaaaa', 'qwertyuiop12', 'omkar-is-great-77']) {
  test(`rejects ${bad}`, () => assert.equal(checkPasswordRules(bad, ctx).ok, false))
}
for (const good of ['blue tiger drinks chai at 5am', 'Tr4in-Window-Mango-91']) {
  test(`accepts ${good}`, () => assert.equal(checkPasswordRules(good, ctx).ok, true))
}
test('breach list parsing ignores padding lines', () => {
  assert.equal(parseRange('ABC:0\r\nDEF:5', 'ABC').breached, false)
  assert.equal(parseRange('ABC:0\r\nDEF:5', 'DEF').breached, true)
})
