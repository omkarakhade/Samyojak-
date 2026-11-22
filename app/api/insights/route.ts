import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'
import { AI_MODELS, checkAiLimit, logAiUsage } from '@/lib/aiGuard'
import { getEntitlement, moduleAllowed, lockedText } from '@/lib/access'
import { fetchUserRecords } from '@/lib/userData'
import {
  INSIGHT_IDS,
  INSIGHT_MODULES,
  InsightId,
  computeInsight,
  setCurrency,
  pickInsightByKeywords,
  ACCOUNTING_IDS,
} from '@/lib/insights'



/** Backup for questions the keywords did not catch. The AI only picks an id; code does the maths. */
async function pickWithAI(message: string): Promise<InsightId | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODELS.fast,
        messages: [
          {
            role: 'system',
            content:
              `Pick which report best answers a business owner's question (English, Hindi or Hinglish). ` +
              `Reply with JSON only: {"insight":"<id>"} where id is one of ${INSIGHT_IDS.join(', ')}, or "none" if no report fits. ` +
              `unpaid_invoices = who has not paid / overdue. revenue_by_month = sales trend. leads_by_status = lead pipeline. ` +
              `low_stock = items to reorder. demand_forecast = forecast of future sales per item, days of stock left and what to order based on sales history. production_status = production jobs by status and which are late. quality_summary = open quality issues and defects. recurring_due = repeating bills (monthly maintenance etc.) that are due to invoice. production_materials = parts needed for open production jobs vs stock, what to buy. product_cost = what one unit costs to make from its bill of materials. balance_sheet = what the business owns, owes and is worth. trial_balance = every account with debit and credit totals. cash_position = cash in bank, money owed to you and by you. timesheet_summary = hours logged this month per project and billable value. assets_summary = equipment and assets owned, warranty ending, who has what. returns_analysis = why customers return items, refund cost, repeat returners. stock_abc = which items hold the most stock value (ABC ranking). reorder_plan = how much of each low item to order and the estimated cost. top_clients = best customers. receivables_aging = unpaid invoices grouped by how late they are. client_concentration = how much billing depends on a few clients (customer risk). gst_summary = tax collected (GST, VAT or sales tax). Overview questions like how is my business doing = daily_brief. payment_reminders = draft messages to chase unpaid clients. daily_brief = what to focus on today. recent_changes = what the assistant or imports added. profit_loss = profit after expenses per month. bills_due = unpaid vendor bills.`,
          },
          { role: 'user', content: message.slice(0, 500) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        reasoning_effort: 'low',
        max_tokens: 150,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    logAiUsage('insight', AI_MODELS.fast, data.usage)
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    const id = parsed?.insight
    return INSIGHT_IDS.includes(id) ? (id as InsightId) : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user || !isSafeId(user.id)) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    const ent = await getEntitlement(user)
    if (!ent.ai) {
      return NextResponse.json({ error: ent.message || 'Choose a plan to continue.' }, { status: 403 })
    }

    const body = await req.json()
    const message = String(body.message || '').trim().slice(0, 500)
    let id: InsightId | null = INSIGHT_IDS.includes(body.insight) ? body.insight : null // used by pinned cards
    let viaAI = false
    if (!id && message) {
      id = pickInsightByKeywords(message)
      if (!id && checkAiLimit(user, 'insight').ok) { id = await pickWithAI(message); viaAI = !!id }
    }

    if (!id) return NextResponse.json({ card: null })

    // The daily brief covers whatever the plan includes; other reports need all of their modules.
    let mods = INSIGHT_MODULES[id]
    if (id === 'daily_brief' || id === 'recent_changes' || ACCOUNTING_IDS.includes(id)) {
      mods = mods.filter(m => moduleAllowed(ent, m))
      if (mods.length === 0) return NextResponse.json({ card: null, locked: lockedText('CRM') })
    } else {
      const blocked = mods.find(m => !moduleAllowed(ent, m))
      // A report the AI merely guessed at must not show a lock message: let the assistant answer in words instead.
      if (blocked) return NextResponse.json(viaAI ? { card: null } : { card: null, locked: lockedText(blocked) })
    }

    if (id === 'recent_changes') mods = [...mods, 'Activity']
    const data = await fetchUserRecords(user.id, mods)
    setCurrency(body.currency)
    try {
      return NextResponse.json({ card: computeInsight(id, data) })
    } finally {
      setCurrency('')
    }
  } catch (e: any) {
    console.error('insights error:', e.message)
    return NextResponse.json({ card: null, error: 'Could not build that answer.' }, { status: 500 })
  }
}
