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
    readTest: {},
    writeTest: null,
    fieldNames: {},
  }

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  const tables = ['Leads', 'Invoices', 'Products', 'Employees', 'Projects']

  for (const table of tables) {
    try {
      const res = await fetch(
        `https://api.airtable.com/v0/${BASE}/${table}?maxRecords=1`,
        { headers }
      )
      const data = await res.json()
      results.readTest[table] = {
        status: res.status,
        ok: res.ok,
        error: data.error || null,
      }
      if (data.records?.[0]?.fields) {
        results.fieldNames[table] = Object.keys(data.records[0].fields)
      }
    } catch (e: any) {
      results.readTest[table] = { error: e.message }
    }
  }

  // WRITE TEST
  try {
    const writeRes = await fetch(
      `https://api.airtable.com/v0/${BASE}/Leads`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fields: {
            Name: 'WRITE_TEST_DELETE_ME',
            Status: 'New',
            Notes: 'Samyojak write test',
          },
        }),
      }
    )
    const writeData = await writeRes.json()
    results.writeTest = {
      status: writeRes.status,
      ok: writeRes.ok,
      recordId: writeData.id || null,
      error: writeData.error || null,
      message: writeData.error ? JSON.stringify(writeData) : 'WRITE SUCCESS',
    }

    if (writeData.id) {
      await fetch(
        `https://api.airtable.com/v0/${BASE}/Leads/${writeData.id}`,
        { method: 'DELETE', headers }
      )
      results.writeTest.cleaned = true
    }
  } catch (e: any) {
    results.writeTest = { error: e.message }
  }

  return NextResponse.json(results)
}
