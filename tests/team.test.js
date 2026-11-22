const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { teamOf, isMemberOf, teamLimitFor, canAddMember, validEmail, TEAM_LIMIT } = loadTs('lib/team.ts')

test('only the Complete plan can have team logins, up to the limit', () => {
  assert.equal(teamLimitFor('complete'), TEAM_LIMIT)
  for (const t of ['starter', 'basic', 'business', null, undefined]) assert.equal(teamLimitFor(t), 0)
  assert.equal(canAddMember('complete', 0).ok, true)
  assert.equal(canAddMember('complete', TEAM_LIMIT - 1).ok, true)
  const full = canAddMember('complete', TEAM_LIMIT)
  assert.equal(full.ok, false)
  assert.match(full.reason, /up to 5/)
  const low = canAddMember('business', 0)
  assert.equal(low.ok, false)
  assert.match(low.reason, /Complete plan/)
})

test('team list is read safely from app metadata', () => {
  assert.deepEqual(teamOf(undefined), [])
  assert.deepEqual(teamOf({ team: 'x' }), [])
  const t = teamOf({ team: [{ id: 'a1', email: 'a@x.com', name: 'A', added: '2026-11-22' }, { id: 5 }, null] })
  assert.equal(t.length, 1)
  assert.equal(t[0].email, 'a@x.com')
})

test('a person counts as a member only while the owner lists them', () => {
  const meta = { team: [{ id: 'abc12345', email: 'a@x.com' }] }
  assert.equal(isMemberOf(meta, 'abc12345'), true)
  assert.equal(isMemberOf(meta, 'zzz99999'), false)
  assert.equal(isMemberOf({ team: [] }, 'abc12345'), false)
  assert.equal(isMemberOf(null, 'abc12345'), false)
})

test('email check', () => {
  assert.equal(validEmail('staff@shop.in'), true)
  assert.equal(validEmail('no-at-sign'), false)
  assert.equal(validEmail('a b@x.com'), false)
  assert.equal(validEmail(42), false)
})
