import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { subject, category, priority, message, userEmail, userName } = await req.json()

    const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
    const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

    // Save to Airtable
    const airtableRes = await fetch(`https://api.airtable.com/v0/${BASE}/Support_Tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Subject: subject,
          Category: category,
          Priority: priority,
          Message: message,
          'User Email': userEmail,
          'User Name': userName,
          Status: 'Open',
          'Created At': new Date().toISOString(),
        },
      }),
    })

    const airtableData = await airtableRes.json()
    console.log('Ticket saved:', airtableData.id)

    // Send email notification via Resend
    const RESEND_KEY = process.env.RESEND_API_KEY
    if (RESEND_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Samyojak Support <onboarding@resend.dev>',
          to: ['samyojak@gmail.com'],
          subject: `[${priority}] New Support Ticket: ${subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B5CF6;">New Support Ticket</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; color: #64748B;">From</td><td style="padding: 8px;">${userName} (${userEmail})</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #64748B;">Category</td><td style="padding: 8px;">${category}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #64748B;">Priority</td><td style="padding: 8px; color: ${priority === 'High' ? '#EF4444' : priority === 'Medium' ? '#FBBF24' : '#34D399'}; font-weight: bold;">${priority}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #64748B;">Subject</td><td style="padding: 8px;">${subject}</td></tr>
              </table>
              <div style="margin-top: 16px; padding: 16px; background: #F8FAFC; border-radius: 8px; border-left: 4px solid #8B5CF6;">
                <p style="margin: 0; color: #1E293B;">${message}</p>
              </div>
              <p style="margin-top: 16px; color: #94A3B8; font-size: 12px;">Reply to this email or go to your Samyojak admin panel to respond.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, ticketId: airtableData.id })

  } catch (error: any) {
    console.error('Support ticket error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
