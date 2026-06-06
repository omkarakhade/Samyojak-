import { NextRequest, NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: 'test_mode',
})

export async function POST(req: NextRequest) {
  try {
    const { productId, email, name } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const session = await client.payments.create({
      billing: {
        city: '',
        country: 'IN',
        state: '',
        street: '',
        zipcode: '',
      },
      customer: {
        email: email || '',
        name: name || 'Customer',
      },
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
      payment_link: true,
    })

    return NextResponse.json({ url: (session as any).payment_link || '' })
  } catch (error: any) {
    console.error('Dodo checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
