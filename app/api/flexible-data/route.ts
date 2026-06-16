import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const module = searchParams.get('module')

  if (!userId || !module) {
    return NextResponse.json({ error: 'userId and module required' }, { status: 400 })
  }

  try {
    const filterFormula = `AND({User ID}="${userId}",{Module}="${module}")`
    const url = `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=500`

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Airtable error ${res.status}: ${err}`)
    }

    const data = await res.json()
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
  const { searchParams } = new URL(req.url)
  const recordId = searchParams.get('id')

  if (!recordId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData/${recordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
    return NextResponse.json({ deleted: res.ok })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
