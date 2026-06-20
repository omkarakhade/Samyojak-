import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const GROQ_MODEL = 'llama-3.1-8b-instant'

async function fetchAirtableTable(table: string, max = 50) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?maxRecords=${max}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )
    if (!res.ok) return []
    const d = await res.json()
    return d.records || []
  } catch { return [] }
}

async function fetchUserData(userId: string, module: string) {
  try {
    const formula = `AND({User ID}="${userId}",{Module}="${module}")`
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(formula)}&maxRecords=200`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )
    if (!res.ok) return []
    const d = await res.json()
    return (d.records || []).map((r: any) => {
      try {
        const parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
        const { _meta, ...data } = parsed
        return data
      } catch { return {} }
    })
  } catch { return [] }
}

async function buildContext(userId?: string) {
  const [
    airtableLeads,
    airtableInvoices,
    airtableProducts,
    airtableEmployees,
    airtableProjects,
  ] = await Promise.all([
    fetchAirtableTable('Leads'),
    fetchAirtableTable('Invoices'),
    fetchAirtableTable('Products'),
    fetchAirtableTable('Employees'),
    fetchAirtableTable('Projects'),
  ])

  // Also fetch from UserData if userId provided
  let userLeads: any[] = []
  let userInvoices: any[] = []
  let userProducts: any[] = []
  let userEmployees: any[] = []
  let userProjects: any[] = []

  if (userId) {
    ;[userLeads, userInvoices, userProducts, userEmployees, userProjects] = await Promise.all([
      fetchUserData(userId, 'CRM'),
      fetchUserData(userId, 'Invoices'),
      fetchUserData(userId, 'Inventory'),
      fetchUserData(userId, 'HR'),
      fetchUserData(userId, 'Projects'),
    ])
  }

  // Merge airtable + userdata
  const allLeads = [
    ...airtableLeads.map((r: any) => r.fields || {}),
    ...userLeads,
  ]
  const allInvoices = [
    ...airtableInvoices.map((r: any) => r.fields || {}),
    ...userInvoices,
  ]
  const allProducts = [
    ...airtableProducts.map((r: any) => r.fields || {}),
    ...userProducts,
  ]
  const allEmployees = [
    ...airtableEmployees.map((r: any) => r.fields || {}),
    ...userEmployees,
  ]
  const allProjects = [
    ...airtableProjects.map((r: any) => r.fields || {}),
    ...userProjects,
  ]

  const totalLeads = allLeads.length
  const converted = allLeads.filter((l: any) =>
    (l.Status || l.status || '').toLowerCase().includes('convert')
  ).length
  const newLeads = allLeads.filter((l: any) =>
    (l.Status || l.status || '').toLowerCase() === 'new'
  ).length

  const paidInvoices = allInvoices.filter((i: any) =>
    (i['Payment Status'] || i.payment_status || i.Status || '').toLowerCase() === 'paid'
  ).length
  const overdueInvoices = allInvoices.filter((i: any) =>
    (i['Payment Status'] || i.payment_status || i.Status || '').toLowerCase().includes('overdue')
  ).length

  const lowStock = allProducts.filter((p: any) => {
    const stock = Number(p['Current Stock'] || p.stock || p.quantity || 0)
    const reorder = Number(p['Reorder Level'] || p.reorder || 0)
    return reorder > 0 && stock <= reorder
  }).length

  const totalPayroll = allEmployees.reduce((s: number, e: any) =>
    s + Number(e.Salary || e.salary || e.pay || 0), 0
  )

  const inProgress = allProjects.filter((p: any) =>
    (p.Status || p.status || '').toLowerCase().includes('progress')
  ).length

  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0

  const topLeadNames = allLeads
    .slice(0, 5)
    .map((l: any) => l.Name || l.name || l.CustomerName || l['Customer Name'] || l.ContactName || l['Contact Name'] || '')
    .filter(Boolean)

  return {
    leads: { total: totalLeads, new: newLeads, converted, conversionRate, topNames: topLeadNames },
    invoices: { total: allInvoices.length, paid: paidInvoices, overdue: overdueInvoices },
    inventory: { total: allProducts.length, lowStock },
    hr: { total: allEmployees.length, totalPayroll },
    projects: { total: allProjects.length, inProgress },
    importedData: {
      crmRows: userLeads.length,
      invoiceRows: userInvoices.length,
      inventoryRows: userProducts.length,
      hrRows: userEmployees.length,
      projectRows: userProjects.length,
    },
  }
}

function getFallback(ctx: any): string {
  if (!ctx || ctx.leads.total === 0) {
    return '🌟 Your ERP is ready! Import your first CSV or add a lead manually to get started.'
  }
  if (ctx.leads.converted > 0) {
    return `💪 ${ctx.leads.converted} leads converted out of ${ctx.leads.total} — a ${ctx.leads.conversionRate}% conversion rate! Keep following up with your ${ctx.leads.new} new leads.`
  }
  if (ctx.invoices.overdue > 0) {
    return `⚠️ ${ctx.invoices.overdue} overdue invoice${ctx.invoices.overdue > 1 ? 's' : ''} need attention today. Collect those payments first!`
  }
  return `🎯 You have ${ctx.leads.total} leads in your pipeline. Focus on converting your top prospects today!`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, isOnboarding, userName, company, businessType, userId } = body

    const apiKey = process.env.GROQ_API_KEY

    let context: any = null
    try {
      context = await buildContext(userId)
    } catch (e) {
      console.error('Context build error:', e)
    }

    if (!apiKey) {
      return NextResponse.json({ reply: getFallback(context), context })
    }

    let systemPrompt: string

    if (isOnboarding) {
      systemPrompt = `You are Samyojak AI — a warm, smart business assistant.
User just signed up. Name: ${userName || 'there'}. Company: ${company || 'their business'}. Business type: ${businessType || 'not specified'}.
Give a warm 2-3 sentence personalized welcome and tell them ONE most important first step.
Be energetic and encouraging. Use 1-2 emojis. Max 60 words.`
    } else {
      systemPrompt = `You are Samyojak AI — a smart business intelligence assistant for an adaptive ERP.

You have access to the user's real business data (from both Airtable and imported CSVs):

LEADS & CRM:
- Total leads: ${context?.leads.total || 0}
- New leads: ${context?.leads.new || 0}
- Converted: ${context?.leads.converted || 0}
- Conversion rate: ${context?.leads.conversionRate || 0}%
- Recent names: ${context?.leads.topNames?.join(', ') || 'none yet'}

INVOICES:
- Total: ${context?.invoices.total || 0}
- Paid: ${context?.invoices.paid || 0}
- Overdue: ${context?.invoices.overdue || 0}

INVENTORY:
- Products: ${context?.inventory.total || 0}
- Low stock alerts: ${context?.inventory.lowStock || 0}

HR:
- Employees: ${context?.hr.total || 0}
- Monthly payroll: ₹${context?.hr.totalPayroll?.toLocaleString() || 0}

PROJECTS:
- Total: ${context?.projects.total || 0}
- In progress: ${context?.projects.inProgress || 0}

IMPORTED CSV DATA:
- CRM rows imported: ${context?.importedData?.crmRows || 0}
- Invoice rows imported: ${context?.importedData?.invoiceRows || 0}
- Inventory rows imported: ${context?.importedData?.inventoryRows || 0}
- HR rows imported: ${context?.importedData?.hrRows || 0}
- Project rows imported: ${context?.importedData?.projectRows || 0}

RULES:
- Use ACTUAL numbers from data above
- Reference real lead names when relevant
- Be encouraging like a business mentor
- Give specific actionable advice
- Max 4 sentences
- 1-2 emojis
- Never say you do not have data — you have it all above`
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message || 'Give me a business overview and what I should focus on today' },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Groq error:', res.status, errText)
      return NextResponse.json({ reply: getFallback(context), context })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content

    return NextResponse.json({ reply: reply || getFallback(context), context })
  } catch (error: any) {
    console.error('AI route error:', error.message)
    return NextResponse.json({ reply: '🤖 AI is warming up. Try again in a moment.' })
  }
}
