import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser } from '@/lib/serverAuth'
import { canUseAI } from '@/lib/access'

/** Tells the app what this user may use. Decided on the server from the subscriptions table. */
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  return NextResponse.json({ ai: await canUseAI(user) })
}
