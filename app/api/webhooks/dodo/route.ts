import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionByUserId, updateSubscriptionStatus } from '@/lib/subscriptionDb'

// NOTE: Confirm exact field names against Dodo's actual webhook payload
// (Dodo Dashboard → Webhooks → Event Log) and adjust the extraction lines below.

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const eventType = payload.type || payload.event_type
    const isPaymentSuccess = eventType === 'payment.succeeded' || eventType === 'subscription.active'

    if (!isPaymentSuccess) {
      return NextResponse.json({ received: true, ignored: true })
    }

    const userId = payload.metadata?.userId || payload.customer?.metadata?.userId
    const paymentId = payload.id || payload.payment_id
    const dodoSubscriptionId = payload.subscription_id || null

    if (!userId) {
      console.error('Dodo webhook: no userId in metadata', payload)
      return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 })
    }

    const subRecord = await getSubscriptionByUserId(userId)
    if (!subRecord) {
      console.error('Dodo webhook: no subscription record found for user', userId)
      return NextResponse.json({ error: 'Subscription record not found' }, { status: 404 })
    }

    await updateSubscriptionStatus(userId, {
      subscriptionStatus: 'active',
      paymentCompletedAt: new Date().toISOString(),
      lastPaymentId: paymentId,
      dodoSubscriptionId: dodoSubscriptionId || undefined,
    })

    return NextResponse.json({ received: true, unlocked: true })
  } catch (err) {
    console.error('Dodo webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
