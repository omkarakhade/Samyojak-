import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('webhook-signature') || ''
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || ''

    // Log webhook for debugging
    console.log('Webhook received:', body.slice(0, 200))

    const event = JSON.parse(body)
    const eventType = event.type || event.event_type

    if (eventType === 'subscription.created' || eventType === 'payment.succeeded') {
      const customerEmail = event.data?.customer?.email || event.customer?.email
      const planName = event.data?.metadata?.plan_name || event.metadata?.plan_name

      console.log(`Payment success: ${customerEmail} - ${planName}`)
      // Plan is saved on payment-success page via Supabase updateUser
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
