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

/**
 * Can this user use the AI features (chat agent, guided migration, answers that show)?
 * Source of truth is the subscriptions table, not anything the browser can set.
 */
export async function canUseAI(user: { id: string; email?: string | null; app_metadata?: any }): Promise<boolean> {
  if (user.email === ADMIN_EMAIL) return true
  if (isTrustedDemo(user)) return true
  const sub = await getSubscriptionByUserId(user.id)
  if (!sub || sub.data.planTier !== 'complete') return false
  return !getTrialStatus(sub.data).isLocked
}
