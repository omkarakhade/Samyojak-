import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, email, name, planName } = body

    // Log everything for debugging
    console.log('=== CHECKOUT DEBUG ===')
    console.log('productId:', productId)
    console.log('email:', email)
    console.log('planName:', planName)
    console.log('DODO_ENV:', process.env.DODO_ENV)
    console.log('API Key length:', process.env.DODO_PAYMENTS_API_KEY?.length)
    console.log('APP URL:', process.env.NEXT_PUBLIC_APP_URL)

    if (!productId) {
      return NextResponse.json({ error: 'No product ID provided' }, { status: 400 })
    }

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY not set in Vercel environment variables'
      }, { status: 500 })
    }

    const isDodoPkg = await import('dodopayments')
    const DodoPayments = isDodoPkg.default || isDodoPkg
    
    const environment = process.env.DODO_ENV === 'live' ? 'live_mode' : 'test_mode'
    console.log('Using environment:', environment)

    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: environment,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'
    const returnUrl = `${appUrl}/payment-success?plan=${encodeURIComponent(planName || 'CRM Starter')}`

    console.log('Return URL:', returnUrl)
    console.log('Creating session...')

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

    console.log('Session response:', JSON.stringify(session))
    console.log('checkout_url:', session.checkout_url)
    console.log('session_id:', session.session_id)

    if (session.checkout_url) {
      return NextResponse.json({
        url: session.checkout_url,
        session_id: session.session_id
      })
    }

    return NextResponse.json({
      error: 'Dodo did not return a checkout URL',
      session: JSON.stringify(session)
    }, { status: 500 })

  } catch (error: any) {
    console.error('=== CHECKOUT ERROR ===')
    console.error('Type:', error?.constructor?.name)
    console.error('Message:', error?.message)
    console.error('Status:', error?.status)
    console.error('Body:', JSON.stringify(error?.body || error?.response || {}))

    return NextResponse.json({
      error: error?.message || 'Unknown checkout error',
      status: error?.status,
      body: error?.body || {}
    }, { status: 500 })
  }
}
