const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { openTickets, pendingApprovals, SLA_DAYS } = loadTs('lib/tickets.ts')
const { computeInsight, pickInsightByKeywords } = loadTs('lib/insights.ts')

const row = (id, data) => ({ id, data })

test('deadlines follow priority and late tickets come first', () => {
  const rows = [
    row('a', { Customer: 'Mehta', Subject: 'PDF will not open', Priority: 'High', Status: 'Open', Opened: '2026-11-18' }),
    row('b', { Customer: 'Raj', Subject: 'Slow', Priority: 'Low', Status: 'Open', Opened: '2026-11-20' }),
    row('c', { Customer: 'Old', Subject: 'Done', Priority: 'Urgent', Status: 'Resolved', Opened: '2026-10-01' }),
    row('d', { Customer: 'Fresh', Subject: 'Login', Priority: 'Urgent', Status: 'Open', Opened: '2026-11-22' }),
  ]
  const t = openTickets(rows, '2026-11-22')
  assert.deepEqual(t.map(x => x.who), ['Mehta', 'Fresh', 'Raj'])
  assert.equal(t[0].due, '2026-11-19')
  assert.equal(t[0].lateBy, 3)
  assert.equal(t[1].lateBy, 0)
  assert.equal(t[2].due, '2026-11-25')
  assert.equal(SLA_DAYS.urgent, 0)
})

test('a deadline the owner set wins over the priority rule', () => {
  const t = openTickets([row('a', { Customer: 'X', Subject: 'Y', Priority: 'Low', Opened: '2026-11-01', 'Due Date': '2026-11-02' })], '2026-11-22')
  assert.equal(t[0].lateBy, 20)
})

test('only pending approvals are listed, biggest first', () => {
  const rows = [
    row('a', { Request: 'Discount', 'Requested By': 'Simran', Amount: 5000, Status: 'Pending' }),
    row('b', { Request: 'Laptop', Amount: 60000, Status: 'Pending' }),
    row('c', { Request: 'Old', Amount: 1, Status: 'Approved' }),
  ]
  assert.deepEqual(pendingApprovals(rows).map(a => a.what), ['Laptop', 'Discount'])
})

test('questions route to the right report', () => {
  assert.equal(pickInsightByKeywords('show open support tickets'), 'support_tickets')
  assert.equal(pickInsightByKeywords('any customer complaints'), 'support_tickets')
  assert.equal(pickInsightByKeywords('what is waiting for my approval'), 'approvals_pending')
  assert.equal(pickInsightByKeywords('show low stock'), 'low_stock')
})

test('reports compute', () => {
  const t = computeInsight('support_tickets', { 'Support Tickets': [row('a', { Customer: 'Mehta', Subject: 'S', Priority: 'High', Opened: '2000-01-01' })] })
  assert.equal(t.rows[0][0], 'Mehta')
  assert.match(t.total, /late/)
  const a = computeInsight('approvals_pending', { Approvals: [row('a', { Request: 'Discount', Status: 'Pending' })] })
  assert.equal(a.rows[0][0], 'Discount')
})
