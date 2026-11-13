import { PRODUCTS } from './products'
import type { PlanName, BillingPeriod } from './products'
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
export function findProduct(productId: string): { name: PlanName; tier: PlanTier; period: PlanType } | null {
  for (const region of Object.values(PRODUCTS)) {
    for (const period of PERIODS) {
      const hit = region[period].find(p => p.product_id === productId)
      if (hit) return { name: hit.name, tier: TIER_OF[hit.name], period }
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
