import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isSafeId } from '@/lib/serverAuth'
import { fetchUserRecords } from '@/lib/userData'
import { computeSummary } from '@/lib/insights'

/** Live numbers for the side panel next to the chat. One Airtable query. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user || !isSafeId(user.id)) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }
    const data = await fetchUserRecords(user.id, ['CRM', 'Invoices', 'Inventory'])
    return NextResponse.json(computeSummary(data))
  } catch (e: any) {
    console.error('summary error:', e.message)
    return NextResponse.json({ error: 'Could not load numbers.' }, { status: 500 })
  }
}
