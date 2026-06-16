import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

async function saveToAirtable(userId: string, module: string, records: Record<string, unknown>[], source: string) {
  const results = { success: 0, failed: 0 }

  for (const record of records) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'User ID': userId,
            'Module': module,
            'Record Data': JSON.stringify(record),
            'Source': source,
            'Created At': new Date().toISOString().split('T')[0],
          }
        })
      })

      if (res.ok) {
        results.success++
      } else {
        results.failed++
      }

      // Avoid Airtable rate limit
      await new Promise(r => setTimeout(r, 120))
    } catch {
      results.failed++
    }
  }

  return results
}

function parseCSVText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes
      else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    return values
  }

  const headers = parseRow(lines[0])
  const rows = lines.slice(1).map(line => {
    const values = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  }).filter(row => Object.values(row).some(v => v.trim()))

  return { headers, rows }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const module = formData.get('module') as string
    const source = formData.get('source') as string || 'csv_import'

    if (!file || !userId || !module) {
      return NextResponse.json({ error: 'Missing file, userId, or module' }, { status: 400 })
    }

    const text = await file.text()
    const { headers, rows } = parseCSVText(text)

    if (headers.length === 0) {
      return NextResponse.json({ error: 'Could not read CSV file. Make sure it has headers in the first row.' }, { status: 400 })
    }

    const results = await saveToAirtable(userId, module, rows, source)

    return NextResponse.json({
      success: true,
      headers,
      totalRows: rows.length,
      imported: results.success,
      failed: results.failed,
      message: `Successfully imported ${results.success} records from ${rows.length} rows.`
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
