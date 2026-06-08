import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        error: 'Payment not configured',
        message: 'Contact hello@samyojak.app'
      }, { status: 500 })
    }

    const response = await fetch('https://api.dodopayments.com/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          email: email || 'customer@example.com',
          name: name || 'Customer',
          create_new_customer: true,
        },
        product_id: productId,
        quantity: 1,
        payment_link: true,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak.vercel.app'}/payment-success?plan=${encodeURIComponent(planName || '')}`,
        metadata: {
          plan_name: planName,
          customer_email: email,
        },
      }),
    })

    const data = await response.json()
    console.log('Dodo response:', JSON.stringify(data))

    if (data.payment_link) {
      return NextResponse.json({ url: data.payment_link })
    }

    if (data.checkout_url) {
      return NextResponse.json({ url: data.checkout_url })
    }

    return NextResponse.json({
      error: 'Could not create checkout',
      details: data
    }, { status: 500 })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
