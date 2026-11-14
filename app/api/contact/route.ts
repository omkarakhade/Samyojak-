import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const t = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
    const name = t(body.name, 100)
    const email = t(body.email, 200)
    const company = t(body.company, 150)
    const subject = t(body.subject, 150)
    const message = String(body.message ?? '').replace(/\u0000/g, '').trim().slice(0, 5000)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
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
Sent from www.samyojak-erp.com/contact
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
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  }
}
