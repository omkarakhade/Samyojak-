import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const dodoEnv = process.env.DODO_ENV || 'live'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'

    console.log('=== DODO CHECKOUT ===')
    console.log('Product ID:', productId)
    console.log('Email:', email)
    console.log('Plan:', planName)
    console.log('Mode:', dodoEnv)
    console.log('Key exists:', !!apiKey)
    console.log('Key length:', apiKey?.length)
    console.log('Key preview:', apiKey?.substring(0, 15) + '...')

    if (!apiKey) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY missing in Vercel environment variables'
      }, { status: 500 })
    }

    if (!productId) {
      return NextResponse.json({
        error: 'No product ID'
      }, { status: 400 })
    }

    const environment = dodoEnv === 'live' ? 'live_mode' : 'test_mode'
    console.log('Dodo environment:', environment)

    const DodoModule = await import('dodopayments')
    const DodoPayments = DodoModule.default || DodoModule

    const client = new (DodoPayments as any)({
      bearerToken: apiKey,
      environment: environment,
    })

    const returnUrl = `${appUrl}/payment-success?plan=${encodeURIComponent(planName || '')}`
    console.log('Return URL:', returnUrl)

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: email || 'customer@example.com',
        name: name || 'Customer',
      },
      return_url: returnUrl,
    })

    console.log('SUCCESS - Session ID:', session.session_id)
    console.log('Checkout URL:', session.checkout_url)

    return NextResponse.json({ url: session.checkout_url })

  } catch (error: any) {
    console.error('=== DODO ERROR ===')
    console.error('Status:', error?.status)
    console.error('Message:', error?.message)
    console.error('Body:', JSON.stringify(error?.body || {}))

    let userMessage = error?.message || 'Payment failed'

    if (error?.status === 401) {
      userMessage = 'API key is wrong or from wrong mode. Check DODO_PAYMENTS_API_KEY in Vercel and make sure DODO_ENV matches your key mode (test or live)'
    }
    if (error?.status === 404) {
      userMessage = 'Product ID not found. Your products in lib/products.ts must match products in Dodo dashboard in the SAME mode (test or live)'
    }

    return NextResponse.json({
      error: userMessage,
      status: error?.status,
    }, { status: error?.status || 500 })
  }
}
