import { getSubscriptionByUserId } from '@/lib/subscriptionDb'
import { getTrialStatus } from '@/lib/trialLogic'

export const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

/**
 * Demo accounts are marked in app_metadata, which only the server / dashboard can write.
 * (user_metadata can be edited by the user from the browser, so it must never grant access.)
 */
export function isTrustedDemo(user: { app_metadata?: any } | null | undefined): boolean {
  return user?.app_metadata?.is_demo === true
}

import type { PlanTier } from '@/lib/trialLogic'

/** Module -> cheapest plan that includes it. */
const NEEDS: Record<string, PlanTier> = {
  CRM: 'starter',
  Invoices: 'basic', Quotations: 'basic', Inventory: 'basic',
  HR: 'business', Recruiting: 'business', Projects: 'business',
}
const RANK: Record<PlanTier, number> = { starter: 0, basic: 1, business: 2, complete: 3 }
const TIER_NAME: Record<PlanTier, string> = { starter: 'CRM Starter', basic: 'ERP Basic', business: 'Business', complete: 'Complete' }
export const ALL_MODULES = Object.keys(NEEDS)

export interface Entitlement {
  ai: boolean                // may use the chat home at all (trial running, paid, admin or demo)
  tier: PlanTier | null
  planName: string
  modules: string[]          // modules this plan includes
  status: 'trial' | 'active' | 'expired' | 'none'
  daysRemaining: number
  message: string
}

/** What a user may use. Decided from the subscriptions table, never from browser-editable data. */
export async function getEntitlement(user: { id: string; email?: string | null; app_metadata?: any }): Promise<Entitlement> {
  if (user.email === ADMIN_EMAIL || isTrustedDemo(user)) {
    return { ai: true, tier: 'complete', planName: 'Complete', modules: ALL_MODULES, status: 'active', daysRemaining: 0, message: '' }
  }
  const sub = await getSubscriptionByUserId(user.id)
  if (!sub) {
    return { ai: false, tier: null, planName: '', modules: [], status: 'none', daysRemaining: 0, message: 'Choose a plan to get started.' }
  }
  const t = getTrialStatus(sub.data)
  const tier = sub.data.planTier
  return {
    ai: !t.isLocked,
    tier,
    planName: TIER_NAME[tier],
    modules: t.isLocked ? [] : ALL_MODULES.filter(m => RANK[NEEDS[m]] <= RANK[tier]),
    status: t.status === 'trial' ? 'trial' : t.status === 'active' ? 'active' : 'expired',
    daysRemaining: t.daysRemaining,
    message: t.message,
  }
}

export function moduleAllowed(ent: Entitlement, module: string): boolean {
  return ent.modules.includes(module)
}

/** Friendly "which plan do I need" text for a locked module. */
export function lockedText(module: string): string {
  const need = NEEDS[module]
  return need ? `${module} is part of the ${TIER_NAME[need]} plan and above. Upgrade to unlock it.` : `${module} is not available on your plan.`
}

/** Can this user use the chat home? Any running trial or paid plan can; the plan decides which modules. */
export async function canUseAI(user: { id: string; email?: string | null; app_metadata?: any }): Promise<boolean> {
  return (await getEntitlement(user)).ai
}
