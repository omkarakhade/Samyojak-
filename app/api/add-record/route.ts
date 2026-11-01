import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeModule } from '@/lib/serverAuth'
import { insertRecords } from '@/lib/recordsDb'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    const userId = user.id // from the verified session, never from the body

    const { module, record } = await req.json()

    if (!isSafeModule(module) || !record || typeof record !== 'object' || Array.isArray(record)) {
      return NextResponse.json({ error: 'module and record are required' }, { status: 400 })
    }

    // Keep keys/values tidy: no internal keys, bounded size
    const data: Record<string, any> = {}
    for (const [k, v] of Object.entries(record)) {
      const key = String(k).trim().slice(0, 60)
      if (!key || key.startsWith('_')) continue
      if (typeof v === 'number' || typeof v === 'boolean') data[key] = v
      else if (typeof v === 'string') data[key] = v.slice(0, 2000)
      if (Object.keys(data).length >= 40) break
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'The record is empty.' }, { status: 400 })
    }

    await insertRecords(userId, [
      {
        module,
        data,
        source: 'manual_entry',
        batchId: null, // grouped together under "Added by hand"
        meta: {
          source: 'manual_entry',
          importedAt: new Date().toISOString(),
          originalHeaders: Object.keys(data),
          totalColumns: Object.keys(data).length,
        },
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('add-record error:', error)
    return NextResponse.json({ error: 'Could not save the record.' }, { status: 500 })
  }
}
