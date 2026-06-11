import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const dodoEnv = process.env.DODO_ENV || 'test'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'

    // Full debug log
    console.log('=== CHECKOUT START ===')
    console.log('Product ID:', productId)
    console.log('Email:', email)
    console.log('Plan:', planName)
    console.log('DODO_ENV:', dodoEnv)
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    console.log('API Key first 10 chars:', apiKey?.substring(0, 10))

    if (!apiKey) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY is missing from Vercel environment variables. Go to Vercel → Settings → Environment Variables and add it.'
      }, { status: 500 })
    }

    if (!productId) {
      return NextResponse.json({
        error: 'No product ID provided'
      }, { status: 400 })
    }

    // Import Dodo SDK exactly as their docs show
    const DodoPayments = (await import('dodopayments')).default

    const environment = dodoEnv === 'live' ? 'live_mode' : 'test_mode'
    console.log('Using environment:', environment)

    const client = new DodoPayments({
      bearerToken: apiKey,
      environment: environment,
    })

    const returnUrl = `${appUrl}/payment-success?plan=${encodeURIComponent(planName || 'Plan')}`
    console.log('Return URL:', returnUrl)

    // Exact code from Dodo official docs
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        }
      ],
      customer: {
        email: email || 'customer@example.com',
        name: name || 'Customer',
      },
      return_url: returnUrl,
    })

    console.log('Session created!')
    console.log('Session ID:', session.session_id)
    console.log('Checkout URL:', session.checkout_url)
    console.log('=== CHECKOUT SUCCESS ===')

    if (session.checkout_url) {
      return NextResponse.json({
        url: session.checkout_url,
        session_id: session.session_id,
      })
    }

    return NextResponse.json({
      error: 'Dodo returned no checkout URL. Check your product IDs in Dodo dashboard.'
    }, { status: 500 })

  } catch (error: any) {
    console.error('=== CHECKOUT FAILED ===')
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error status:', error?.status)
    console.error('Error body:', JSON.stringify(error?.body || {}))
    console.error('Full error:', JSON.stringify(error, null, 2))

    // Specific error messages to help debug
    if (error?.status === 401) {
      return NextResponse.json({
        error: '401 Unauthorized — Your Dodo API key is wrong or from wrong mode. Go to Dodo dashboard → Developer → API Keys → create new key → paste in Vercel DODO_PAYMENTS_API_KEY'
      }, { status: 401 })
    }

    if (error?.status === 404) {
      return NextResponse.json({
        error: '404 Not Found — Product ID does not exist in your Dodo dashboard. Check that your product IDs in lib/products.ts match products in Dodo dashboard.'
      }, { status: 404 })
    }

    if (error?.status === 422) {
      return NextResponse.json({
        error: '422 Validation Error — Check product ID format and customer email.'
      }, { status: 422 })
    }

    return NextResponse.json({
      error: error?.message || 'Unknown checkout error',
      status: error?.status,
      details: error?.body || {}
    }, { status: 500 })
  }
}
