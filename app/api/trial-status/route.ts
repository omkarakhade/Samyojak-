import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getSubscriptionByUserId } from '@/lib/subscriptionDb'
import { getTrialStatus } from '@/lib/trialLogic'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ isLocked: true, status: 'no_session' }, { status: 401 })
  }

  const subRecord = await getSubscriptionByUserId(session.user.id)
  const trialStatus = getTrialStatus(subRecord?.data)

  return NextResponse.json(trialStatus)
}
