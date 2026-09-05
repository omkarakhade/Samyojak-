import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createSubscriptionRecord } from '@/lib/subscriptionDb'
import type { PlanType, PlanTier } from '@/lib/trialLogic'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { planType, planTier } = body as { planType: PlanType; planTier: PlanTier }

  if (!planType || !planTier) {
    return NextResponse.json({ error: 'planType and planTier are required' }, { status: 400 })
  }

  try {
    const subData = await createSubscriptionRecord(
      session.user.id,
      session.user.email || '',
      planType,
      planTier
    )
    return NextResponse.json({ success: true, subscription: subData })
  } catch (err) {
    console.error('Create subscription error:', err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
