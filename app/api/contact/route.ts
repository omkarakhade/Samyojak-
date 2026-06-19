import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const emailBody = `
New contact form submission from Samyojak website

Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Subject: ${subject || 'Not provided'}

Message:
${message}

---
Sent from samyojak.vercel.app/contact
    `.trim()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Samyojak Contact <onboarding@resend.dev>',
        to: ['hello.samyojak@gmail.com'],
        reply_to: email,
        subject: `[Samyojak Contact] ${subject || 'New message'} — from ${name}`,
        text: emailBody,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Contact route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
