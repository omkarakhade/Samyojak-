import { NextRequest, NextResponse, after } from 'next/server'
import crypto from 'crypto'
import { createSubscriptionRecord, getSubscriptionByUserId, updateSubscriptionStatus } from '@/lib/subscriptionDb'
import { migrateTrialData } from '@/lib/trialData'
import { setPlanLabel } from '@/lib/productLookup'
import { isSafeId } from '@/lib/serverAuth'
import type { PlanTier, PlanType } from '@/lib/trialLogic'

export const maxDuration = 60

const TIERS: PlanTier[] = ['starter', 'basic', 'business', 'complete']
const TYPES: PlanType[] = ['weekly', 'monthly', 'yearly']

/**
 * Check Dodo's signature (Standard Webhooks): HMAC-SHA256 over "<id>.<timestamp>.<raw body>".
 * Without this, anyone could POST a fake "payment succeeded" and unlock an account for free.
 */
function signatureValid(rawBody: string, req: NextRequest): boolean {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
  if (!secret) return false
  const id = req.headers.get('webhook-id')
  const timestamp = req.headers.get('webhook-timestamp')
  const header = req.headers.get('webhook-signature')
  if (!id || !timestamp || !header) return false

  const ts = parseInt(timestamp, 10)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 5 * 60) return false

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest()

  return header.split(' ').some(part => {
    const [version, sig] = part.split(',')
    if (version !== 'v1' || !sig) return false
    const given = Buffer.from(sig, 'base64')
    return given.length === expected.length && crypto.timingSafeEqual(given, expected)
  })
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    if (!signatureValid(rawBody, req)) {
      console.error('Dodo webhook: signature check failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventType: string = payload.type || payload.event_type || ''
    if (eventType !== 'payment.succeeded' && eventType !== 'subscription.active') {
      return NextResponse.json({ received: true, ignored: true })
    }

    const data = payload.data || payload
    const metadata = data.metadata || {}
    const userId = metadata.userId
    if (!isSafeId(userId)) {
      console.error('Dodo webhook: no usable userId in metadata for event', eventType)
      return NextResponse.json({ received: true, ignored: 'no userId' }) // 200 so Dodo stops retrying
    }

    const planTier: PlanTier | null = TIERS.includes(metadata.planTier) ? metadata.planTier : null
    const planType: PlanType | null = TYPES.includes(metadata.planType) ? metadata.planType : null
    const paymentId: string | undefined = data.payment_id || data.subscription_id || payload.id
    const dodoSubscriptionId: string | undefined = data.subscription_id || undefined

    let sub = await getSubscriptionByUserId(userId)
    if (!sub) {
      // Paid without a trial first: create the record now
      await createSubscriptionRecord(userId, data.customer?.email || '', planType || 'monthly', planTier || 'starter')
    }

    await updateSubscriptionStatus(userId, {
      subscriptionStatus: 'active',
      paymentCompletedAt: new Date().toISOString(),
      lastPaymentId: paymentId,
      dodoSubscriptionId,
      ...(planTier ? { planTier } : {}),
      ...(planType ? { planType } : {}),
    })
    if (planTier) await setPlanLabel(userId, planTier)

    // Move trial data to Airtable after replying. The daily job finishes it if it runs long.
    after(async () => {
      try { await migrateTrialData(userId) } catch (e) { console.error('trial data move failed:', e) }
    })

    return NextResponse.json({ received: true, unlocked: true })
  } catch (err) {
    console.error('Dodo webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
