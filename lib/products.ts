export type BillingPeriod = 'weekly' | 'monthly' | 'yearly'
export type Region = 'india' | 'global' | 'western'
export type PlanName = 'CRM Starter' | 'ERP Basic' | 'Business' | 'Complete'

export interface Product {
  name: PlanName
  product_id: string
  price: number
  display_price: string
  period: string
  bonus: string
  features: string[]
  emoji: string
  popular?: boolean
  lockedModules: string[]
  unlockedModules: string[]
}

export function detectRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'india'
    const western = [
      'America/', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
      'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels',
      'Europe/Vienna', 'Europe/Zurich', 'Europe/Stockholm', 'Europe/Oslo',
      'Europe/Copenhagen', 'Europe/Helsinki', 'Europe/Dublin', 'Europe/Lisbon',
      'Europe/Warsaw', 'Europe/Prague', 'Australia/', 'Pacific/Auckland',
    ]
    if (western.some(z => tz.startsWith(z))) return 'western'
    return 'global'
  } catch {
    return 'global'
  }
}

export const MODULE_ACCESS: Record<PlanName, string[]> = {
  'CRM Starter': ['dashboard', 'crm'],
  'ERP Basic': ['dashboard', 'crm', 'invoices', 'inventory'],
  'Business': ['dashboard', 'crm', 'invoices', 'inventory', 'hr', 'projects', 'reports'],
  'Complete': ['dashboard', 'crm', 'invoices', 'inventory', 'hr', 'projects', 'reports', 'ai', 'settings', 'referral', 'admin'],
}

const LOCKED_BY_PLAN: Record<PlanName, string[]> = {
  'CRM Starter': ['invoices', 'inventory', 'hr', 'projects', 'reports'],
  'ERP Basic': ['hr', 'projects', 'reports'],
  'Business': [],
  'Complete': [],
}

type RegionProducts = Record<Region, Record<BillingPeriod, Product[]>>

