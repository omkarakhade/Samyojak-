import { NextRequest, NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: 'test_mode',  // change from live_mode
})

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: email || 'customer@example.com',
        name: name || 'Customer',
        create_new_customer: true,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'}/payment-success?plan=${encodeURIComponent(planName || '')}`,
    })

    console.log('Dodo session created:', session.session_id)

    return NextResponse.json({ url: session.checkout_url })

  } catch (error: any) {
    console.error('Checkout error:', error?.message || error)
    return NextResponse.json({
      error: error?.message || 'Checkout failed',
    }, { status: 500 })
  }
}
