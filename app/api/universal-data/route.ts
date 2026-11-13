import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId, isSafeModule, userOwnsRecord } from '@/lib/serverAuth'
import { storeList, storeDelete } from '@/lib/store'

export const maxDuration = 60

const fetchAllRecords = (userId: string, modules: string[]) => storeList(userId, modules, { max: 5000 })

function toRow(r: any) {
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
    return { id: r.id, importId: 'error', source: 'unknown', importedAt: '', originalHeaders: [] as string[], data: {} }
  }
}

function buildView(rows: ReturnType<typeof toRow>[], importId?: string | null) {
  const filtered = importId ? rows.filter(r => r.importId === importId) : rows

  // Columns in order of first appearance
  const columnSet = new Set<string>()
  filtered.forEach(r => (r.originalHeaders || []).forEach((h: string) => columnSet.add(h)))
  const columns = Array.from(columnSet).filter(c => c !== 'Source' && c !== '_meta')

  // Import batch summary
  const batchMap = new Map<string, any>()
  filtered.forEach(r => {
    if (!batchMap.has(r.importId)) {
      batchMap.set(r.importId, { importId: r.importId, source: r.source, importedAt: r.importedAt, rowCount: 0 })
    }
    batchMap.get(r.importId).rowCount++
  })

  return {
    records: filtered,
    columns,
    total: filtered.length,
    importBatches: Array.from(batchMap.values()),
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const userId = user.id // verified session, not the query string
  if (!isSafeId(userId)) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const importId = searchParams.get('importId')

  // ?modules=CRM,Invoices,... → many modules with ONE Airtable query
  const modulesParam = searchParams.get('modules')
  if (modulesParam) {
    const modules = Array.from(new Set(modulesParam.split(',').map(m => m.trim()).filter(Boolean))).slice(0, 10)
    if (modules.length === 0 || !modules.every(m => isSafeModule(m))) {
      return NextResponse.json({ error: 'modules invalid' }, { status: 400 })
    }
    try {
      const raw = await fetchAllRecords(userId, modules)
      const byModule: Record<string, any> = {}
      for (const m of modules) {
        const rows = raw.filter((r: any) => r.fields?.Module === m).map(toRow)
        byModule[m] = buildView(rows, null)
      }
      return NextResponse.json({ modules: byModule })
    } catch (error: any) {
      console.error('universal-data GET error:', error)
      return NextResponse.json({ error: 'Could not load your data.' }, { status: 500 })
    }
  }

  const module = searchParams.get('module')
  if (!isSafeModule(module)) {
    return NextResponse.json({ error: 'module required' }, { status: 400 })
  }

  try {
    const rows = (await fetchAllRecords(userId, [module])).map(toRow)
    return NextResponse.json(buildView(rows, importId))
  } catch (error: any) {
    console.error('universal-data GET error:', error)
    return NextResponse.json({ error: 'Could not load your data.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const userId = user.id

  const { searchParams } = new URL(req.url)
  const recordId = searchParams.get('id')
  const importId = searchParams.get('importId')
  const module = searchParams.get('module')

  // Delete single record (only if it belongs to this user)
  if (recordId) {
    if (!(await userOwnsRecord(userId, recordId))) {
      return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    }
    try {
      const deleted = await storeDelete(userId, [recordId])
      return NextResponse.json({ deleted: deleted > 0 })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Delete entire import batch
  if (importId && isSafeModule(module) && /^[A-Za-z0-9_-]{1,80}$/.test(importId)) {
    try {
      const all = await fetchAllRecords(userId, [module])
      const toDelete = all.filter((r: any) => {
        try {
          const p = JSON.parse(r.fields?.['Record Data'] || '{}')
          return p._meta?.importId === importId
        } catch { return false }
      })

      const deleted = await storeDelete(userId, toDelete.map((r: any) => r.id))
      return NextResponse.json({ deleted, importId })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'id or importId+userId+module required' }, { status: 400 })
}
