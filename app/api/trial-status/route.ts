import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getSubscriptionByUserId } from '@/lib/subscriptionDb'
import { getTrialStatus } from '@/lib/trialLogic'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ isLocked: true, status: 'no_session' }, { status: 401 })
  }

  // Admin and demo accounts are never locked
  if (session.user.email === ADMIN_EMAIL || session.user.user_metadata?.is_demo) {
    return NextResponse.json({
      isLocked: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      status: 'active',
      message: 'Admin access',
      showBanner: false,
    })
  }

  const subRecord = await getSubscriptionByUserId(session.user.id)
  const trialStatus = getTrialStatus(subRecord?.data)

  return NextResponse.json(trialStatus)
}
