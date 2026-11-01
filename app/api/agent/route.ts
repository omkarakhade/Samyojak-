import { NextRequest, NextResponse } from 'next/server'
import { getPlanFromMetadata } from '@/lib/planAccess'
import { getAuthedUser, ADMIN_EMAIL } from '@/lib/serverAuth'
import {
  AGENT_MODULES,
  sanitizeActions,
  sanitizeReverts,
  createAgentRecords,
  undoAgentBatch,
  applyAgentUpdates,
  undoAgentUpdates,
  findRecords,
  recordLabel,
  type AgentAction,
  type AgentModule,
  type AddAction,
  type UpdateAction,
  type AgentRecord,
} from '@/lib/agentTools'

const GROQ_AGENT_MODEL = 'llama-3.3-70b-versatile'

function canUseAgent(user: any): boolean {
  if (user.email === ADMIN_EMAIL) return true
  if (user.user_metadata?.is_demo) return true
  return getPlanFromMetadata(user) === 'Complete'
}

function buildSystemPrompt() {
  const now = new Date()
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' })

  return `You are the Samyojak agent. You turn what a business owner types into ERP actions. The owner may write English, Hindi or Hinglish.
Today is ${weekday}, ${today} (India time). Convert relative dates like "tomorrow", "Monday", "kal" into YYYY-MM-DD.

Reply with ONE JSON object and nothing else, in exactly this shape:
{"operations":[ ... ],"reply":"one short friendly sentence"}

Each operation is one of:
1. Add new records:
   {"op":"add","module":"CRM","records":[{"Name":"Neha","Phone":"98000021"}]}
2. Change an existing record (find it by name):
   {"op":"update","module":"CRM","find":"Neha","changes":{"Status":"Contacted"}}
3. Mark an invoice paid:
   {"op":"mark_paid","find":"Sharma"}

Modules: ${AGENT_MODULES.join(', ')}.
Field names to use:
- CRM: Name, Email, Phone, Lead Source, Status (New, Contacted, Converted, Lost), Notes, Next Follow-up Date, Business Type
- Invoices: Client Name, Amount, Payment Status (Paid, Unpaid, Overdue), Issue Date, Due Date, Notes
- Quotations: Client Name, Amount, Status (Draft, Sent, Accepted, Rejected), Notes
- Inventory: Item Name, SKU, Category, Current Stock, Reorder Level, Unit Price
- HR: Name, Role, Department, Salary, Joining Date
- Projects: Project Name, Client, Status (Planning, In Progress, Review, Done), Start Date, Deadline, Description
- Recruiting: Candidate Name, Role, Department, Stage (Applied, Screening, Interview, Offer, Hired, Rejected), Email, Phone, Interview Date

RULES:
- "New lead Neha phone 98000021, call her Monday" means: add to CRM with Name, Phone, Next Follow-up Date set to the coming Monday, and Notes "Call her".
- Only use values the user actually stated. If a value is missing, leave that field out. Never invent amounts, emails or phone numbers.
- Amounts are plain numbers without currency symbols or commas. "45k" is 45000, "1.5 lakh" is 150000.
- Phone numbers are strings of digits.
- Use "update" when the user wants to change something that already exists (status, stock, phone, deadline). Put only the changed fields in "changes".
- Use "mark_paid" when the user says an invoice or client has paid.
- If the message is a question, a greeting, or has nothing to record or change, return {"operations":[],"reply":""}.
- You cannot delete records or send messages. For those, return {"operations":[],"reply":""}.`
}

interface RawOp {
  op?: string
  module?: string
  records?: unknown
  find?: unknown
  changes?: unknown
}

function stripJson(text: string): any {
  const t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(t)
  } catch {
    const start = t.indexOf('{')
    const end = t.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try { return JSON.parse(t.slice(start, end + 1)) } catch { /* fall through */ }
    }
    return null
  }
}

function cleanChanges(raw: unknown): AgentRecord | null {
  const actions = sanitizeActions([{ type: 'add', module: 'CRM', records: [raw] }])
  const first = actions[0]
  return first && first.type === 'add' ? first.records[0] : null
}

