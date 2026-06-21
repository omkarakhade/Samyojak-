import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

async function fetchAllRecords(userId: string, module: string): Promise<any[]> {
  const all: any[] = []
  let offset: string | undefined = undefined

  // Airtable returns max 100 records per page — loop through all pages
  do {
    const params = new URLSearchParams()
    params.set('filterByFormula', `AND({User ID}="${userId}",{Module}="${module}")`)
    params.set('pageSize', '100')
    if (offset) params.set('offset', offset)

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE}/UserData?${params.toString()}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Airtable error ${res.status}: ${err}`)
    }

    const data = await res.json()
    all.push(...(data.records || []))
    offset = data.offset // undefined when no more pages
  } while (offset)

  return all
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const module = searchParams.get('module')
  const importId = searchParams.get('importId')

  if (!userId || !module) {
    return NextResponse.json({ error: 'userId and module required' }, { status: 400 })
  }

  try {
    const rawRecords = await fetchAllRecords(userId, module)

    const records = rawRecords.map((r: any) => {
      try {
        const parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
        const { _meta, ...displayData } = parsed
        return {
          id: r.id,
          importId: _meta?.importId || 'manual',
          source: r.fields?.Source || _meta?.source || 'unknown',
          importedAt: _meta?.importedAt || r.fields?.['Created At'] || '',
          originalHeaders: _meta?.originalHeaders || Object.keys(displayData),
          data: displayData,
        }
      } catch {
        return {
          id: r.id,
          importId: 'error',
          source: 'unknown',
          importedAt: '',
          originalHeaders: [],
          data: {},
        }
      }
    })

    // Filter by importId if requested
    const filtered = importId
      ? records.filter((r: any) => r.importId === importId)
      : records

    // Build column list preserving order of first appearance
    const allColumnsSet = new Set<string>()
    filtered.forEach((r: any) => {
      ;(r.originalHeaders || []).forEach((h: string) => allColumnsSet.add(h))
    })
    const columns = Array.from(allColumnsSet).filter(c => c !== 'Source' && c !== '_meta')

    // Build import batch summary
    const batchMap = new Map<string, any>()
    filtered.forEach((r: any) => {
      if (!batchMap.has(r.importId)) {
        batchMap.set(r.importId, {
          importId: r.importId,
          source: r.source,
          importedAt: r.importedAt,
          rowCount: 0,
        })
      }
      batchMap.get(r.importId).rowCount++
    })

    return NextResponse.json({
      records: filtered,
      columns,
      total: filtered.length,
      importBatches: Array.from(batchMap.values()),
    })
  } catch (error: any) {
    console.error('universal-data GET error:', error)
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
      const all = await fetchAllRecords(userId, module)
      const toDelete = all.filter((r: any) => {
        try {
          const p = JSON.parse(r.fields?.['Record Data'] || '{}')
          return p._meta?.importId === importId
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
