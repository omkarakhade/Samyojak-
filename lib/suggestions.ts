// The assistant side of Samyojak: it notices what is missing and offers the next step,
// so an owner who does not know what to ask is still guided. Pure code, no AI call, no cost.
//   nextSteps(actions)  -> chips shown right after something is saved
//   noticed(data, today) -> "things I noticed" on the chat home, from the owner's stored data
// A suggestion either sends a ready question ('send') or puts the start of a sentence in the box ('fill').

import { findField, toNumber, inr } from '@/lib/insights'
import { dueRecurring } from '@/lib/recurring'
import { materialNeeds } from '@/lib/productionPlan'

export interface Suggestion {
  label: string
  text: string
  mode: 'send' | 'fill'
  /** One plain sentence on why this is suggested (shown on the home list). */
  why?: string
}

type Row = { id: string; data: Record<string, any> }
type ByModule = Record<string, Row[]>

function iso(v: unknown): string {
  const s = String(v ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const t = Date.parse(s)
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : ''
}
const key = (s: unknown) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
const isPaid = (v: unknown) => /^(paid|settled|received|complete[d]?)$/i.test(String(v ?? '').trim())
const has = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== ''

// ───────────── right after something was saved ─────────────

interface ActionLike {
  type?: string
  module: string
  records?: Record<string, any>[]
}

export function nextSteps(actions: ActionLike[]): Suggestion[] {
  const out: Suggestion[] = []
  const adds = actions.filter(a => a.type !== 'update' && Array.isArray(a.records))
  const invoiced = new Set<string>()
  for (const a of adds) {
    if (a.module !== 'Invoices') continue
    for (const r of a.records!) invoiced.add(key(r['Client Name']))
  }

  for (const a of adds) {
    for (const r of a.records!) {
      if (a.module === 'CRM') {
        const name = String(r['Name'] ?? '').trim()
        if (!name) continue
        if (/^converted$/i.test(String(r['Status'] ?? '')) && !invoiced.has(key(name))) {
          out.push({ label: `Invoice ${name}`, text: `Invoice ${name} for `, mode: 'fill' })
        } else if (!has(r['Next Follow-up Date']) && !/^(converted|lost)$/i.test(String(r['Status'] ?? ''))) {
          out.push({ label: `Set a follow-up for ${name}`, text: `Follow up with ${name} on `, mode: 'fill' })
        }
      }
      if (a.module === 'Invoices' && !has(r['Due Date']) && !isPaid(r['Payment Status'])) {
        const c = String(r['Client Name'] ?? '').trim()
        if (c) out.push({ label: `Add a due date for ${c}`, text: `${c}'s invoice is due on `, mode: 'fill' })
      }
      if (a.module === 'Projects' && !has(r['Deadline'])) {
        const p = String(r['Project Name'] ?? '').trim()
        if (p) out.push({ label: `Set a deadline for ${p}`, text: `${p} deadline is `, mode: 'fill' })
      }
      if (a.module === 'Inventory' && !has(r['Reorder Level'])) {
        const i = String(r['Item Name'] ?? '').trim()
        if (i) out.push({ label: `Set the reorder level for ${i}`, text: `Reorder level for ${i} is `, mode: 'fill' })
      }
      if (a.module === 'Expenses' && /^bill$/i.test(String(r['Type'] ?? '')) && !has(r['Due Date']) && !isPaid(r['Status'])) {
        const v = String(r['Vendor'] ?? '').trim()
        if (v) out.push({ label: `Add a due date for ${v}'s bill`, text: `${v}'s bill is due on `, mode: 'fill' })
      }
    }
  }

  const seen = new Set<string>()
  return out.filter(s => (seen.has(s.label) ? false : (seen.add(s.label), true))).slice(0, 3)
}

// ───────────── what is missing in the data ─────────────

export function noticed(data: ByModule, today: string): Suggestion[] {
  const out: Suggestion[] = []
  const invoices = data.Invoices || []
  const crm = data.CRM || []
  const stock = data.Inventory || []
  const projects = data.Projects || []
  const sheet = data.Timesheets || []
  const assets = data.Assets || []

  // 1. Clients you won but never billed.
  if (crm.length) {
    const nameF = findField(crm, ['Name', /name/i])
    const statusF = findField(crm, ['Status', /status|stage/i])
    const clientF = findField(invoices, ['Client Name', /client|customer|name/i])
    if (nameF && statusF) {
      const billed = new Set(invoices.map(r => (clientF ? key(r.data[clientF]) : '')))
      const unbilled = crm
        .filter(r => /^converted$/i.test(String(r.data[statusF] ?? '').trim()) && key(r.data[nameF]) && !billed.has(key(r.data[nameF])))
        .map(r => String(r.data[nameF]).trim())
      if (unbilled.length) {
        const first = unbilled[0]
        out.push({
          label: unbilled.length === 1 ? `Invoice ${first}` : `Invoice ${first} (+${unbilled.length - 1} more)`,
          text: `Invoice ${first} for `,
          mode: 'fill',
          why: `${unbilled.length === 1 ? `${first} is a client` : `${unbilled.length} clients`} but ${unbilled.length === 1 ? 'has' : 'have'} no invoice yet.`,
        })
      }
    }
  }

  // 2. Money overdue.
  if (invoices.length) {
    const statusF = findField(invoices, ['Payment Status', /status/i])
    const amountF = findField(invoices, ['Amount', /^amount|total/i])
    const dueF = findField(invoices, ['Due Date', /due/i])
    if (statusF && dueF) {
      const late = invoices.filter(r => !isPaid(r.data[statusF]) && iso(r.data[dueF]) && iso(r.data[dueF]) < today)
      if (late.length) {
        const sum = late.reduce((s, r) => {
          const bal = toNumber(r.data['Balance Due'])
          return s + (bal > 0 ? bal : amountF ? toNumber(r.data[amountF]) : 0)
        }, 0)
        out.push({
          label: 'Show payment reminders',
          text: 'Show payment reminders',
          mode: 'send',
          why: `${late.length} ${plural(late.length, 'invoice is', 'invoices are')} past the due date${sum > 0 ? ` (${inr(sum)} still to collect)` : ''}.`,
        })
      }
      const noDue = invoices.filter(r => !isPaid(r.data[statusF]) && !iso(r.data[dueF]))
      if (noDue.length) {
        out.push({
          label: 'Show unpaid invoices',
          text: 'Show unpaid invoices',
          mode: 'send',
          why: `${noDue.length} unpaid ${plural(noDue.length, 'invoice has', 'invoices have')} no due date, so I cannot tell when they are late.`,
        })
      }
    }
  }

  // 3. Leads nobody is following up.
  if (crm.length) {
    const statusF = findField(crm, ['Status', /status|stage/i])
    const fuF = findField(crm, ['Next Follow-up Date', /follow/i])
    if (statusF) {
      const open = crm.filter(r => /^(new|contacted)$/i.test(String(r.data[statusF] ?? '').trim()))
      const nobody = open.filter(r => !(fuF && iso(r.data[fuF]) && iso(r.data[fuF]) >= today))
      if (open.length && nobody.length) {
        out.push({
          label: 'Show my leads by status',
          text: 'Show my leads by status',
          mode: 'send',
          why: `${nobody.length} open ${plural(nobody.length, 'lead has', 'leads have')} no upcoming follow-up date.`,
        })
      }
    }
  }

  // 4. Stock running low.
  if (stock.length) {
    const nameF = findField(stock, ['Item Name', /item|product|name/i])
    const curF = findField(stock, ['Current Stock', /current.*stock|^stock$|quantity|qty/i])
    const minF = findField(stock, ['Reorder Level', /reorder|minimum|min/i])
    if (nameF && curF && minF) {
      const low = stock.filter(r => has(r.data[minF]) && toNumber(r.data[curF]) <= toNumber(r.data[minF]))
      if (low.length) {
        out.push({
          label: 'What should I reorder?',
          text: 'What should I reorder?',
          mode: 'send',
          why: `${low.length} ${plural(low.length, 'item is', 'items are')} at or below the reorder level.`,
        })
      }
    }
  }

  // 5. Projects past their deadline.
  if (projects.length) {
    const statusF = findField(projects, ['Status', /status|stage/i])
    const dlF = findField(projects, ['Deadline', /deadline|due/i])
    if (dlF) {
      const late = projects.filter(r => !(statusF && /^(done|completed|closed)$/i.test(String(r.data[statusF] ?? '').trim())) && iso(r.data[dlF]) && iso(r.data[dlF]) < today)
      if (late.length) {
        out.push({
          label: 'Which projects are late?',
          text: 'Which projects are past their deadline?',
          mode: 'send',
          why: `${late.length} ${plural(late.length, 'project is', 'projects are')} past the deadline and not done.`,
        })
      }
    }
  }

  // 6. Hours logged this month without a rate (so they cannot be billed properly).
  if (sheet.length) {
    const dateF = findField(sheet, ['Date', /date/i])
    const hoursF = findField(sheet, ['Hours', /hours|hrs/i])
    const rateF = findField(sheet, ['Hourly Rate', /rate/i])
    const billF = findField(sheet, ['Billable', /billable/i])
    const month = today.slice(0, 7)
    if (hoursF) {
      const noRate = sheet.filter(r =>
        (!dateF || iso(r.data[dateF]).slice(0, 7) === month) &&
        toNumber(r.data[hoursF]) > 0 &&
        (!billF || /^(yes|y|true|1)$/i.test(String(r.data[billF] ?? '').trim())) &&
        !(rateF && toNumber(r.data[rateF]) > 0))
      if (noRate.length) {
        out.push({
          label: 'Show my timesheets',
          text: 'Show my timesheets',
          mode: 'send',
          why: `${noRate.length} billable time ${plural(noRate.length, 'entry has', 'entries have')} no hourly rate, so I cannot say what it is worth.`,
        })
      }
    }
  }

  // 6b. Open production jobs: missing parts, or no bill of materials.
  if (data['Production Jobs']?.length) {
    const plan = materialNeeds(data['Production Jobs'], data['Bills of Materials'] || [], stock)
    const short = plan.needs.filter(n => n.short > 0)
    if (short.length) {
      out.push({
        label: 'What materials do I need to buy?',
        text: 'What materials do I need for my production jobs?',
        mode: 'send',
        why: `${short.length} ${plural(short.length, 'material is', 'materials are')} short for the open jobs.`,
      })
    }
    if (plan.noBom.length) {
      out.push({
        label: `Add parts list for ${plan.noBom[0]}`,
        text: `Bill of materials for ${plan.noBom[0]}: `,
        mode: 'fill',
        why: `${plan.noBom.length === 1 ? plan.noBom[0] + ' is' : plan.noBom.length + ' products are'} being made without a bill of materials, so I cannot track the parts.`,
      })
    }
  }

  // 6c. Recurring bills that are due.
  if (data['Recurring Invoices']?.length) {
    const due = dueRecurring(data['Recurring Invoices'], today)
    if (due.length) {
      out.push({
        label: `Bill ${due.length} recurring ${plural(due.length, 'client', 'clients')}`,
        text: 'Bill the recurring clients that are due',
        mode: 'send',
        why: `${due.length} recurring ${plural(due.length, 'bill is', 'bills are')} due: ${due.slice(0, 3).map(d => d.client).join(', ')}.`,
      })
    }
  }

  // 7. Warranties ending soon.
  if (assets.length) {
    const warF = findField(assets, ['Warranty Until', /warranty/i])
    const statusF = findField(assets, ['Status', /status/i])
    if (warF) {
      const limit = new Date(`${today}T00:00:00Z`)
      limit.setUTCDate(limit.getUTCDate() + 30)
      const lim = limit.toISOString().slice(0, 10)
      const soon = assets.filter(r => !(statusF && /^(retired|sold|scrapped|disposed)$/i.test(String(r.data[statusF] ?? '').trim())) && iso(r.data[warF]) >= today && iso(r.data[warF]) <= lim)
      if (soon.length) {
        out.push({
          label: 'Show my assets',
          text: 'Show my assets',
          mode: 'send',
          why: `${soon.length} ${plural(soon.length, 'warranty ends', 'warranties end')} within 30 days.`,
        })
      }
    }
  }

  return out.slice(0, 4)
}
