import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    console.log('Checkout request:', { productId, email, planName })
    console.log('API Key exists:', !!process.env.DODO_PAYMENTS_API_KEY)
    console.log('API Key prefix:', process.env.DODO_PAYMENTS_API_KEY?.slice(0, 10))

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY missing in Vercel environment variables',
      }, { status: 500 })
    }

    const DodoPayments = (await import('dodopayments')).default

    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: 'test_mode',
    })

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: email || 'test@example.com',
        name: name || 'Customer',
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'}/payment-success?plan=${encodeURIComponent(planName || '')}`,
    })

    console.log('Session created:', session.session_id, session.checkout_url)

    if (!session.checkout_url) {
      return NextResponse.json({ error: 'No checkout URL returned from Dodo' }, { status: 500 })
    }

    return NextResponse.json({ url: session.checkout_url })

  } catch (error: any) {
    console.error('Full checkout error:', error)
    return NextResponse.json({
      error: error?.message || 'Unknown error',
      stack: error?.stack?.slice(0, 300),
    }, { status: 500 })
  }
}
