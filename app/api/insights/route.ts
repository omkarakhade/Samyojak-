import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'
import { getPlanFromMetadata } from '@/lib/planAccess'
import { fetchUserRecords } from '@/lib/userData'
import {
  INSIGHT_IDS,
  INSIGHT_MODULES,
  InsightId,
  computeInsight,
  pickInsightByKeywords,
} from '@/lib/insights'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

function allowed(user: any): boolean {
  if (user.email === ADMIN_EMAIL) return true
  if (user.user_metadata?.is_demo) return true
  return getPlanFromMetadata(user) === 'Complete'
}

/** Backup for questions the keywords did not catch. The AI only picks an id; code does the maths. */
async function pickWithAI(message: string): Promise<InsightId | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              `Pick which report best answers a business owner's question (English, Hindi or Hinglish). ` +
              `Reply with JSON only: {"insight":"<id>"} where id is one of ${INSIGHT_IDS.join(', ')}, or "none" if no report fits. ` +
              `unpaid_invoices = who has not paid / overdue. revenue_by_month = sales trend. leads_by_status = lead pipeline. ` +
              `low_stock = items to reorder. top_clients = best customers. gst_summary = GST/tax collected.`,
          },
          { role: 'user', content: message.slice(0, 500) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 40,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
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
    if (!allowed(user)) {
      return NextResponse.json({ error: 'Available on the Complete plan.' }, { status: 403 })
    }

    const body = await req.json()
    const message = String(body.message || '').trim().slice(0, 500)
    let id: InsightId | null = INSIGHT_IDS.includes(body.insight) ? body.insight : null // used by pinned cards
    if (!id && message) id = pickInsightByKeywords(message) || (await pickWithAI(message))

    if (!id) return NextResponse.json({ card: null })

    const data = await fetchUserRecords(user.id, INSIGHT_MODULES[id])
    return NextResponse.json({ card: computeInsight(id, data) })
  } catch (e: any) {
    console.error('insights error:', e.message)
    return NextResponse.json({ card: null, error: 'Could not build that answer.' }, { status: 500 })
  }
}
