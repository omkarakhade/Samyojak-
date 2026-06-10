import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    console.log('=== CHECKOUT START ===')
    console.log('Product ID:', productId)
    console.log('Email:', email)
    console.log('Plan:', planName)
    console.log('Dodo ENV:', process.env.DODO_ENV)
    console.log('API Key exists:', !!process.env.DODO_PAYMENTS_API_KEY)

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY not found in environment variables. Add it in Vercel Settings.'
      }, { status: 500 })
    }

    const environment = process.env.DODO_ENV === 'live' ? 'live_mode' : 'test_mode'
    console.log('Using environment:', environment)

    const DodoPayments = (await import('dodopayments')).default
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: environment,
    })

    console.log('Creating checkout session...')

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
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'}/payment-success?plan=${encodeURIComponent(planName || '')}`,
    })

    console.log('Session ID:', session.session_id)
    console.log('Checkout URL:', session.checkout_url)
    console.log('=== CHECKOUT SUCCESS ===')

    if (!session.checkout_url) {
      return NextResponse.json({
        error: 'Dodo returned no checkout URL. Check your API key and product IDs.'
      }, { status: 500 })
    }

    return NextResponse.json({ url: session.checkout_url })

  } catch (error: any) {
    console.error('=== CHECKOUT ERROR ===')
    console.error('Message:', error?.message)
    console.error('Status:', error?.status)
    console.error('Body:', JSON.stringify(error?.body || {}))

    return NextResponse.json({
      error: error?.message || 'Checkout failed',
      details: error?.body || {},
      hint: 'Check Vercel function logs for full error details'
    }, { status: 500 })
  }
}
