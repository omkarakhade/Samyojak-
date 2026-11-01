import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const TABLE_URL = `https://api.airtable.com/v0/${BASE}/Support_Tickets`
const SUPPORT_EMAIL = 'hello.samyojak@gmail.com'

const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency']
const CATEGORIES = [
  'General', 'Technical Issue', 'Billing', 'Import / Export',
  'AI Assistant', 'Account Access', 'Feature Request', 'Bug Report',
]

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** GET: the signed-in user's own tickets only. */
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user || !isSafeId(user.id)) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  }
  try {
    const records: any[] = []
    let offset: string | undefined
    do {
      const params = new URLSearchParams()
      params.set('filterByFormula', `{User ID}="${user.id}"`)
      params.set('pageSize', '100')
      if (offset) params.set('offset', offset)
      const res = await fetch(`${TABLE_URL}?${params}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
      if (!res.ok) throw new Error(`Airtable ${res.status}`)
      const data = await res.json()
      records.push(...(data.records || []))
      offset = data.offset
    } while (offset)
    return NextResponse.json({ records })
  } catch (e: any) {
    console.error('support GET error:', e.message)
    return NextResponse.json({ error: 'Could not load tickets.' }, { status: 500 })
  }
}

/** POST: create a ticket. Identity comes from the verified session, not the body. */
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user || !isSafeId(user.id)) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const subject = String(body.subject || '').trim().slice(0, 200)
    const description = String(body.description || '').trim().slice(0, 5000)
    const priority = PRIORITIES.includes(body.priority) ? body.priority : 'Medium'
    const category = CATEGORIES.includes(body.category) ? body.category : 'General'
    const email = user.email || ''

    if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    if (!description) return NextResponse.json({ error: 'Please describe your issue' }, { status: 400 })

    const res = await fetch(TABLE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          Subject: subject,
          Description: description,
          Priority: priority,
          Category: category,
          Status: 'Open',
          'User Email': email,
          'User ID': user.id,
          'Created At': new Date().toISOString().split('T')[0],
        },
      }),
    })
    if (!res.ok) throw new Error(`Airtable ${res.status}`)
    const saved = await res.json()

    // Optional email notification (only if RESEND_API_KEY is set)
    const RESEND_KEY = process.env.RESEND_API_KEY
    if (RESEND_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Samyojak Support <onboarding@resend.dev>',
            to: [SUPPORT_EMAIL],
            subject: `[${priority}] New Support Ticket: ${subject}`,
            html: `<div style="font-family:sans-serif;max-width:600px">
              <h2 style="color:#8B5CF6">New Support Ticket</h2>
              <p><b>From:</b> ${esc(email)}<br><b>Category:</b> ${esc(category)}<br><b>Priority:</b> ${esc(priority)}<br><b>Subject:</b> ${esc(subject)}</p>
              <div style="padding:16px;background:#F8FAFC;border-left:4px solid #8B5CF6">${esc(description).replace(/\n/g, '<br>')}</div>
            </div>`,
          }),
        })
      } catch (e: any) {
        console.error('support email failed:', e.message)
      }
    }

    return NextResponse.json({ success: true, ticketId: saved.id })
  } catch (e: any) {
    console.error('support POST error:', e.message)
    return NextResponse.json({ error: 'Could not submit your ticket.' }, { status: 500 })
  }
}
