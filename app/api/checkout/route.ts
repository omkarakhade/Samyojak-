import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name, planName } = await req.json()

    if (!productId || productId === 'pdt_REPLACE_WITH_DODO_ID') {
      return NextResponse.json({
        error: 'Payment coming soon',
        message: 'Contact hello@samyojak.app'
      }, { status: 400 })
    }

    const response = await fetch('https://api.dodopayments.com/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: { email, name },
        product_id: productId,
        payment_link: true,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?plan=${encodeURIComponent(planName)}`,
        metadata: { planName, email },
      }),
    })

    const data = await response.json()

    if (data.payment_link) {
      return NextResponse.json({ url: data.payment_link })
    }

    return NextResponse.json({ error: 'Could not create checkout' }, { status: 500 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
