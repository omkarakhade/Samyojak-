import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const env = process.env.DODO_ENV || 'test'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'

    // Debug info
    console.log('productId:', productId)
    console.log('env:', env)
    console.log('apiKey first 8 chars:', apiKey?.slice(0, 8))
    console.log('apiKey length:', apiKey?.length)

    if (!apiKey) {
      return NextResponse.json({
        error: 'DODO_PAYMENTS_API_KEY is missing from Vercel environment variables'
      }, { status: 500 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Direct API call — no SDK to avoid import issues
    const baseUrl = env === 'live'
      ? 'https://api.dodopayments.com'
      : 'https://test.dodopayments.com'

    const response = await fetch(`${baseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          }
        ],
        customer: {
          email: email || 'customer@samyojak.app',
          name: name || 'Customer',
        },
        return_url: `${appUrl}/payment-success?plan=${encodeURIComponent(planName || '')}`,
      }),
    })

    const responseText = await response.text()
    console.log('Dodo status:', response.status)
    console.log('Dodo response:', responseText)

    if (!response.ok) {
      return NextResponse.json({
        error: `Dodo API error ${response.status}: ${responseText}`,
      }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    console.log('checkout_url:', data.checkout_url)

    if (data.checkout_url) {
      return NextResponse.json({ url: data.checkout_url })
    }

    return NextResponse.json({
      error: 'No checkout URL returned',
      data: data
    }, { status: 500 })

  } catch (error: any) {
    console.error('Checkout error:', error.message)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
