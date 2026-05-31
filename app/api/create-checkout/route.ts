import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

const PRICE_MAP: Record<string, Record<string, number>> = {
  weekly: {
    'CRM Starter': 499,
    'ERP Basic': 999,
    'Business': 1699,
    'Complete': 2199,
  },
  monthly: {
    'CRM Starter': 1500,
    'ERP Basic': 3500,
    'Business': 6000,
    'Complete': 7900,
  },
  yearly: {
    'CRM Starter': 14400,
    'ERP Basic': 33600,
    'Business': 57600,
    'Complete': 75900,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { plan, billing, email } = await req.json()

    const amount = PRICE_MAP[billing]?.[plan]
    if (!amount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Samyojak ${plan}`,
              description: `${billing} plan — includes bonus period`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak-2nxh.vercel.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://samyojak-2nxh.vercel.app'}/choose-plan`,
      metadata: { plan, billing, email },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
