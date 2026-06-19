import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  if (lines.length < 1) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  }

  const headers = parseRow(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())

  const rows = lines.slice(1).map(line => {
    const values = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = (values[index] || '').replace(/^"|"$/g, '').trim()
    })
    return row
  }).filter(row => {
    // Only skip completely empty rows
    return Object.values(row).some(v => v.length > 0)
  })

  return { headers, rows }
}

async function storeRecord(
  userId: string,
  module: string,
  source: string,
  originalHeaders: string[],
  rowData: Record<string, string>,
  importId: string,
  rowIndex: number
) {
  // Store EVERYTHING — no field filtering, no skipping, no validation
  const payload = {
    fields: {
      'User ID': userId,
      'Module': module,
      'Record Data': JSON.stringify({
        _meta: {
          importId,
          rowIndex,
          source,
          importedAt: new Date().toISOString(),
          originalHeaders, // Preserve original column names
          totalColumns: originalHeaders.length,
        },
        // Every single column from the original CSV
        ...rowData,
      }),
      'Source': source,
      'Created At': new Date().toISOString().split('T')[0],
    }
  }

  const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Store failed: ${res.status} ${err}`)
  }

  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string
    const module = formData.get('module') as string
    const source = formData.get('source') as string || 'csv_import'

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    if (!module) return NextResponse.json({ error: 'module required' }, { status: 400 })

    if (!file.name.match(/\.(csv|txt|tsv)$/i)) {
      return NextResponse.json({ error: 'Please upload a CSV file. For Excel files, save as CSV first.' }, { status: 400 })
    }

    const text = await file.text()
    const { headers, rows } = parseCSV(text)

    if (headers.length === 0) {
      return NextResponse.json({ error: 'Could not read headers from file. Make sure first row contains column names.' }, { status: 400 })
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File has headers but no data rows.' }, { status: 400 })
    }

    // Generate unique import batch ID
    const importId = `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      importId,
      headers,
      totalRows: rows.length,
      totalColumns: headers.length,
    }

    // Store every row — no filtering, no skipping
    for (let i = 0; i < rows.length; i++) {
      try {
        await storeRecord(userId, module, source, headers, rows[i], importId, i)
        results.success++

        // Respect Airtable rate limit — max 5 requests/second
        if (i > 0 && i % 5 === 0) {
          await new Promise(r => setTimeout(r, 1000))
        } else {
          await new Promise(r => setTimeout(r, 210))
        }
      } catch (e: any) {
        results.failed++
        results.errors.push(`Row ${i + 1}: ${e.message}`)
        console.error(`Row ${i + 1} failed:`, e.message)
      }
    }

    return NextResponse.json({
      success: true,
      importId,
      headers,
      totalRows: rows.length,
      totalColumns: headers.length,
      imported: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 5), // Only show first 5 errors
      message: results.failed === 0
        ? `All ${results.success} rows imported with all ${headers.length} columns preserved.`
        : `${results.success} rows imported. ${results.failed} failed.`,
    })

  } catch (error: any) {
    console.error('Universal import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
