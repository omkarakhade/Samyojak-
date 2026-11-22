const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs, state, USER } = require('./helpers')
const { workingDays, payrollFor, onLeaveOn } = loadTs('lib/payroll.ts')
const { resolveOperations } = loadTs('lib/agentPlan.ts')
const { computeInsight, pickInsightByKeywords } = loadTs('lib/insights.ts')

const row = (id, data) => ({ id, data })
const stored = (id, module, data) => ({ id, fields: { Module: module, 'Record Data': JSON.stringify(data) } })

test('working days skip Sundays', () => {
  assert.equal(workingDays('2026-11'), 25) // 30 days, 5 Sundays
  assert.equal(workingDays('2026-02'), 24) // 28 days, 4 Sundays
})

test('absent and half days are cut from pay; Sundays are ignored', () => {
  const staff = [row('s1', { Name: 'Simran', Salary: 26000 }), row('s2', { Name: 'Ravi', Salary: 13000 })]
  const att = [
    row('a1', { Date: '2026-11-03', Employee: 'Simran', Status: 'Absent' }),
    row('a2', { Date: '2026-11-04', Employee: 'simran', Status: 'Half day' }),
    row('a3', { Date: '2026-11-08', Employee: 'Simran', Status: 'Absent' }), // a Sunday
    row('a4', { Date: '2026-10-05', Employee: 'Ravi', Status: 'Absent' }), // other month
  ]
  const p = payrollFor('2026-11', staff, att, [])
  const s = p.lines.find(l => l.employee === 'Simran')
  assert.equal(s.lostDays, 1.5)
  assert.equal(s.net, 24440)
  assert.equal(p.lines.find(l => l.employee === 'Ravi').net, 13000)
  assert.equal(p.total, 37440)
})

test('only approved unpaid leave is cut; paid leave is not', () => {
  const staff = [row('s1', { Name: 'Ravi', Salary: 26000 })]
  const leaves = [
    row('l1', { Employee: 'Ravi', 'Leave Type': 'Unpaid', From: '2026-11-09', To: '2026-11-11', Status: 'Approved' }),
    row('l2', { Employee: 'Ravi', 'Leave Type': 'Paid', From: '2026-11-16', To: '2026-11-18', Status: 'Approved' }),
    row('l3', { Employee: 'Ravi', 'Leave Type': 'Unpaid', From: '2026-11-23', To: '2026-11-24', Status: 'Pending' }),
  ]
  assert.equal(payrollFor('2026-11', staff, [], leaves).lines[0].lostDays, 3)
})

test('people with no salary are listed, not paid', () => {
  const p = payrollFor('2026-11', [row('s1', { Name: 'Intern' })], [], [])
  assert.equal(p.lines.length, 0)
  assert.deepEqual(p.noSalary, ['Intern'])
})

test('who is on leave on a date', () => {
  const leaves = [row('l1', { Employee: 'Ravi', From: '2026-11-09', To: '2026-11-11', Status: 'Approved' })]
  assert.deepEqual(onLeaveOn('2026-11-10', leaves), ['Ravi'])
  assert.deepEqual(onLeaveOn('2026-11-12', leaves), [])
})

test('run_payroll records paid salary expenses and skips people already paid', async () => {
  const month = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7)
  state.rows = [
    stored('recHR0000000000001', 'HR', { Name: 'Simran', Salary: 20000 }),
    stored('recHR0000000000002', 'HR', { Name: 'Ravi', Salary: 15000 }),
    stored('recEX0000000000001', 'Expenses', { Vendor: 'Ravi', Category: 'Salary', Amount: 15000, Notes: `Payroll ${month}` }),
  ]
  const r = await resolveOperations(USER, [{ op: 'run_payroll' }])
  const add = r.actions.find(a => a.type === 'add' && a.module === 'Expenses')
  assert.equal(add.records.length, 1)
  assert.equal(add.records[0].Vendor, 'Simran')
  assert.equal(add.records[0].Status, 'Paid')
  assert.match(add.records[0].Notes, new RegExp(`Payroll ${month}`))
})

test('run_payroll with no staff explains instead of guessing', async () => {
  state.rows = []
  const r = await resolveOperations(USER, [{ op: 'run_payroll' }])
  assert.equal(r.actions.length, 0)
  assert.match(r.notes[0], /No salaries/)
})

test('payroll questions route to the payroll report', () => {
  assert.equal(pickInsightByKeywords('run payroll for this month'), 'payroll')
  assert.equal(pickInsightByKeywords('who is on leave today'), 'payroll')
  const c = computeInsight('payroll', { HR: [row('s1', { Name: 'Simran', Salary: 20000 })] })
  assert.equal(c.rows[0][0], 'Simran')
})
