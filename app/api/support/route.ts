import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'

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
    const { data, error } = await createSupabaseAdminClient()
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw new Error(error.message)
    // same shape the page already reads
    const records = (data || []).map((t: any) => ({
      id: t.id,
      fields: {
        Subject: t.subject, Description: t.description, Priority: t.priority, Category: t.category,
        Status: t.status, 'User Email': t.user_email, 'User ID': t.user_id,
        'Created At': String(t.created_at).slice(0, 10),
      },
    }))
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

    const { data: saved, error: saveErr } = await createSupabaseAdminClient()
      .from('support_tickets')
      .insert({ user_id: user.id, user_email: email, subject, description, priority, category })
      .select('id')
      .single()
    if (saveErr) throw new Error(saveErr.message)

    // Optional email notification (only if RESEND_API_KEY is set)
    const RESEND_KEY = process.env.RESEND_API_KEY
    if (RESEND_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Samyojak Support <hello@samyojak-erp.com>',
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

    return NextResponse.json({ success: true, ticketId: saved?.id })
  } catch (e: any) {
    console.error('support POST error:', e.message)
    return NextResponse.json({ error: 'Could not submit your ticket.' }, { status: 500 })
  }
}
