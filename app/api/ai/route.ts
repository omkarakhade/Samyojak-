import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

async function fetchTableData(table: string, maxRecords = 50) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?maxRecords=${maxRecords}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.records || []
  } catch {
    return []
  }
}

async function buildBusinessContext() {
  const [leads, invoices, products, employees, projects] = await Promise.all([
    fetchTableData('Leads'),
    fetchTableData('Invoices'),
    fetchTableData('Products'),
    fetchTableData('Employees'),
    fetchTableData('Projects'),
  ])

  const newLeads = leads.filter((l: any) => l.fields?.Status === 'New').length
  const contactedLeads = leads.filter((l: any) => l.fields?.Status === 'Contacted').length
  const convertedLeads = leads.filter((l: any) => l.fields?.Status === 'Converted').length
  const lostLeads = leads.filter((l: any) => l.fields?.Status === 'Lost').length

  const paidInvoices = invoices.filter((i: any) => i.fields?.['Payment Status'] === 'Paid').length
  const unpaidInvoices = invoices.filter((i: any) => i.fields?.['Payment Status'] === 'Unpaid').length
  const overdueInvoices = invoices.filter((i: any) => i.fields?.['Payment Status'] === 'Overdue').length

  const lowStock = products.filter((p: any) =>
    (p.fields?.['Current Stock'] || 0) <= (p.fields?.['Reorder Level'] || 0) &&
    (p.fields?.['Reorder Level'] || 0) > 0
  ).length

  const totalPayroll = employees.reduce((s: number, e: any) => s + (e.fields?.Salary || 0), 0)

  const inProgress = projects.filter((p: any) => p.fields?.Status === 'In Progress').length
  const overdueProjects = projects.filter((p: any) =>
    p.fields?.Deadline && new Date(p.fields.Deadline) < new Date()
  ).length

  const topLeads = leads
    .sort((a: any, b: any) => (b.fields?.Score || 0) - (a.fields?.Score || 0))
    .slice(0, 3)
    .map((l: any) => `${l.fields?.Name || 'Unknown'} (${l.fields?.Status || 'New'}, score: ${l.fields?.Score || 0})`)

  const recentLeadNames = leads
    .slice(0, 5)
    .map((l: any) => l.fields?.Name)
    .filter(Boolean)

  return {
    leads: {
      total: leads.length,
      new: newLeads,
      contacted: contactedLeads,
      converted: convertedLeads,
      lost: lostLeads,
      conversionRate: leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0,
      topLeads,
      recentNames: recentLeadNames,
    },
    invoices: {
      total: invoices.length,
      paid: paidInvoices,
      unpaid: unpaidInvoices,
      overdue: overdueInvoices,
    },
    inventory: {
      total: products.length,
      lowStock,
    },
    hr: {
      total: employees.length,
      totalPayroll,
    },
    projects: {
      total: projects.length,
      inProgress,
      overdueProjects,
      done: projects.filter((p: any) => p.fields?.Status === 'Done').length,
    },
  }
}

function getMotivationalFallback(context: any): string {
  if (!context) {
    return '🚀 Your Samyojak ERP is ready! Start by adding your first lead in CRM. Every big business started with their first contact. You have got this!'
  }

  const { leads, invoices, inventory } = context

  if (leads.total === 0) {
    return '🌟 Your ERP is set up and ready! Head to CRM and add your first lead today. The journey of a thousand customers starts with one.'
  }

  if (leads.converted > 0) {
    return `💪 You have already converted ${leads.converted} out of ${leads.total} leads — real traction! Your top leads are: ${leads.topLeads.slice(0, 2).join(', ')}. Follow up with your ${leads.new} new leads today.`
  }

  if (invoices.overdue > 0) {
    return `⚠️ You have ${invoices.overdue} overdue invoice${invoices.overdue > 1 ? 's' : ''} that need attention today. Follow up on payments first — then focus on your ${leads.new} new leads in the pipeline.`
  }

  if (inventory.lowStock > 0) {
    return `📦 ${inventory.lowStock} product${inventory.lowStock > 1 ? 's are' : ' is'} running low on stock. Reorder before you run out. Meanwhile you have ${leads.total} leads in your pipeline to convert!`
  }

  return `🎯 You have ${leads.total} leads with a ${leads.conversionRate}% conversion rate. Your pipeline has ${leads.new} new leads and ${leads.contacted} being nurtured. Keep pushing — every follow-up brings you closer to a sale!`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, isOnboarding, userName, company } = body

    const apiKey = process.env.GROQ_API_KEY

    // Always fetch real data
    let context: any = null
    try {
      context = await buildBusinessContext()
    } catch (e) {
      console.error('Failed to fetch business context:', e)
    }

    if (!apiKey) {
      return NextResponse.json({
        reply: getMotivationalFallback(context),
        context,
      })
    }

    let systemPrompt: string

    if (isOnboarding) {
      systemPrompt = `You are Samyojak AI — a warm, encouraging business assistant.
User just signed up. Name: ${userName || 'there'}. Company: ${company || 'their business'}.
Give a warm 2-3 sentence personalized welcome. Tell them ONE most important first step.
Be energetic, friendly. Use 1-2 emojis. Max 60 words.`
    } else {
      systemPrompt = `You are Samyojak AI — a smart, encouraging business intelligence assistant for an ERP system.

You have access to the user's REAL live business data right now:

LEADS: ${context?.leads.total || 0} total — ${context?.leads.new || 0} new, ${context?.leads.contacted || 0} contacted, ${context?.leads.converted || 0} converted, ${context?.leads.lost || 0} lost
Conversion rate: ${context?.leads.conversionRate || 0}%
Top leads: ${context?.leads.topLeads?.join(', ') || 'none yet'}
Recent leads: ${context?.leads.recentNames?.join(', ') || 'none yet'}

INVOICES: ${context?.invoices.total || 0} total — ${context?.invoices.paid || 0} paid, ${context?.invoices.unpaid || 0} unpaid, ${context?.invoices.overdue || 0} overdue

INVENTORY: ${context?.inventory.total || 0} products — ${context?.inventory.lowStock || 0} low on stock

EMPLOYEES: ${context?.hr.total || 0} team members — Total payroll: ₹${context?.hr.totalPayroll?.toLocaleString() || 0}/month

PROJECTS: ${context?.projects.total || 0} total — ${context?.projects.inProgress || 0} in progress, ${context?.projects.done || 0} done, ${context?.projects.overdueProjects || 0} overdue

RULES:
- Use ACTUAL numbers from the data above when answering
- Always find the positive angle first
- Give specific actionable advice based on their real data
- Reference actual lead names when relevant
- Be like an encouraging business mentor who knows their numbers
- Maximum 4 sentences
- Use 1-2 emojis
- NEVER say "I don't have access to your data" — you DO have it above
- If asked about specific things like leads or invoices, give specific answers using the numbers above`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message || 'Give me a quick business overview and what I should focus on today' },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Groq error:', response.status, errText)
      return NextResponse.json({
        reply: getMotivationalFallback(context),
        context,
      })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    return NextResponse.json({
      reply: reply || getMotivationalFallback(context),
      context,
    })
  } catch (error: any) {
    console.error('AI route error:', error.message)
    return NextResponse.json({
      reply: '🤖 AI is warming up. Check GROQ_API_KEY in Vercel environment variables.',
    })
  }
}
