import { NextRequest, NextResponse } from 'next/server'
import { logActivity, describeApproved } from '@/lib/activityLog'
import { getEntitlement, moduleAllowed, lockedText } from '@/lib/access'
import { getAuthedUser, ADMIN_EMAIL } from '@/lib/serverAuth'
import { AI_MODELS, checkAiLimit, logAiUsage } from '@/lib/aiGuard'
import {
  sanitizeActions,
  sanitizeReverts,
  createAgentRecords,
  undoAgentBatch,
  applyAgentUpdates,
  undoAgentUpdates,
  type AddAction,
  type UpdateAction,
} from '@/lib/agentTools'
import { buildSystemPrompt, stripJson, resolveOperations, type RawOp } from '@/lib/agentPlan'

export const maxDuration = 60

const GROQ_AGENT_MODEL = AI_MODELS.smart

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    const ent = await getEntitlement(user)
    if (!ent.ai) {
      return NextResponse.json({ error: ent.message || 'Choose a plan to continue.' }, { status: 403 })
    }

    const body = await req.json()
    const action = body.action

    // ── CONFIRM: apply what the user approved ──
    if (action === 'confirm') {
      const actions = sanitizeActions(body.actions)
      if (actions.length === 0) {
        return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
      }
      const lockedAction = actions.find(a => !moduleAllowed(ent, (a as any).module))
      if (lockedAction) {
        return NextResponse.json({ error: lockedText((lockedAction as any).module) }, { status: 403 })
      }
      const adds = actions.filter((a): a is AddAction => a.type === 'add')
      const updates = actions.filter((a): a is UpdateAction => a.type === 'update')

      let batchId: string | undefined
      let count = 0
      let stockNotes: string[] = []
      if (adds.length > 0) {
        const r = await createAgentRecords(user.id, adds)
        batchId = r.batchId
        count = r.created
        stockNotes = r.stockNotes
      }

      let updated = 0
      let reverts: ReturnType<typeof sanitizeReverts> = []
      let skipped: string[] = []
      if (updates.length > 0) {
        const r = await applyAgentUpdates(user.id, updates)
        updated = r.updated
        reverts = r.reverts
        skipped = r.skipped
        stockNotes = [...stockNotes, ...r.stockNotes]
      }

      await logActivity(user.id, describeApproved(actions))
      return NextResponse.json({ success: true, batchId, count, updated, reverts, skipped, stockNotes })
    }

    // ── UNDO: remove added records and/or restore edited ones ──
    if (action === 'undo') {
      let deleted = 0
      let restored = 0
      let stockRestored = 0
      if (typeof body.batchId === 'string' && body.batchId) {
        const u = await undoAgentBatch(user.id, body.batchId)
        deleted = u.deleted
        stockRestored = u.stockRestored
      }
      const reverts = sanitizeReverts(body.reverts)
      if (reverts.length > 0) {
        const ur = await undoAgentUpdates(user.id, reverts)
        restored = ur.restored
        stockRestored += ur.stockItems
      }
      if (!body.batchId && reverts.length === 0) {
        return NextResponse.json({ error: 'Nothing to undo.' }, { status: 400 })
      }
      await logActivity(user.id, [{ action: 'Undid', where: 'Assistant', summary: `${deleted ? deleted + ' added record' + (deleted === 1 ? '' : 's') + ' removed' : ''}${deleted && restored ? ', ' : ''}${restored ? restored + ' edit' + (restored === 1 ? '' : 's') + ' reversed' : ''}` || 'Last change reversed' }])
      return NextResponse.json({ success: true, deleted, restored, stockRestored })
    }

    // ── PLAN: ask the model what to do. Nothing is saved here. ──
    if (action === 'plan') {
      const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
      if (!message) {
        return NextResponse.json({ error: 'message is required.' }, { status: 400 })
      }
      const limit = checkAiLimit(user, 'agent')
      if (!limit.ok) {
        return NextResponse.json({ error: limit.message }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
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
          reasoning_effort: 'low',
          max_tokens: 3500,
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
      logAiUsage('agent', GROQ_AGENT_MODEL, data.usage)
      const content: string = data.choices?.[0]?.message?.content || ''
      const parsed = stripJson(content)
      const ops: RawOp[] = Array.isArray(parsed?.operations) ? parsed.operations : []

      const resolved = await resolveOperations(user.id, ops)
      const notes = resolved.notes
      const actions = resolved.actions.filter(a => {
        const ok = moduleAllowed(ent, (a as any).module)
        if (!ok) notes.push(lockedText((a as any).module))
        return ok
      })

      if (actions.length === 0) {
        if (notes.length > 0) {
          return NextResponse.json({ actions: [], notes, reply: notes.join(' ') })
        }
        // The agent chose to ask instead of guessing (for example an unclear payment).
        const ask = typeof parsed?.ask === 'string' ? parsed.ask.replace(/\s+/g, ' ').trim().slice(0, 240) : ''
        if (ask) return NextResponse.json({ actions: [], notes: [ask], reply: ask })
        return NextResponse.json({ actions: [], fallback: true })
      }

      const adds = actions.filter(a => a.type === 'add') as AddAction[]
      const updates = actions.filter(a => a.type === 'update')
      const addCount = adds.reduce((n, a) => n + a.records.length, 0)
      const parts: string[] = []
      if (addCount > 0) parts.push(`add ${addCount} record${addCount > 1 ? 's' : ''}`)
      if (updates.length > 0) parts.push(`change ${updates.length} record${updates.length > 1 ? 's' : ''}`)
      const finishesJob = updates.some(u => (u as UpdateAction).kind === 'finish_job')
      const reducesStock = adds.some(a => a.module === 'Invoices' && a.records.some(r => typeof r['Line Items'] === 'string' && String(r['Line Items']).trim()))

      return NextResponse.json({
        actions,
        notes,
        needsConfirm: true,
        reply: `I'm ready to ${parts.join(' and ')}. Please review and confirm.${reducesStock ? ' Saving will also reduce Inventory stock for the items sold (undo puts it back).' : ''}${finishesJob ? ' Saving will also use up the materials from its bill of materials and add the finished goods to stock (undo reverses it).' : ''}${notes.length ? ' ' + notes.join(' ') : ''}`,
      })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (error: any) {
    console.error('agent route error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
