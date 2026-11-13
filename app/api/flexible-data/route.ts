import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeModule, userOwnsRecord } from '@/lib/serverAuth'
import { storeList, storeDelete } from '@/lib/store'

export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  const userId = user.id

  const { searchParams } = new URL(req.url)
  const module = searchParams.get('module')

  if (!isSafeModule(module)) {
    return NextResponse.json({ error: 'module required' }, { status: 400 })
  }

  try {
    const data = { records: await storeList(userId, [module], { max: 500 }) }

    const records = (data.records || []).map((r: any) => {
      try {
        return {
          id: r.id,
          source: r.fields?.Source || 'manual',
          createdAt: r.fields?.['Created At'] || '',
          data: JSON.parse(r.fields?.['Record Data'] || '{}')
        }
      } catch {
        return { id: r.id, data: {}, source: 'unknown', createdAt: '' }
      }
    })

    // Get all unique column names from this user's data
    const allColumns = new Set<string>()
    records.forEach((r: any) => {
      Object.keys(r.data).forEach(k => allColumns.add(k))
    })

    return NextResponse.json({
      records,
      columns: Array.from(allColumns),
      total: records.length
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const recordId = searchParams.get('id')

  if (!recordId) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (!(await userOwnsRecord(user.id, recordId))) {
    return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
  }

  try {
    const deleted = await storeDelete(user.id, [recordId])
    return NextResponse.json({ deleted: deleted > 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
