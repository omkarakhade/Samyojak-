import { createNextRouteHandler } from '@dodopayments/nextjs'

export const { GET, POST } = createNextRouteHandler({
  apiKey: process.env.DODO_PAYMENTS_API_KEY || '',
  webhookSecret: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || '',
  environment: 'test_mode',
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
  onPaymentSuccess: async (payload) => {
    console.log('Payment success:', payload)
  },
  onSubscriptionCreated: async (payload) => {
    console.log('Subscription created:', payload)
  },
})
