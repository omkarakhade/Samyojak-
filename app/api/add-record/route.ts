import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeModule } from '@/lib/serverAuth'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

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

    const importId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

    const payload = {
      fields: {
        'User ID': userId,
        'Module': module,
        'Record Data': JSON.stringify({
          _meta: {
            importId,
            rowIndex: 0,
            source: 'manual_entry',
            importedAt: new Date().toISOString(),
            originalHeaders: Object.keys(record),
            totalColumns: Object.keys(record).length,
          },
          ...record,
        }),
        'Source': 'manual_entry',
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
      throw new Error(`Airtable error ${res.status}: ${err}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, id: data.id })
  } catch (error: any) {
    console.error('add-record error:', error)
    return NextResponse.json({ error: 'Could not save the record.' }, { status: 500 })
  }
}
