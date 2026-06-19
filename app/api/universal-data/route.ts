import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const module = searchParams.get('module')
  const importId = searchParams.get('importId') // Optional — filter by batch

  if (!userId || !module) {
    return NextResponse.json({ error: 'userId and module required' }, { status: 400 })
  }

  try {
    let filterFormula = `AND({User ID}="${userId}",{Module}="${module}")`
    const url = `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=500&sort[0][field]=Created At&sort[0][direction]=desc`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Airtable fetch failed: ${res.status} ${err}`)
    }

    const data = await res.json()
    const records = data.records || []

    // Parse all records — get every column back out
    const parsed = records.map((r: any) => {
      try {
        const recordData = JSON.parse(r.fields?.['Record Data'] || '{}')
        const meta = recordData._meta || {}
        // Remove meta from display data
        const { _meta, ...displayData } = recordData
        return {
          id: r.id,
          importId: meta.importId || 'unknown',
          source: r.fields?.Source || meta.source || 'unknown',
          importedAt: meta.importedAt || r.fields?.['Created At'] || '',
          originalHeaders: meta.originalHeaders || Object.keys(displayData),
          data: displayData,
        }
      } catch {
        return {
          id: r.id,
          importId: 'parse_error',
          source: 'unknown',
          importedAt: '',
          originalHeaders: [],
          data: {},
        }
      }
    }).filter((r: any) => {
      if (importId) return r.importId === importId
      return true
    })

    // Get all unique columns across all records — preserving order
    const allColumnsSet = new Set<string>()
    parsed.forEach((r: any) => {
      ;(r.originalHeaders || []).forEach((h: string) => allColumnsSet.add(h))
    })
    const allColumns = Array.from(allColumnsSet)

    // Get all unique import batches
    const importBatches = Array.from(
      new Map(
        parsed.map((r: any) => [
          r.importId,
          {
            importId: r.importId,
            source: r.source,
            importedAt: r.importedAt,
            rowCount: parsed.filter((p: any) => p.importId === r.importId).length,
          }
        ])
      ).values()
    )

    return NextResponse.json({
      records: parsed,
      columns: allColumns,
      total: parsed.length,
      importBatches,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const recordId = searchParams.get('id')
  const importId = searchParams.get('importId')
  const userId = searchParams.get('userId')
  const module = searchParams.get('module')

  // Delete single record
  if (recordId) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
      return NextResponse.json({ deleted: res.ok })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Delete entire import batch
  if (importId && userId && module) {
    try {
      let filterFormula = `AND({User ID}="${userId}",{Module}="${module}")`
      const res = await fetch(
        `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=500`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      )
      const data = await res.json()
      const records = data.records || []

      const toDelete = records.filter((r: any) => {
        try {
          const parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
          return parsed._meta?.importId === importId
        } catch { return false }
      })

      let deleted = 0
      for (const r of toDelete) {
        await fetch(`https://api.airtable.com/v0/${BASE}/UserData/${r.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${TOKEN}` },
        })
        deleted++
        await new Promise(resolve => setTimeout(resolve, 210))
      }

      return NextResponse.json({ deleted, importId })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'id or importId+userId+module required' }, { status: 400 })
}
