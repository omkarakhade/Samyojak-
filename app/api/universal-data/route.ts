import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeModule } from '@/lib/serverAuth'
import { listRecords, deleteRecord, deleteBatch } from '@/lib/recordsDb'

export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const userId = user.id // verified session, not the query string

  const { searchParams } = new URL(req.url)
  const module = searchParams.get('module')
  const importId = searchParams.get('importId')

  if (!isSafeModule(module)) {
    return NextResponse.json({ error: 'module required' }, { status: 400 })
  }

  try {
    const rows = await listRecords(userId, module)

    const all = rows.map(r => ({
      id: r.id,
      importId: r.batchId || 'manual',
      source: r.source || r.meta?.source || 'unknown',
      importedAt: r.meta?.importedAt || r.createdAt || '',
      originalHeaders: r.meta?.originalHeaders || Object.keys(r.data),
      data: r.data,
    }))

    const filtered = importId ? all.filter(r => r.importId === importId) : all

    // Columns in order of first appearance
    const columnSet = new Set<string>()
    filtered.forEach(r => (r.originalHeaders || []).forEach((h: string) => columnSet.add(h)))
    const columns = Array.from(columnSet).filter(c => c !== 'Source' && c !== '_meta')

    // Import batch summary
    const batchMap = new Map<string, any>()
    filtered.forEach(r => {
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

  try {
    // Delete one record (only if it belongs to this user)
    if (recordId) {
      const deleted = await deleteRecord(userId, recordId)
      if (!deleted) return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
      return NextResponse.json({ deleted: true })
    }

    // Delete an entire import batch
    if (importId && isSafeModule(module) && /^[A-Za-z0-9_-]{1,80}$/.test(importId)) {
      const deleted = await deleteBatch(userId, importId, module)
      return NextResponse.json({ deleted, importId })
    }
  } catch (e: any) {
    console.error('universal-data DELETE error:', e)
    return NextResponse.json({ error: 'Could not delete.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'id or importId+module required' }, { status: 400 })
}