/** Turn the model's operations into concrete actions the user can review. */
async function resolveOperations(userId: string, ops: RawOp[]) {
  const actions: AgentAction[] = []
  const notes: string[] = []
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  let updateCount = 0

  for (const op of ops.slice(0, 8)) {
    if (!op || typeof op !== 'object') continue

    if (op.op === 'add') {
      const cleaned = sanitizeActions([{ type: 'add', module: op.module, records: op.records }])
      for (const a of cleaned) actions.push(a)
      continue
    }

    if (op.op === 'update' || op.op === 'mark_paid') {
      if (updateCount >= 5) continue
      const isPaid = op.op === 'mark_paid'
      const module = (isPaid ? 'Invoices' : op.module) as AgentModule
      if (!AGENT_MODULES.includes(module)) continue
      const find = typeof op.find === 'string' ? op.find.trim().slice(0, 100) : ''
      if (!find) continue

      const changes: AgentRecord | null = isPaid
        ? { 'Payment Status': 'Paid', 'Paid Date': today }
        : cleanChanges(op.changes)
      if (!changes) continue

      const { matches } = await findRecords(userId, module, find, { onlyUnpaid: isPaid })
      if (matches.length === 0) {
        notes.push(
          isPaid
            ? `I couldn't find an unpaid invoice for "${find}".`
            : `I couldn't find "${find}" in ${module}.`
        )
        continue
      }
      if (matches.length > 1) {
        const names = matches.slice(0, 4).map(m => recordLabel(m.data)).join(', ')
        notes.push(`"${find}" matches ${matches.length} records (${names}). Please be more specific.`)
        continue
      }

      const target = matches[0]
      const before: AgentRecord = {}
      for (const key of Object.keys(changes)) {
        const v = target.data[key]
        if (typeof v === 'string' || typeof v === 'number') before[key] = v
      }
      const update: UpdateAction = {
        type: 'update',
        module,
        recordId: target.id,
        label: recordLabel(target.data),
        changes,
        before,
        kind: isPaid ? 'mark_paid' : 'edit',
      }
      actions.push(update)
      updateCount++
    }
  }

  return { actions, notes }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    if (!canUseAgent(user)) {
      return NextResponse.json(
        { error: 'The AI agent is available on the Complete plan.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const action = body.action

    // ── CONFIRM: apply what the user approved ──
    if (action === 'confirm') {
      const actions = sanitizeActions(body.actions)
      if (actions.length === 0) {
        return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
      }
      const adds = actions.filter((a): a is AddAction => a.type === 'add')
      const updates = actions.filter((a): a is UpdateAction => a.type === 'update')

      let batchId: string | undefined
      let count = 0
      if (adds.length > 0) {
        const r = await createAgentRecords(user.id, adds)
        batchId = r.batchId
        count = r.created
      }

      let updated = 0
      let reverts: ReturnType<typeof sanitizeReverts> = []
      let skipped: string[] = []
      if (updates.length > 0) {
        const r = await applyAgentUpdates(user.id, updates)
        updated = r.updated
        reverts = r.reverts
        skipped = r.skipped
      }

      return NextResponse.json({ success: true, batchId, count, updated, reverts, skipped })
    }

    // ── UNDO: remove added records and/or restore edited ones ──
    if (action === 'undo') {
      let deleted = 0
      let restored = 0
      if (typeof body.batchId === 'string' && body.batchId) {
        deleted = (await undoAgentBatch(user.id, body.batchId)).deleted
      }
      const reverts = sanitizeReverts(body.reverts)
      if (reverts.length > 0) {
        restored = (await undoAgentUpdates(user.id, reverts)).restored
      }
      if (!body.batchId && reverts.length === 0) {
        return NextResponse.json({ error: 'Nothing to undo.' }, { status: 400 })
      }
      return NextResponse.json({ success: true, deleted, restored })
    }

    // ── PLAN: ask the model what to do. Nothing is saved here. ──
    if (action === 'plan') {
      const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
      if (!message) {
        return NextResponse.json({ error: 'message is required.' }, { status: 400 })
      }

      const apiKey = process.env.GROQ_API_KEY
      if (!apiKey) {
        console.error('Agent: GROQ_API_KEY is not set')
        return NextResponse.json({ actions: [], fallback: true, degraded: true })
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_AGENT_MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: message },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 1200,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Agent Groq error:', res.status, errText)
        if (res.status === 429) {
          return NextResponse.json(
            { error: 'The agent is busy right now. Please try again in a minute.' },
            { status: 429 }
          )
        }
        return NextResponse.json({ actions: [], fallback: true, degraded: true })
      }

      const data = await res.json()
      const content: string = data.choices?.[0]?.message?.content || ''
      const parsed = stripJson(content)
      const ops: RawOp[] = Array.isArray(parsed?.operations) ? parsed.operations : []

      const { actions, notes } = await resolveOperations(user.id, ops)

      if (actions.length === 0) {
        if (notes.length > 0) {
          return NextResponse.json({ actions: [], notes, reply: notes.join(' ') })
        }
        return NextResponse.json({ actions: [], fallback: true })
      }

      const adds = actions.filter(a => a.type === 'add') as AddAction[]
      const updates = actions.filter(a => a.type === 'update')
      const addCount = adds.reduce((n, a) => n + a.records.length, 0)
      const parts: string[] = []
      if (addCount > 0) parts.push(`add ${addCount} record${addCount > 1 ? 's' : ''}`)
      if (updates.length > 0) parts.push(`change ${updates.length} record${updates.length > 1 ? 's' : ''}`)

      return NextResponse.json({
        actions,
        notes,
        needsConfirm: true,
        reply: `I'm ready to ${parts.join(' and ')}. Please review and confirm.${notes.length ? ' ' + notes.join(' ') : ''}`,
      })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (error: any) {
    console.error('agent route error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
