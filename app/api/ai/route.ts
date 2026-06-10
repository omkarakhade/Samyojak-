import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    console.log('AI request:', message)
    console.log('Groq key exists:', !!process.env.GROQ_API_KEY)

    if (!process.env.GROQ_API_KEY) {
      // Fallback responses when no API key
      const fallbacks = [
        'To get your first 10 customers: message 10 business owners you know personally on WhatsApp today. Show them the live demo at samyojak.vercel.app. Offer first month at 50% off. One yes this week proves the product works.',
        'Your biggest priority right now is getting one paying customer. Not more features. Not more code. One real payment validates everything. Post your story on Reddit r/SaaS today.',
        'Revenue forecast: 5 customers at $15/month = $75/month. 20 customers = $300/month. 100 customers = $1500/month. You need 100 customers to be sustainable. Focus on outreach.',
        'Best marketing for Samyojak right now: 1) Reddit r/SaaS post with your phone-only story. 2) WhatsApp 10 business owners you know. 3) LinkedIn founder post. All free. All today.',
      ]
      const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      return NextResponse.json({ reply, note: 'Using fallback — add GROQ_API_KEY to Vercel for real AI' })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are Samyojak AI — a business intelligence assistant for an ERP SaaS startup.
The founder is Omkar Akhade, a solo founder who built this entire ERP using only a phone with zero funding.
Business: Samyojak ERP — CRM, invoicing, inventory, HR, projects, tax reports.
Live at: samyojak.vercel.app
Current data: ${JSON.stringify(context || {})}
Give specific, actionable advice. Be encouraging but honest. Max 4 sentences.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq error:', response.status, errorText)

      return NextResponse.json({
        reply: `I am having trouble connecting right now. Quick advice: Post your builder story on Reddit r/SaaS today. Message 10 business owners on WhatsApp. Apply to Vercel and Supabase startup programs for free credits. These three actions this week can get you first customers.`,
        note: `Groq API error: ${response.status}`
      })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return NextResponse.json({
        reply: 'No response from AI model. Check your Groq API key in Vercel environment variables.',
      })
    }

    return NextResponse.json({ reply })

  } catch (error: any) {
    console.error('AI route error:', error.message)
    return NextResponse.json({
      reply: 'AI temporarily unavailable. Add GROQ_API_KEY to Vercel Settings → Environment Variables. Get free key at console.groq.com — takes 2 minutes.',
    })
  }
}
