import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeModule } from '@/lib/serverAuth'
import { storeCreate } from '@/lib/store'
import { lockedModules, lockedText } from '@/lib/access'
import { deductStock, restoreStock, formatDeducted, describeStock } from '@/lib/stockSync'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    const userId = user.id // from the verified session, never from the body

    const body = await req.json()
    const { module } = body
    let record = body.record

    if (!isSafeModule(module) || !record || typeof record !== 'object' || Array.isArray(record)) {
      return NextResponse.json({ error: 'module and record are required' }, { status: 400 })
    }

    const locked = await lockedModules(user, [module])
    if (locked.length) return NextResponse.json({ error: lockedText(locked[0]) }, { status: 403 })

    // A new invoice with items takes them off Inventory (unless the owner switched that off).
    // 'Stock Deducted' is only ever written here, so a value sent by the browser is dropped.
    let deductedText = ''
    let stockNotes: string[] = []
    if (module === 'Invoices') {
      const { 'Stock Deducted': _ignored, ...rest } = record as Record<string, any>
      record = rest
      if (body.deductStock !== false && typeof rest['Line Items'] === 'string' && rest['Line Items'].trim()) {
        try {
          const result = await deductStock(userId, rest['Line Items'])
          deductedText = formatDeducted(result)
          stockNotes = describeStock(result)
          if (deductedText) record = { ...rest, 'Stock Deducted': deductedText }
        } catch (e: any) {
          console.error('stock deduct failed:', e?.message)
          stockNotes = ['The invoice was saved, but I could not update stock. Please check Inventory.']
        }
      }
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

    let id: string
    try {
      ;[id] = await storeCreate(userId, [payload])
    } catch (e) {
      // The invoice was not saved, so give the stock back.
      if (deductedText) await restoreStock(userId, deductedText).catch(() => {})
      throw e
    }
    return NextResponse.json({ success: true, id, stockNotes })
  } catch (error: any) {
    console.error('add-record error:', error)
    return NextResponse.json({ error: 'Could not save the record.' }, { status: 500 })
  }
}
