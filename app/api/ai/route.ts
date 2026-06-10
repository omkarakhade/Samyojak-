import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are Samyojak AI — a business intelligence assistant for an ERP system. 
You analyze business data and give actionable insights.
Current business context: ${JSON.stringify(context || {})}
Be concise, specific, and actionable. Max 3 sentences per insight.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'No response from AI'

    return NextResponse.json({ reply })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
