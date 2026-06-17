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
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?maxRecords=1`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    const data = await res.json()
    return {
      status: res.status,
      ok: res.ok,
      recordCount: data.records?.length || 0,
      fields: data.records?.[0] ? Object.keys(data.records[0].fields) : [],
      error: data.error || null,
    }
  } catch (e: any) {
    return { status: 'ERROR', ok: false, error: e.message, fields: [] }
  }
}

async function testAirtableWrite(table: string, testFields: Record<string, unknown>) {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: testFields })
    })
    const data = await res.json()
    if (data.id) {
      // Clean up test record
      await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${data.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` }
      })
    }
    return { status: res.status, ok: res.ok, recordId: data.id || null, error: data.error || null }
  } catch (e: any) {
    return { status: 'ERROR', ok: false, error: e.message }
  }
}

async function testGroq() {
  if (!GROQ_KEY) return { ok: false, error: 'GROQ_API_KEY not set' }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Reply with exactly: AI_WORKING' }],
        max_tokens: 10
      })
    })
    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || ''
    return { ok: res.ok, status: res.status, reply, error: data.error || null }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

async function testDodo() {
  if (!DODO_KEY) return { ok: false, error: 'DODO_PAYMENTS_API_KEY not set' }
  try {
    const DodoModule = await import('dodopayments')
    const DodoPayments = DodoModule.default || DodoModule
    const client = new (DodoPayments as any)({
      bearerToken: DODO_KEY,
      environment: DODO_ENV === 'live' ? 'live_mode' : 'test_mode',
    })
    // Just check if client initializes without error
    return { ok: true, environment: DODO_ENV, keyPrefix: DODO_KEY.substring(0, 8) }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

async function testSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: false, error: 'Supabase env vars missing' }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
    return { ok: res.ok, status: res.status, url: SUPABASE_URL }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      DODO_ENV: DODO_ENV || 'NOT SET',
      APP_URL: APP_URL || 'NOT SET',
      AIRTABLE_TOKEN_EXISTS: !!TOKEN,
      AIRTABLE_TOKEN_LENGTH: TOKEN.length,
      AIRTABLE_TOKEN_PREFIX: TOKEN.substring(0, 8),
      AIRTABLE_BASE_ID: BASE,
      GROQ_KEY_EXISTS: !!GROQ_KEY,
      GROQ_KEY_PREFIX: GROQ_KEY.substring(0, 8),
      DODO_KEY_EXISTS: !!DODO_KEY,
      DODO_KEY_PREFIX: DODO_KEY.substring(0, 8),
      SUPABASE_URL_EXISTS: !!SUPABASE_URL,
    },
    airtable: {
      reads: {},
      writes: {},
    },
    services: {},
  }

  // Test all Airtable table reads
  const tables = ['Leads', 'Invoices', 'Products', 'Employees', 'Projects', 'Support_Tickets', 'UserData']
  await Promise.all(tables.map(async table => {
    results.airtable.reads[table] = await testAirtableRead(table)
  }))

  // Test writes with minimal safe fields
  results.airtable.writes['Leads'] = await testAirtableWrite('Leads', { Name: 'DEBUG_TEST_DELETE', Status: 'New' })
  results.airtable.writes['Products'] = await testAirtableWrite('Products', { 'Item Name': 'DEBUG_TEST_DELETE', SKU: 'DEBUG-SKU' })
  results.airtable.writes['Employees'] = await testAirtableWrite('Employees', { Name: 'DEBUG_TEST_DELETE' })
  results.airtable.writes['Projects'] = await testAirtableWrite('Projects', { 'Project Name': 'DEBUG_TEST_DELETE', Status: 'Planning' })

  // Test Invoice write without Notes field
  results.airtable.writes['Invoices'] = await testAirtableWrite('Invoices', {
    'Payment Status': 'Unpaid',
    'Issue Date': new Date().toISOString().split('T')[0],
    'GST %': 18,
  })

  // Test services
  const [groq, dodo, supabase] = await Promise.all([testGroq(), testDodo(), testSupabase()])
  results.services.groq = groq
  results.services.dodo = dodo
  results.services.supabase = supabase

  // Summary
  const allReadsOk = Object.values(results.airtable.reads).every((r: any) => r.ok)
  const allWritesOk = Object.values(results.airtable.writes).every((r: any) => r.ok)
  results.summary = {
    airtable_reads: allReadsOk ? '✅ ALL OK' : '❌ SOME FAILING',
    airtable_writes: allWritesOk ? '✅ ALL OK' : '❌ SOME FAILING — check errors above',
    groq_ai: groq.ok ? '✅ WORKING' : '❌ FAILING',
    dodo_payments: dodo.ok ? '✅ INITIALIZED' : '❌ FAILING',
    supabase: supabase.ok ? '✅ REACHABLE' : '❌ FAILING',
  }

  return NextResponse.json(results)
}
