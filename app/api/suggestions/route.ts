import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'
import { fetchUserRecords } from '@/lib/userData'
import { getEntitlement, moduleAllowed } from '@/lib/access'
import { noticed } from '@/lib/suggestions'
import { checkPublicLimit } from '@/lib/aiGuard'

/** "Things I noticed" for the chat home. Computed from the owner's own records, no AI call. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user || !isSafeId(user.id)) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    if (!checkPublicLimit(`suggest:${user.id}`, 30, 60_000)) {
      return NextResponse.json({ suggestions: [] })
    }
    const ent = await getEntitlement(user)
    if (!ent.ai) return NextResponse.json({ suggestions: [] })
    const modules = ['CRM', 'Invoices', 'Inventory', 'Projects', 'Timesheets', 'Assets', 'Production Jobs', 'Bills of Materials'].filter(m => moduleAllowed(ent, m))
    const data = await fetchUserRecords(user.id, modules)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    return NextResponse.json({ suggestions: noticed(data, today) })
  } catch (e: any) {
    console.error('suggestions error:', e.message)
    return NextResponse.json({ suggestions: [] })
  }
}
