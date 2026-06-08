import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin supabase client with service role for updating users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const event = JSON.parse(body)
    const eventType = event.type

    console.log('Webhook event:', eventType)

    if (eventType === 'subscription.active') {
      const subscription = event.data
      const customerEmail = subscription?.customer?.email
      const planName = subscription?.metadata?.plan_name

      console.log(`Subscription active: ${customerEmail} - ${planName}`)
    }

    if (eventType === 'payment.succeeded') {
      const payment = event.data
      const customerEmail = payment?.customer?.email
      console.log(`Payment succeeded: ${customerEmail}`)
    }

    if (eventType === 'subscription.on_hold') {
      const subscription = event.data
      console.log(`Subscription on hold: ${subscription?.subscription_id}`)
    }

    if (eventType === 'subscription.cancelled') {
      const subscription = event.data
      console.log(`Subscription cancelled: ${subscription?.subscription_id}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
