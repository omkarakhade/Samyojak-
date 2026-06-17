import { NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const GROQ_KEY = process.env.GROQ_API_KEY || ''
const DODO_KEY = process.env.DODO_PAYMENTS_API_KEY || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const DODO_ENV = process.env.DODO_ENV || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

async function testAirtableRead(table: string) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?maxRecords=1`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )
    const data = await res.json()
    return {
      status: res.status,
      ok: res.ok,
      fields: data.records?.[0] ? Object.keys(data.records[0].fields) : [],
      error: data.error ? JSON.stringify(data.error) : null,
    }
  } catch (e: any) {
    return { status: 'FETCH_ERROR', ok: false, error: String(e.message), fields: [] }
  }
}

async function testAirtableWrite(table: string, testFields: Record<string, unknown>) {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: testFields }),
    })
    const data = await res.json()
    if (data.id) {
      await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${data.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
    }
    return {
      status: res.status,
      ok: res.ok,
      recordId: data.id || null,
      error: data.error ? JSON.stringify(data.error) : null,
    }
  } catch (e: any) {
    return { status: 'FETCH_ERROR', ok: false, error: String(e.message) }
  }
}

async function testGroq() {
  if (!GROQ_KEY) return { ok: false, error: 'GROQ_API_KEY not set in Vercel' }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Reply with exactly two words: AI WORKING' }],
        max_tokens: 10,
      }),
    })
    const text = await res.text()
    if (!res.ok) return { ok: false, status: res.status, error: text }
    const data = JSON.parse(text)
    return { ok: true, status: res.status, reply: data.choices?.[0]?.message?.content?.trim() || 'no reply', model: 'llama-3.1-8b-instant' }
  } catch (e: any) {
    return { ok: false, error: String(e.message) }
  }
}

async function testDodo() {
  if (!DODO_KEY) return { ok: false, error: 'DODO_PAYMENTS_API_KEY not set' }
  try {
    const DodoModule = await import('dodopayments')
    const DodoPayments = DodoModule.default || DodoModule
    new (DodoPayments as any)({ bearerToken: DODO_KEY, environment: DODO_ENV === 'live' ? 'live_mode' : 'test_mode' })
    return { ok: true, environment: DODO_ENV || 'not set', keyPreview: DODO_KEY.substring(0, 8) + '...' }
  } catch (e: any) {
    return { ok: false, error: String(e.message) }
  }
}

async function testSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: false, error: 'Supabase env vars missing' }
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    return { ok: res.ok || res.status === 400, status: res.status, url: SUPABASE_URL }
  } catch (e: any) {
    return { ok: false, error: String(e.message) }
  }
}

export async function GET() {
  const [groq, dodo, supabase] = await Promise.all([testGroq(), testDodo(), testSupabase()])

  const tables = ['Leads', 'Invoices', 'Products', 'Employees', 'Projects', 'Support_Tickets', 'UserData']
  const reads: Record<string, any> = {}
  await Promise.all(tables.map(async t => { reads[t] = await testAirtableRead(t) }))

  const writes: Record<string, any> = {}
  await Promise.all([
    testAirtableWrite('Leads', { Name: 'DEBUG_TEST', Status: 'New' }).then(r => { writes['Leads'] = r }),
    testAirtableWrite('Products', { 'Item Name': 'DEBUG_TEST', SKU: 'DEBUG-000' }).then(r => { writes['Products'] = r }),
    testAirtableWrite('Employees', { Name: 'DEBUG_TEST' }).then(r => { writes['Employees'] = r }),
    testAirtableWrite('Projects', { 'Project Name': 'DEBUG_TEST', Status: 'Planning' }).then(r => { writes['Projects'] = r }),
    testAirtableWrite('Invoices', { 'Payment Status': 'Unpaid', 'Issue Date': new Date().toISOString().split('T')[0], 'GST %': 18, Notes: 'Debug test' }).then(r => { writes['Invoices'] = r }),
  ])

  const allReadsOk = Object.entries(reads).filter(([t]) => t !== 'Support_Tickets').every(([, r]: any) => r.ok)
  const allWritesOk = Object.values(writes).every((r: any) => r.ok)

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      DODO_ENV: DODO_ENV || 'NOT SET',
      APP_URL: APP_URL || 'NOT SET',
      AIRTABLE_TOKEN_EXISTS: !!TOKEN,
      AIRTABLE_TOKEN_LENGTH: TOKEN.length,
      AIRTABLE_TOKEN_PREFIX: TOKEN.substring(0, 8),
      AIRTABLE_BASE_ID: BASE,
      GROQ_KEY_EXISTS: !!GROQ_KEY,
      GROQ_KEY_PREFIX: GROQ_KEY ? GROQ_KEY.substring(0, 8) : 'none',
      DODO_KEY_EXISTS: !!DODO_KEY,
      DODO_KEY_PREFIX: DODO_KEY ? DODO_KEY.substring(0, 8) : 'none',
      SUPABASE_URL_EXISTS: !!SUPABASE_URL,
    },
    airtable: { reads, writes },
    services: {
      groq: {
        ok: (groq as any).ok,
        status: (groq as any).status || null,
        reply: (groq as any).reply || null,
        model: (groq as any).model || null,
        error: (groq as any).ok ? null : (groq as any).error || 'unknown',
      },
      dodo: {
        ok: (dodo as any).ok,
        environment: (dodo as any).environment || null,
        keyPreview: (dodo as any).keyPreview || null,
        error: (dodo as any).ok ? null : (dodo as any).error || 'unknown',
      },
      supabase: {
        ok: (supabase as any).ok,
        status: (supabase as any).status || null,
        url: (supabase as any).url || null,
        error: (supabase as any).ok ? null : (supabase as any).error || 'unknown',
      },
    },
    summary: {
      airtable_reads: allReadsOk ? '✅ ALL OK' : '❌ SOME FAILING (Support_Tickets needs token permission)',
      airtable_writes: allWritesOk ? '✅ ALL OK' : '❌ SOME FAILING',
      groq_ai: (groq as any).ok ? `✅ WORKING — model: llama-3.1-8b-instant` : `❌ FAILING`,
      dodo_payments: (dodo as any).ok ? '✅ INITIALIZED' : '❌ FAILING',
      supabase: (supabase as any).ok ? '✅ REACHABLE' : '❌ FAILING',
    },
  })
}
