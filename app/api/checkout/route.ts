import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser } from '@/lib/serverAuth'
import { findProduct } from '@/lib/productLookup'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    }

    const { productId, name } = await req.json()
    // The plan comes from OUR price list, never from what the browser says it is buying.
    const product = typeof productId === 'string' ? findProduct(productId) : null
    if (!product) {
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const dodoEnv = process.env.DODO_ENV || 'live'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.samyojak-erp.com'

    if (!apiKey) {
      return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 500 })
    }

    const environment = dodoEnv === 'live' ? 'live_mode' : 'test_mode'

    const DodoModule = await import('dodopayments')
    const DodoPayments = DodoModule.default || DodoModule

    const client = new (DodoPayments as any)({
      bearerToken: apiKey,
      environment: environment,
    })

    const returnUrl = `${appUrl}/payment-success?plan=${encodeURIComponent(product.name)}`

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email || 'customer@example.com',
        name: typeof name === 'string' && name ? name.slice(0, 100) : 'Customer',
      },
      return_url: returnUrl,
      metadata: {
        userId: user.id,
        planTier: product.tier,
        planType: product.period,
      },
    })


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
