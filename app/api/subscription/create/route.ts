import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser } from '@/lib/serverAuth'
import { createSubscriptionRecord, getSubscriptionByUserId, updateSubscriptionStatus } from '@/lib/subscriptionDb'
import { setPlanLabel } from '@/lib/productLookup'
import type { PlanType, PlanTier } from '@/lib/trialLogic'

const TYPES: PlanType[] = ['weekly', 'monthly', 'yearly']
const TIERS: PlanTier[] = ['starter', 'basic', 'business', 'complete']

/** Does this user already have a subscription (trial, paid or ended)? */
export async function GET(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const sub = await getSubscriptionByUserId(user.id)
  return NextResponse.json({ exists: !!sub, status: sub?.data.subscriptionStatus || null })
}

/**
 * Start the free 14-day trial. Only the first call per account starts a trial,
 * so choosing another plan can never restart or extend it.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const planType = body.planType as PlanType
  const planTier = body.planTier as PlanTier
  if (!TYPES.includes(planType) || !TIERS.includes(planTier)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    const existing = await getSubscriptionByUserId(user.id)
    if (existing) {
      // Already has a subscription. During a running trial they may switch plan; dates stay as they are.
      if (existing.data.subscriptionStatus === 'trial' && new Date(existing.data.trialEndDate) > new Date()) {
        await updateSubscriptionStatus(user.id, { planType, planTier })
        await setPlanLabel(user.id, planTier)
        return NextResponse.json({ started: false, switched: true, status: 'trial' })
      }
      return NextResponse.json({ started: false, status: existing.data.subscriptionStatus })
    }

    const sub = await createSubscriptionRecord(user.id, user.email || '', planType, planTier)
    await setPlanLabel(user.id, planTier)
    return NextResponse.json({ started: true, status: 'trial', trialEndDate: sub.trialEndDate })
  } catch (err) {
    console.error('Create subscription error:', err)
    return NextResponse.json({ error: 'Could not start your trial' }, { status: 500 })
  }
}