export const PRODUCTS: RegionProducts = {
  india: {
    weekly: [
      {
        name: 'CRM Starter',
        product_id: 'pdt_0NgWF7Sj0uJ5wU4v3Z6p7',
        price: 499,
        display_price: '$4.99',
        period: 'wk',
        bonus: '+1 week free',
        features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'],
        emoji: '🌱',
        unlockedModules: MODULE_ACCESS['CRM Starter'],
        lockedModules: LOCKED_BY_PLAN['CRM Starter'],
      },
      {
        name: 'ERP Basic',
        product_id: 'pdt_0NgWFy7VKeUnEBDkYtWEO',
        price: 999,
        display_price: '$9.99',
        period: 'wk',
        bonus: '+1 week free',
        features: ['CRM + Inventory', 'GST Invoicing', 'QR Codes', 'Up to 10 users'],
        emoji: '⚡',
        unlockedModules: MODULE_ACCESS['ERP Basic'],
        lockedModules: LOCKED_BY_PLAN['ERP Basic'],
      },
      {
        name: 'Business',
        product_id: 'pdt_0NgWGSaemCbOLtLVphwGT',
        price: 1699,
        display_price: '$16.99',
        period: 'wk',
        bonus: '+1 week free',
        features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'],
        emoji: '🚀',
        popular: true,
        unlockedModules: MODULE_ACCESS['Business'],
        lockedModules: LOCKED_BY_PLAN['Business'],
      },
      {
        name: 'Complete',
        product_id: 'pdt_0NgWGuJ1XQKt86P39P1m6',
        price: 2199,
        display_price: '$21.99',
        period: 'wk',
        bonus: '+1 week free',
        features: ['Everything', 'AI Features', 'Unlimited users', 'API access'],
        emoji: '💎',
        unlockedModules: MODULE_ACCESS['Complete'],
        lockedModules: [],
      },
    ],
    monthly: [
      {
        name: 'CRM Starter',
        product_id: 'pdt_0NgWHMOLaKfru53Ve20Kl',
        price: 1500,
        display_price: '$15',
        period: 'mo',
        bonus: '+1 month free',
        features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'],
        emoji: '🌱',
        unlockedModules: MODULE_ACCESS['CRM Starter'],
        lockedModules: LOCKED_BY_PLAN['CRM Starter'],
      },
      {
        name: 'ERP Basic',
        product_id: 'pdt_0NgWHkH4NwIDcq1ZjZrAA',
        price: 3500,
        display_price: '$35',
        period: 'mo',
        bonus: '+1 month free',
        features: ['CRM + Inventory', 'GST Invoicing', 'QR Codes', 'Up to 10 users'],
        emoji: '⚡',
        unlockedModules: MODULE_ACCESS['ERP Basic'],
        lockedModules: LOCKED_BY_PLAN['ERP Basic'],
      },
      {
        name: 'Business',
        product_id: 'pdt_0NgWI6Zw1jfHfw37i6kFE',
        price: 6000,
        display_price: '$60',
        period: 'mo',
        bonus: '+1 month free',
        features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'],
        emoji: '🚀',
        popular: true,
        unlockedModules: MODULE_ACCESS['Business'],
        lockedModules: LOCKED_BY_PLAN['Business'],
      },
      {
        name: 'Complete',
        product_id: 'pdt_0NgWIR6Jp87dbkPPJfIns',
        price: 7900,
        display_price: '$79',
        period: 'mo',
        bonus: '+1 month free',
        features: ['Everything', 'AI Features', 'Unlimited users', 'API access'],
        emoji: '💎',
        unlockedModules: MODULE_ACCESS['Complete'],
        lockedModules: [],
      },
    ],
    yearly: [
      {
        name: 'CRM Starter',
        product_id: 'pdt_0NgWIoleMvpyc6xJT61Od',
        price: 14400,
        display_price: '$144',
        period: 'yr',
        bonus: '+2 months free',
        features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'],
        emoji: '🌱',
        unlockedModules: MODULE_ACCESS['CRM Starter'],
        lockedModules: LOCKED_BY_PLAN['CRM Starter'],
      },
      {
        name: 'ERP Basic',
        product_id: 'pdt_0NgWJBLBUwH5yBDFR9QB4',
        price: 33600,
        display_price: '$336',
        period: 'yr',
        bonus: '+2 months free',
        features: ['CRM + Inventory', 'GST Invoicing', 'QR Codes', 'Up to 10 users'],
        emoji: '⚡',
        unlockedModules: MODULE_ACCESS['ERP Basic'],
        lockedModules: LOCKED_BY_PLAN['ERP Basic'],
      },
      {
        name: 'Business',
        product_id: 'pdt_0NgWJgYdhx6sleUsn7S2W',
        price: 57600,
        display_price: '$576',
        period: 'yr',
        bonus: '+3 months free',
        features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'],
        emoji: '🚀',
        popular: true,
        unlockedModules: MODULE_ACCESS['Business'],
        lockedModules: LOCKED_BY_PLAN['Business'],
      },
      {
        name: 'Complete',
        product_id: 'pdt_0NgWJzxWIgdEENHILUDrV',
        price: 75900,
        display_price: '$759',
        period: 'yr',
        bonus: '+3 months free',
        features: ['Everything', 'AI Features', 'Unlimited users', 'API access'],
        emoji: '💎',
        unlockedModules: MODULE_ACCESS['Complete'],
        lockedModules: [],
      },
    ],
  },
  global: {
    weekly: [
      { name: 'CRM Starter', product_id: 'pdt_0NgWKaq691hCzxwO4HwTG', price: 699, display_price: '$6.99', period: 'wk', bonus: '+1 week free', features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'], emoji: '🌱', unlockedModules: MODULE_ACCESS['CRM Starter'], lockedModules: LOCKED_BY_PLAN['CRM Starter'] },
      { name: 'ERP Basic', product_id: 'pdt_0NgWKvggU66UPwC0SnnsK', price: 1399, display_price: '$13.99', period: 'wk', bonus: '+1 week free', features: ['CRM + Inventory', 'Universal Tax', 'QR Codes', 'Up to 10 users'], emoji: '⚡', unlockedModules: MODULE_ACCESS['ERP Basic'], lockedModules: LOCKED_BY_PLAN['ERP Basic'] },
      { name: 'Business', product_id: 'pdt_0NgWLIOFUWWAkH6a7g1tX', price: 2299, display_price: '$22.99', period: 'wk', bonus: '+1 week free', features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'], emoji: '🚀', popular: true, unlockedModules: MODULE_ACCESS['Business'], lockedModules: LOCKED_BY_PLAN['Business'] },
      { name: 'Complete', product_id: 'pdt_0NgWLgOFJCN9bEZFdqrZ9', price: 2999, display_price: '$29.99', period: 'wk', bonus: '+1 week free', features: ['Everything', 'AI Features', 'Unlimited users', 'API access'], emoji: '💎', unlockedModules: MODULE_ACCESS['Complete'], lockedModules: [] },
    ],
    monthly: [
      { name: 'CRM Starter', product_id: 'pdt_0NgWM2fAosJxUnyJUylUn', price: 2100, display_price: '$21', period: 'mo', bonus: '+1 month free', features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'], emoji: '🌱', unlockedModules: MODULE_ACCESS['CRM Starter'], lockedModules: LOCKED_BY_PLAN['CRM Starter'] },
      { name: 'ERP Basic', product_id: 'pdt_0NgWMLdi3qovCYcgrM1ym', price: 4900, display_price: '$49', period: 'mo', bonus: '+1 month free', features: ['CRM + Inventory', 'Universal Tax', 'QR Codes', 'Up to 10 users'], emoji: '⚡', unlockedModules: MODULE_ACCESS['ERP Basic'], lockedModules: LOCKED_BY_PLAN['ERP Basic'] },
      { name: 'Business', product_id: 'pdt_0NgWMe0z5QxjhkIKcl71B', price: 7900, display_price: '$79', period: 'mo', bonus: '+1 month free', features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'], emoji: '🚀', popular: true, unlockedModules: MODULE_ACCESS['Business'], lockedModules: LOCKED_BY_PLAN['Business'] },
      { name: 'Complete', product_id: 'pdt_0NgWN1bLP1sMf3dbAcbXm', price: 9900, display_price: '$99', period: 'mo', bonus: '+1 month free', features: ['Everything', 'AI Features', 'Unlimited users', 'API access'], emoji: '💎', unlockedModules: MODULE_ACCESS['Complete'], lockedModules: [] },
    ],
    yearly: [
      { name: 'CRM Starter', product_id: 'pdt_0NgWNRMH9F6g8dZbuXJ0U', price: 19900, display_price: '$199', period: 'yr', bonus: '+2 months free', features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'], emoji: '🌱', unlockedModules: MODULE_ACCESS['CRM Starter'], lockedModules: LOCKED_BY_PLAN['CRM Starter'] },
      { name: 'ERP Basic', product_id: 'pdt_0NgWNkTcYuGKGeCiMsjcO', price: 44900, display_price: '$449', period: 'yr', bonus: '+2 months free', features: ['CRM + Inventory', 'Universal Tax', 'QR Codes', 'Up to 10 users'], emoji: '⚡', unlockedModules: MODULE_ACCESS['ERP Basic'], lockedModules: LOCKED_BY_PLAN['ERP Basic'] },
      { name: 'Business', product_id: 'pdt_0NgWO5UoxPBGsVJcr3I1c', price: 74900, display_price: '$749', period: 'yr', bonus: '+3 months free', features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'], emoji: '🚀', popular: true, unlockedModules: MODULE_ACCESS['Business'], lockedModules: LOCKED_BY_PLAN['Business'] },
      { name: 'Complete', product_id: 'pdt_0NgWOZ3Hw841L4M5o44bA', price: 99900, display_price: '$999', period: 'yr', bonus: '+3 months free', features: ['Everything', 'AI Features', 'Unlimited users', 'API access'], emoji: '💎', unlockedModules: MODULE_ACCESS['Complete'], lockedModules: [] },
    ],
  },
  western: {
    weekly: [
      { name: 'CRM Starter', product_id: 'pdt_0NgWPLWdWvef5NhhN197D', price: 999, display_price: '$9.99', period: 'wk', bonus: '+1 week free', features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'], emoji: '🌱', unlockedModules: MODULE_ACCESS['CRM Starter'], lockedModules: LOCKED_BY_PLAN['CRM Starter'] },
      { name: 'ERP Basic', product_id: 'pdt_0NgWPiH43HrEilt8NHSXs', price: 1999, display_price: '$19.99', period: 'wk', bonus: '+1 week free', features: ['CRM + Inventory', 'VAT + Sales Tax', 'QR Codes', 'Up to 10 users'], emoji: '⚡', unlockedModules: MODULE_ACCESS['ERP Basic'], lockedModules: LOCKED_BY_PLAN['ERP Basic'] },
      { name: 'Business', product_id: 'pdt_0NgWQ2rQqC08LISspzqRV', price: 2999, display_price: '$29.99', period: 'wk', bonus: '+1 week free', features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'], emoji: '🚀', popular: true, unlockedModules: MODULE_ACCESS['Business'], lockedModules: LOCKED_BY_PLAN['Business'] },
      { name: 'Complete', product_id: 'pdt_0NgWQMAe8JYp0Gj9GUoR0', price: 3999, display_price: '$39.99', period: 'wk', bonus: '+1 week free', features: ['Everything', 'AI Features', 'Unlimited users', 'API access'], emoji: '💎', unlockedModules: MODULE_ACCESS['Complete'], lockedModules: [] },
    ],
    monthly: [
      { name: 'CRM Starter', product_id: 'pdt_0NgWQjUvzMSDP9ODJGN7U', price: 2900, display_price: '$29', period: 'mo', bonus: '+1 month free', features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'], emoji: '🌱', unlockedModules: MODULE_ACCESS['CRM Starter'], lockedModules: LOCKED_BY_PLAN['CRM Starter'] },
      { name: 'ERP Basic', product_id: 'pdt_0NgWQzgwVZrMWG6vXvb0J', price: 5900, display_price: '$59', period: 'mo', bonus: '+1 month free', features: ['CRM + Inventory', 'VAT + Sales Tax', 'QR Codes', 'Up to 10 users'], emoji: '⚡', unlockedModules: MODULE_ACCESS['ERP Basic'], lockedModules: LOCKED_BY_PLAN['ERP Basic'] },
      { name: 'Business', product_id: 'pdt_0NgWRKVvsBeR3r5vqTXL6', price: 9900, display_price: '$99', period: 'mo', bonus: '+1 month free', features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'], emoji: '🚀', popular: true, unlockedModules: MODULE_ACCESS['Business'], lockedModules: LOCKED_BY_PLAN['Business'] },
      { name: 'Complete', product_id: 'pdt_0NgWRcAIEeuDSnCTliL5i', price: 14900, display_price: '$149', period: 'mo', bonus: '+1 month free', features: ['Everything', 'AI Features', 'Unlimited users', 'API access'], emoji: '💎', unlockedModules: MODULE_ACCESS['Complete'], lockedModules: [] },
    ],
    yearly: [
      { name: 'CRM Starter', product_id: 'pdt_0NgWS1Gf2A6Xpg0LjfXzu', price: 24900, display_price: '$249', period: 'yr', bonus: '+2 months free', features: ['CRM & Leads', 'AI Lead Scoring', 'Follow-ups', 'Up to 5 users'], emoji: '🌱', unlockedModules: MODULE_ACCESS['CRM Starter'], lockedModules: LOCKED_BY_PLAN['CRM Starter'] },
      { name: 'ERP Basic', product_id: 'pdt_0NgWST0hGFQxEsfoFdVqY', price: 54900, display_price: '$549', period: 'yr', bonus: '+2 months free', features: ['CRM + Inventory', 'VAT + Sales Tax', 'QR Codes', 'Up to 10 users'], emoji: '⚡', unlockedModules: MODULE_ACCESS['ERP Basic'], lockedModules: LOCKED_BY_PLAN['ERP Basic'] },
      { name: 'Business', product_id: 'pdt_0NgWSn3EA9MnwzcVd87oM', price: 89900, display_price: '$899', period: 'yr', bonus: '+3 months free', features: ['CRM + ERP + HR', 'Projects + Reports', 'Up to 25 users', 'Priority support'], emoji: '🚀', popular: true, unlockedModules: MODULE_ACCESS['Business'], lockedModules: LOCKED_BY_PLAN['Business'] },
      { name: 'Complete', product_id: 'pdt_0NgWT5loTHfIvV96OAqze', price: 129900, display_price: '$1299', period: 'yr', bonus: '+3 months free', features: ['Everything', 'AI Features', 'Unlimited users', 'API access'], emoji: '💎', unlockedModules: MODULE_ACCESS['Complete'], lockedModules: [] },
    ],
  },
}
