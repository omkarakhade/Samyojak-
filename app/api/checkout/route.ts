import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    console.log('Checkout starting for product:', productId)

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY missing in Vercel'
      }, { status: 500 })
    }

    const DodoPayments = (await import('dodopayments')).default

    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_ENV === 'live' ? 'live_mode' : 'test_mode',
    })

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: email || 'test@example.com',
        name: name || 'Customer',
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?plan=${encodeURIComponent(planName || '')}`,
    })

    console.log('Session created successfully:', session.session_id)
    console.log('Checkout URL:', session.checkout_url)

    return NextResponse.json({ url: session.checkout_url })

  } catch (error: any) {
    console.error('Checkout error:', error?.message)
    console.error('Error details:', JSON.stringify(error?.body || {}))
    return NextResponse.json({
      error: error?.message || 'Failed',
      body: error?.body || {}
    }, { status: 500 })
  }
}
