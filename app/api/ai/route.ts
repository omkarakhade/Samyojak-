import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context, isOnboarding } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: getMotivationalFallback(context)
      })
    }

    const systemPrompt = isOnboarding
      ? `You are Samyojak AI — a warm, encouraging business assistant greeting a new user.
User just signed up. Their name is ${context?.userName || 'there'} and their company is ${context?.company || 'their business'}.
Give them a warm personalized welcome. Tell them the ONE most important thing to do first based on their business.
Suggest which module to start with. Be encouraging, energetic, and specific.
Maximum 3 sentences. Use emojis. Make them excited to use Samyojak.`
      : `You are Samyojak AI — a smart, encouraging business intelligence assistant.
You help business owners understand their data and grow their business.
Current user data: ${JSON.stringify(context || {})}
Rules:
- Always find the POSITIVE angle first
- Give specific actionable advice
- Use their actual numbers when available
- Be warm and encouraging like a business mentor
- Maximum 4 sentences
- Use emojis occasionally
- If business looks slow, show what IS working and what to do next
- Never say "I don't have data" — always give useful advice`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ reply: getMotivationalFallback(context) })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    return NextResponse.json({ reply: reply || getMotivationalFallback(context) })

  } catch (error: any) {
    return NextResponse.json({ reply: getMotivationalFallback(null) })
  }
}

function getMotivationalFallback(context: any): string {
  const leads = context?.totalLeads || 0
  const revenue = context?.revenue || 0

  if (leads > 5) {
    return `🚀 You have ${leads} leads in your pipeline — that is real momentum! Focus on your top 3 highest-score leads today and follow up personally. One converted lead can change your whole month.`
  }
  if (revenue > 0) {
    return `💰 You are already generating revenue — that puts you ahead of 90% of startups! Keep adding leads daily and your pipeline will compound. What got you here will get you further.`
  }
  return `🌟 Every successful business started exactly where you are right now. Add your first lead today, send your first invoice, and watch momentum build. The hardest step is the first one — and you have already taken it by being here.`
}
