import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

async function getAirtableData() {
  const headers = { Authorization: `Bearer ${TOKEN}` }
  const results: Record<string, any> = {}

  const tables = ['Leads', 'Invoices', 'Products', 'Employees', 'Projects']

  await Promise.all(tables.map(async table => {
    try {
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${table}?maxRecords=50`, { headers })
      const d = await r.json()
      results[table] = d.records || []
    } catch {
      results[table] = []
    }
  }))

  return results
}

function buildContext(data: Record<string, any[]>) {
  const leads = data.Leads || []
  const invoices = data.Invoices || []
  const products = data.Products || []
  const employees = data.Employees || []
  const projects = data.Projects || []

  const newLeads = leads.filter((l: any) => l.fields?.Status === 'New').length
  const contactedLeads = leads.filter((l: any) => l.fields?.Status === 'Contacted').length
  const convertedLeads = leads.filter((l: any) => l.fields?.Status === 'Converted').length

  const paidInvoices = invoices.filter((i: any) => i.fields?.['Payment Status'] === 'Paid').length
  const unpaidInvoices = invoices.filter((i: any) => i.fields?.['Payment Status'] === 'Unpaid').length
  const overdueInvoices = invoices.filter((i: any) => i.fields?.['Payment Status'] === 'Overdue').length

  const lowStockProducts = products.filter((p: any) =>
    (p.fields?.['Current Stock'] || 0) <= (p.fields?.['Reorder Level'] || 0)
  ).length

  const totalPayroll = employees.reduce((s: number, e: any) => s + (e.fields?.Salary || 0), 0)

  const inProgressProjects = projects.filter((p: any) => p.fields?.Status === 'In Progress').length
  const overdueProjects = projects.filter((p: any) =>
    p.fields?.Deadline && new Date(p.fields.Deadline) < new Date()
  ).length

  const topLeads = leads
    .sort((a: any, b: any) => (b.fields?.Score || 0) - (a.fields?.Score || 0))
    .slice(0, 3)
    .map((l: any) => `${l.fields?.Name} (${l.fields?.Status}, score: ${l.fields?.Score || 0})`)

  return {
    totalLeads: leads.length,
    newLeads,
    contactedLeads,
    convertedLeads,
    totalInvoices: invoices.length,
    paidInvoices,
    unpaidInvoices,
    overdueInvoices,
    totalProducts: products.length,
    lowStockProducts,
    totalEmployees: employees.length,
    totalPayroll,
    totalProjects: projects.length,
    inProgressProjects,
    overdueProjects,
    topLeads,
    recentLeadNames: leads.slice(0, 5).map((l: any) => l.fields?.Name).filter(Boolean),
  }
}

function getFallback(context: any): string {
  if (!context) {
    return '🚀 Add your business data to get personalized AI insights about your leads, revenue, and growth opportunities!'
  }
  const { totalLeads, convertedLeads, paidInvoices, newLeads } = context
  if (totalLeads === 0) {
    return '🌟 Your ERP is ready! Start by adding your first lead in CRM. Every big business started with their first contact.'
  }
  if (convertedLeads > 0) {
    return `💪 You have converted ${convertedLeads} out of ${totalLeads} leads — that is real traction! Focus on your ${newLeads} new leads today and follow up personally.`
  }
  return `🎯 You have ${totalLeads} leads in your pipeline. Your next goal is to convert at least one to a paying customer. Pick your top lead and reach out today!`
}

export async function POST(req: NextRequest) {
  try {
    const { message, isOnboarding, userName, company } = await req.json()

    const apiKey = process.env.GROQ_API_KEY

    // Fetch real data from Airtable
    let context: any = null
    try {
      const data = await getAirtableData()
      context = buildContext(data)
    } catch (e) {
      console.error('Could not fetch Airtable data for AI:', e)
    }

    if (!apiKey) {
      return NextResponse.json({ reply: getFallback(context), context })
    }

    const systemPrompt = isOnboarding
      ? `You are Samyojak AI — a warm, encouraging business assistant.
The user just signed up. Name: ${userName || 'there'}. Company: ${company || 'their business'}.
Give a warm personalized welcome in 2-3 sentences. Tell them the ONE most important first step.
Be energetic and encouraging. Use 1-2 emojis. Keep it under 50 words.`
      : `You are Samyojak AI — a smart business intelligence assistant for an ERP system.
You have access to the user's REAL business data:

${context ? JSON.stringify(context, null, 2) : 'No data available yet'}

Rules:
- Use their ACTUAL numbers when answering
- Always find the positive angle first
- Give specific actionable advice based on their data
- If they ask about leads, mention their actual lead names and counts
- If they ask about revenue, use their actual invoice data
- Be encouraging like a business mentor
- Maximum 4 sentences
- Use 1-2 emojis
- Never say "I don't have access to your data" — you DO have their data above`

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
          { role: 'user', content: message || 'Give me a business overview' }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('Groq error:', response.status)
      return NextResponse.json({ reply: getFallback(context) })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    return NextResponse.json({ reply: reply || getFallback(context), context })

  } catch (error: any) {
    console.error('AI route error:', error.message)
    return NextResponse.json({
      reply: '🤖 AI is temporarily unavailable. Check your GROQ_API_KEY in Vercel environment variables.'
    })
  }
}
