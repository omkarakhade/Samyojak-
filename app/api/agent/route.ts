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
  findRecords,
  listUserRecords,
  type UpdateAction,
} from '@/lib/agentTools'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { cleanNote, notesBlock, MAX_NOTES, stockAnswer } from '@/lib/agentMemory'
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
      // The last few messages, so a short reply like "Raj" answers the agent's own question.
      const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body.history)
        ? body.history
            .filter((h: any) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string' && h.content.trim())
            .slice(-4)
            .map((h: any) => ({ role: h.role, content: String(h.content).trim().slice(0, 500) }))
        : []
      const limit = checkAiLimit(user, 'agent')
      if (!limit.ok) {
        return NextResponse.json({ error: limit.message }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
      }

      const apiKey = process.env.GROQ_API_KEY
      if (!apiKey) {
        console.error('Agent: GROQ_API_KEY is not set')
        return NextResponse.json({ actions: [], fallback: true, degraded: true })
      }

      // What this owner has taught the agent before.
      const db = createSupabaseAdminClient()
      let learned: string[] = []
      try {
        const { data: nrows } = await db.from('agent_notes').select('note').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12)
        learned = (nrows || []).map((r: any) => String(r.note))
      } catch { /* no notes this time */ }
      const callModel = (model: string = GROQ_AGENT_MODEL) => fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: buildSystemPrompt() + notesBlock(learned) },
            ...history,
            { role: 'user', content: message },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          reasoning_effort: 'low',
          max_tokens: 3500,
        }),
      })

      // Groq sometimes says "busy" (429). Wait a moment and try again before bothering the owner.
      let res = await callModel()
      for (const wait of [2500, 4500]) {
        if (res.status !== 429) break
        await new Promise(r => setTimeout(r, wait))
        res = await callModel()
      }
      // Still busy: the smaller model has its own limit, so try it before giving up.
      let usedModel: string = GROQ_AGENT_MODEL
      if (res.status === 429) {
        const second = await callModel(AI_MODELS.fast)
        if (second.ok) { res = second; usedModel = AI_MODELS.fast }
      }

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
      logAiUsage('agent', usedModel, data.usage)
      const content: string = data.choices?.[0]?.message?.content || ''
      const parsed = stripJson(content)
      const ops: RawOp[] = Array.isArray(parsed?.operations) ? parsed.operations : []

      // Learn: save a habit the owner taught, or drop one they asked to forget.
      let learnedNote = ''
      try {
        const rem = cleanNote(parsed?.remember)
        if (rem && !learned.some(n => n.toLowerCase() === rem.toLowerCase())) {
          await db.from('agent_notes').insert({ user_id: user.id, note: rem })
          const { data: all } = await db.from('agent_notes').select('id').eq('user_id', user.id).order('created_at', { ascending: false })
          if (all && all.length > MAX_NOTES) await db.from('agent_notes').delete().in('id', all.slice(MAX_NOTES).map((r: any) => r.id))
          learnedNote = `I'll remember: ${rem}`
        }
        const forget = typeof parsed?.forget === 'string' ? parsed.forget.trim().toLowerCase().slice(0, 80) : ''
        if (forget.length >= 3) {
          const { data: mine } = await db.from('agent_notes').select('id, note').eq('user_id', user.id)
          const gone = (mine || []).filter((r: any) => String(r.note).toLowerCase().includes(forget)).map((r: any) => r.id)
          if (gone.length) { await db.from('agent_notes').delete().in('id', gone); learnedNote = 'Okay, I have forgotten that.' }
        }
      } catch (e: any) { console.error('agent notes error:', e?.message) }

      const resolved = await resolveOperations(user.id, ops, message)
      const notes = resolved.notes
      if (learnedNote) notes.push(learnedNote)
      const actions = resolved.actions.filter(a => {
        const ok = moduleAllowed(ent, (a as any).module)
        if (!ok) notes.push(lockedText((a as any).module))
        return ok
      })

      // A lead who "wants 12 red dresses": always check Inventory, even if the model forgot to.
      if (!notes.some(n => /in stock|Inventory|not enough|short for/i.test(n))) {
        const m = message.match(/\bwants?\s+(\d{1,5})\s+([^,.;\n"]{2,60})/i)
        if (m) {
          try {
            const rows = await listUserRecords(user.id, 'Inventory')
            const item = m[2].trim().replace(/\b(pieces?|pcs|units?|of)\b/gi, '').replace(/\s+/g, ' ').trim().replace(/s$/i, '')
            const ans = stockAnswer(rows as any, item, Number(m[1]))
            if (ans) notes.push(ans)
          } catch { /* skip */ }
        }
      }

      // A sale needs a phone number so the invoice can go on WhatsApp: use the CRM one, or ask once.
      const hasPhone = (r: Record<string, any>) => Object.keys(r).some(k => /phone|mobile|whats/i.test(k) && String(r[k]).trim())
      const askedBefore = history.some(h => h.role === 'assistant' && /phone|whatsapp|number/i.test(h.content))
      let phoneQuestion = ''
      const crmPhones = new Map<string, string>()
      for (const a of actions) {
        if (a.type === 'add' && a.module === 'CRM') {
          for (const r of a.records) {
            const ph = String(r['Phone'] ?? '').trim()
            const nm = String(r['Name'] ?? '').trim().toLowerCase()
            if (ph && nm) crmPhones.set(nm, ph)
          }
        }
      }
      for (const a of actions) {
        if (a.type !== 'add' || a.module !== 'Invoices') continue
        for (const r of a.records) {
          if (hasPhone(r)) continue
          const name = String(r['Client Name'] ?? '').trim()
          if (!name) continue
          const sameBatch = crmPhones.get(name.toLowerCase())
          if (sameBatch) { r['Client Phone'] = sameBatch; continue }
          try {
            const { matches } = await findRecords(user.id, 'CRM', name)
            const known = matches.length === 1 ? String(matches[0].data['Phone'] ?? '').trim() : ''
            if (known) { r['Client Phone'] = known; continue }
          } catch { /* ask below */ }
          if (!askedBefore && !phoneQuestion) phoneQuestion = `What is ${name}'s phone number? I'll keep it so you can send the invoice on WhatsApp. Say "skip" to save without it.`
        }
      }
      if (phoneQuestion) return NextResponse.json({ actions: [], notes: [phoneQuestion], reply: phoneQuestion })

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
