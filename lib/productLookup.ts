import { PRODUCTS } from './products'
import type { PlanName, BillingPeriod, Region } from './products'
import type { PlanTier, PlanType } from './trialLogic'

export const TIER_OF: Record<PlanName, PlanTier> = {
  'CRM Starter': 'starter',
  'ERP Basic': 'basic',
  Business: 'business',
  Complete: 'complete',
}

export const NAME_OF: Record<PlanTier, PlanName> = {
  starter: 'CRM Starter',
  basic: 'ERP Basic',
  business: 'Business',
  complete: 'Complete',
}

const PERIODS: BillingPeriod[] = ['weekly', 'monthly', 'yearly']

/** Look a Dodo product id up in our own price list. The browser's plan name is never trusted. */
export function findProduct(productId: string): { name: PlanName; tier: PlanTier; period: PlanType; region: Region } | null {
  for (const [regionName, region] of Object.entries(PRODUCTS)) {
    for (const period of PERIODS) {
      const hit = region[period].find(p => p.product_id === productId)
      if (hit) return { name: hit.name, tier: TIER_OF[hit.name], period, region: regionName as Region }
    }
  }
  return null
}

/** Keep the browser-visible plan label in step with the server's decision. */
export async function setPlanLabel(userId: string, planTier: PlanTier) {
  const { createSupabaseAdminClient } = await import('./supabaseAdmin')
  const admin = createSupabaseAdminClient()
  const { data } = await admin.auth.admin.getUserById(userId)
  const current = data?.user?.user_metadata || {}
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ...current, plan: NAME_OF[planTier] },
  })
}


const WESTERN = new Set(['US','CA','GB','IE','AU','NZ','FR','DE','IT','ES','NL','BE','AT','CH','SE','NO','DK','FI','PT','PL','CZ'])
const RANK: Record<Region, number> = { india: 0, global: 1, western: 2 }

export function regionFromCountry(country: string | null | undefined): Region | null {
  const c = (country || '').toUpperCase()
  if (!/^[A-Z]{2}$/.test(c)) return null
  if (c === 'IN') return 'india'
  return WESTERN.has(c) ? 'western' : 'global'
}

/** A buyer may pay their own region's price or a higher one, never a cheaper region's. Unknown country: allowed. */
export function regionAllowed(productRegion: Region, country: string | null | undefined): boolean {
  const mine = regionFromCountry(country)
  return !mine || RANK[productRegion] >= RANK[mine]
}
