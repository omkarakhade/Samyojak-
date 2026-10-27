import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPlanFromMetadata } from '@/lib/planAccess'
import {
  AGENT_TOOLS,
  AGENT_MODULES,
  sanitizeActions,
  createAgentRecords,
  undoAgentBatch,
  type ProposedAction,
} from '@/lib/agentTools'

const GROQ_AGENT_MODEL = 'llama-3.3-70b-versatile'
const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

function canUseAgent(user: any): boolean {
  if (user.email === ADMIN_EMAIL) return true
  if (user.user_metadata?.is_demo) return true
  return getPlanFromMetadata(user) === 'Complete'
}

function buildSystemPrompt() {
  const now = new Date()
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' })

  return `You are the Samyojak capture agent. You turn what a business owner tells you into records for their ERP.
Today is ${weekday}, ${today} (India time). Convert relative dates like "tomorrow" or "Friday" into YYYY-MM-DD.

Modules: ${AGENT_MODULES.join(', ')}.

Suggested field names (use these when the information is given):
- CRM: Name, Email, Phone, Status (New, Contacted, Converted, Lost), Source, Notes, Follow-up Date
- Invoices: Client Name, Description, Amount, Payment Status (Paid, Unpaid, Overdue), Invoice Date, Due Date
- Quotations: Client Name, Description, Amount, Status (Draft, Sent, Accepted, Rejected)
- Inventory: Product Name, SKU, Current Stock, Reorder Level, Price
- HR: Name, Role, Department, Salary
- Projects: Project Name, Client, Status (Planning, In Progress, Review, Done), Deadline
- Recruiting: Name, Role, Stage (Applied, Screening, Interview, Offer, Hired), Email

RULES:
- When the user describes something to record, call add_records. Use one call per module.
- Only use values the user actually stated. If a value is missing, leave that field out. Never guess amounts, emails or phone numbers.
- If the message is a question or has nothing to record, do not call any tool. Reply with exactly: NO_ACTION
- You cannot send messages, delete records, or change existing records.`
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
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

    // ── CONFIRM: write the approved records ──
    if (action === 'confirm') {
      const actions = sanitizeActions(body.actions)
      if (actions.length === 0) {
        return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
      }
      const result = await createAgentRecords(user.id, actions)
      return NextResponse.json({ success: true, batchId: result.batchId, count: result.created })
    }

    // ── UNDO: remove one batch the agent created ──
    if (action === 'undo') {
      if (typeof body.batchId !== 'string') {
        return NextResponse.json({ error: 'batchId is required.' }, { status: 400 })
      }
      const result = await undoAgentBatch(user.id, body.batchId)
      return NextResponse.json({ success: true, deleted: result.deleted })
    }

    // ── PLAN: ask the model what to record. Nothing is saved here. ──
    if (action === 'plan') {
      const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
      if (!message) {
        return NextResponse.json({ error: 'message is required.' }, { status: 400 })
      }

      const apiKey = process.env.GROQ_API_KEY
      if (!apiKey) {
        return NextResponse.json({ actions: [], fallback: true })
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
          tools: AGENT_TOOLS,
          tool_choice: 'auto',
          temperature: 0.1,
          max_tokens: 1000,
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
        return NextResponse.json({ actions: [], fallback: true })
      }

      const data = await res.json()
      const msg = data.choices?.[0]?.message
      const toolCalls = msg?.tool_calls || []

      const proposed: ProposedAction[] = []
      for (const call of toolCalls) {
        if (call?.function?.name !== 'add_records') continue
        try {
          const args = JSON.parse(call.function.arguments || '{}')
          proposed.push({ module: args.module, records: args.records })
        } catch {
          // skip a malformed tool call
        }
      }

      const actions = sanitizeActions(proposed)
      const text = (msg?.content || '').trim()

      if (actions.length === 0 || text === 'NO_ACTION') {
        return NextResponse.json({ actions: [], fallback: true })
      }

      const total = actions.reduce((n, a) => n + a.records.length, 0)
      return NextResponse.json({
        actions,
        needsConfirm: true,
        reply: `I found ${total} record${total > 1 ? 's' : ''} to add. Please review and confirm.`,
      })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (error: any) {
    console.error('agent route error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
