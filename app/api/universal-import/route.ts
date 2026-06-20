import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  if (lines.length < 2) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    return values
  }

  const rawHeaders = parseRow(lines[0])
  const headers = rawHeaders.map(h => h.replace(/^["'\s]+|["'\s]+$/g, '').trim()).filter(h => h.length > 0)

  const rows = lines.slice(1).map(line => {
    const vals = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = (vals[index] || '').replace(/^"|"$/g, '').trim()
    })
    return row
  }).filter(row => Object.values(row).some(v => v.length > 0))

  return { headers, rows }
}

async function storeOneRecord(
  userId: string,
  module: string,
  source: string,
  headers: string[],
  rowData: Record<string, string>,
  importId: string,
  rowIndex: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const recordPayload = {
      _meta: {
        importId,
        rowIndex,
        source,
        importedAt: new Date().toISOString(),
        originalHeaders: headers,
        totalColumns: headers.length,
      },
      ...rowData,
    }

    const body = {
      fields: {
        'User ID': userId,
        'Module': module,
        'Record Data': JSON.stringify(recordPayload),
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
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Row ${rowIndex + 1}: Airtable ${res.status} — ${errText}` }
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: `Row ${rowIndex + 1}: ${e.message}` }
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string
    const module = formData.get('module') as string
    const source = (formData.get('source') as string) || 'csv_import'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    if (!module) return NextResponse.json({ error: 'module is required' }, { status: 400 })

    if (!file.name.match(/\.(csv|txt|tsv)$/i)) {
      return NextResponse.json({
        error: 'Please upload a CSV file. For Excel files: File → Save As → CSV format first.'
      }, { status: 400 })
    }

    const text = await file.text()

    if (!text.trim()) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    const { headers, rows } = parseCSV(text)

    if (headers.length === 0) {
      return NextResponse.json({
        error: 'Could not read column headers. Make sure the first row of your CSV contains column names.'
      }, { status: 400 })
    }

    if (rows.length === 0) {
      return NextResponse.json({
        error: 'File has column headers but no data rows.'
      }, { status: 400 })
    }

    const importId = `${module}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    // Process rows with Airtable rate limiting (max 5 req/sec on free plan)
    for (let i = 0; i < rows.length; i++) {
      const result = await storeOneRecord(userId, module, source, headers, rows[i], importId, i)

      if (result.success) {
        successCount++
      } else {
        failCount++
        if (result.error) errors.push(result.error)
        console.error('Import row error:', result.error)
      }

      // Rate limit: 1 request per 210ms = ~4.7 req/sec (safe under 5/sec limit)
      await new Promise(r => setTimeout(r, 210))
    }

    return NextResponse.json({
      success: true,
      importId,
      headers,
      totalRows: rows.length,
      totalColumns: headers.length,
      imported: successCount,
      failed: failCount,
      errors: errors.slice(0, 5),
      message: failCount === 0
        ? `Successfully imported all ${successCount} rows with all ${headers.length} columns preserved.`
        : `Imported ${successCount} rows. ${failCount} rows failed — see errors above.`,
    })

  } catch (error: any) {
    console.error('Universal import route error:', error)
    return NextResponse.json({
      error: 'Import failed: ' + (error.message || 'Unknown error')
    }, { status: 500 })
  }
}
