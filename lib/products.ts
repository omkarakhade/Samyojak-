// Replace product IDs after creating in Dodo Dashboard
// India pricing shown to users from India
// Global pricing shown to everyone else

export type BillingPeriod = 'weekly' | 'monthly' | 'yearly'

export interface Product {
  name: string
  product_id_india: string
  product_id_global: string
  price_india: number
  price_global: number
  display_price_india: string
  display_price_global: string
  period: string
  bonus: string
  features: string[]
  emoji: string
  popular?: boolean
}

export const PRODUCTS: Record<BillingPeriod, Product[]> = {
  weekly: [
    {
      name: 'CRM Starter',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 199,
      price_global: 499,
      display_price_india: '$1.99',
      display_price_global: '$4.99',
      period: 'wk',
      bonus: '+1 week free',
      features: ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'],
      emoji: '🌱',
    },
    {
      name: 'ERP Basic',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 399,
      price_global: 999,
      display_price_india: '$3.99',
      display_price_global: '$9.99',
      period: 'wk',
      bonus: '+1 week free',
      features: ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'],
      emoji: '⚡',
    },
    {
      name: 'Business',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 699,
      price_global: 1699,
      display_price_india: '$6.99',
      display_price_global: '$16.99',
      period: 'wk',
      bonus: '+1 week free',
      features: ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'],
      emoji: '🚀',
      popular: true,
    },
    {
      name: 'Complete',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 899,
      price_global: 2199,
      display_price_india: '$8.99',
      display_price_global: '$21.99',
      period: 'wk',
      bonus: '+1 week free',
      features: ['Everything', 'AI features', 'Unlimited users', 'API access'],
      emoji: '💎',
    },
  ],
  monthly: [
    {
      name: 'CRM Starter',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 500,
      price_global: 1500,
      display_price_india: '$5',
      display_price_global: '$15',
      period: 'mo',
      bonus: '+1 month free',
      features: ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'],
      emoji: '🌱',
    },
    {
      name: 'ERP Basic',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 1200,
      price_global: 3500,
      display_price_india: '$12',
      display_price_global: '$35',
      period: 'mo',
      bonus: '+1 month free',
      features: ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'],
      emoji: '⚡',
    },
    {
      name: 'Business',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 2000,
      price_global: 6000,
      display_price_india: '$20',
      display_price_global: '$60',
      period: 'mo',
      bonus: '+1 month free',
      features: ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'],
      emoji: '🚀',
      popular: true,
    },
    {
      name: 'Complete',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 2500,
      price_global: 7900,
      display_price_india: '$25',
      display_price_global: '$79',
      period: 'mo',
      bonus: '+1 month free',
      features: ['Everything', 'AI features', 'Unlimited users', 'API access'],
      emoji: '💎',
    },
  ],
  yearly: [
    {
      name: 'CRM Starter',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 4800,
      price_global: 14400,
      display_price_india: '$48',
      display_price_global: '$144',
      period: 'yr',
      bonus: '+2 months free',
      features: ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'],
      emoji: '🌱',
    },
    {
      name: 'ERP Basic',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 10800,
      price_global: 33600,
      display_price_india: '$108',
      display_price_global: '$336',
      period: 'yr',
      bonus: '+2 months free',
      features: ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'],
      emoji: '⚡',
    },
    {
      name: 'Business',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 19200,
      price_global: 57600,
      display_price_india: '$192',
      display_price_global: '$576',
      period: 'yr',
      bonus: '+3 months free',
      features: ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'],
      emoji: '🚀',
      popular: true,
    },
    {
      name: 'Complete',
      product_id_india: 'pdt_REPLACE_WITH_DODO_ID',
      product_id_global: 'pdt_REPLACE_WITH_DODO_ID',
      price_india: 24000,
      price_global: 75900,
      display_price_india: '$240',
      display_price_global: '$759',
      period: 'yr',
      bonus: '+3 months free',
      features: ['Everything', 'AI features', 'Unlimited users', 'API access'],
      emoji: '💎',
    },
  ],
}
