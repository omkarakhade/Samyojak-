import { NextResponse } from 'next/server'

export async function GET() {
  const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
  const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

  const results: any = {
    config: {
      TOKEN_EXISTS: !!TOKEN,
      TOKEN_LENGTH: TOKEN.length,
      TOKEN_PREFIX: TOKEN.substring(0, 8),
      BASE_ID: BASE,
      BASE_ID_LENGTH: BASE.length,
    },
    tables: {}
  }

  if (!TOKEN || !BASE) {
    results.error = 'TOKEN or BASE_ID is missing from environment variables'
    return NextResponse.json(results)
  }

  const tables = ['Leads', 'Invoices', 'Products', 'Employees', 'Projects']

  for (const table of tables) {
    try {
      const url = `https://api.airtable.com/v0/${BASE}/${table}?maxRecords=3`
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      })

      const text = await res.text()
      let data: any = {}

      try {
        data = JSON.parse(text)
      } catch {
        data = { rawResponse: text.slice(0, 200) }
      }

      results.tables[table] = {
        status: res.status,
        ok: res.ok,
        recordCount: data.records?.length ?? 0,
        error: data.error || null,
        firstRecord: data.records?.[0]?.fields || null,
        rawError: !res.ok ? text.slice(0, 300) : null,
      }
    } catch (e: any) {
      results.tables[table] = {
        status: 'FETCH_ERROR',
        error: e.message,
      }
    }
  }

  return NextResponse.json(results)
}
