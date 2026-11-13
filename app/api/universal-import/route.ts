import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeModule } from '@/lib/serverAuth'
import { storeCreate } from '@/lib/store'

export const maxDuration = 60

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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    const userId = user.id // verified session, not the form field

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const module = formData.get('module') as string
    const source = (formData.get('source') as string) || 'csv_import'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!isSafeModule(module)) return NextResponse.json({ error: 'module is required' }, { status: 400 })

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

    const importedAt = new Date().toISOString()
    const today = importedAt.split('T')[0]
    const items = rows.map((row, i) => ({
      fields: {
        'User ID': userId,
        Module: module,
        'Record Data': JSON.stringify({
          _meta: {
            importId,
            rowIndex: i,
            source,
            importedAt,
            originalHeaders: headers,
            totalColumns: headers.length,
          },
          ...row,
        }),
        Source: source,
        'Created At': today,
      },
    }))

    let successCount = 0
    let failCount = 0
    const errors: string[] = []
    try {
      successCount = (await storeCreate(userId, items)).length
    } catch (e: any) {
      successCount = e?.created || 0
      failCount = items.length - successCount
      errors.push(e?.full ? 'Your data storage is full.' : 'Saving stopped part-way.')
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
