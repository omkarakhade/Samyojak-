import { createSupabaseAdminClient } from './supabaseAdmin'
import type { UserSubscriptionData, PlanType, PlanTier } from './trialLogic'
import { createNewSubscription } from './trialLogic'

interface SubscriptionRow {
  id: string
  user_id: string
  email: string
  plan_type: string
  plan_tier: string
  trial_start_date: string
  trial_end_date: string
  subscription_status: string
  payment_completed_at: string | null
  last_payment_id: string | null
  dodo_subscription_id: string | null
}

function rowToSubscription(row: SubscriptionRow): UserSubscriptionData {
  return {
    planType: row.plan_type as PlanType,
    planTier: row.plan_tier as PlanTier,
    trialStartDate: row.trial_start_date,
    trialEndDate: row.trial_end_date,
    subscriptionStatus: row.subscription_status as any,
    paymentCompletedAt: row.payment_completed_at,
    lastPaymentId: row.last_payment_id,
    dodoSubscriptionId: row.dodo_subscription_id,
  }
}

export async function getSubscriptionByUserId(
  userId: string
): Promise<{ id: string; data: UserSubscriptionData } | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('getSubscriptionByUserId error:', error)
    return null
  }

  if (!data) return null

  return { id: data.id, data: rowToSubscription(data as SubscriptionRow) }
}

export async function createSubscriptionRecord(
  userId: string,
  email: string,
  planType: PlanType,
  planTier: PlanTier
): Promise<UserSubscriptionData> {
  const supabase = createSupabaseAdminClient()
  const subData = createNewSubscription(planType, planTier)

  const { error } = await supabase.from('subscriptions').insert({
    user_id: userId,
    email,
    plan_type: subData.planType,
    plan_tier: subData.planTier,
    trial_start_date: subData.trialStartDate,
    trial_end_date: subData.trialEndDate,
    subscription_status: subData.subscriptionStatus,
  })

  if (error) {
    console.error('createSubscriptionRecord error:', error)
    throw new Error('Failed to create subscription record')
  }

  return subData
}

export async function updateSubscriptionStatus(
  userId: string,
  updates: Partial<{
    subscriptionStatus: string
    paymentCompletedAt: string
    lastPaymentId: string
    dodoSubscriptionId: string
    planType: string
    planTier: string
    trialStartDate: string
    trialEndDate: string
  }>
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const dbUpdates: Record<string, any> = {}
  if (updates.subscriptionStatus) dbUpdates.subscription_status = updates.subscriptionStatus
  if (updates.paymentCompletedAt) dbUpdates.payment_completed_at = updates.paymentCompletedAt
  if (updates.lastPaymentId) dbUpdates.last_payment_id = updates.lastPaymentId
  if (updates.dodoSubscriptionId) dbUpdates.dodo_subscription_id = updates.dodoSubscriptionId
  if (updates.planType) dbUpdates.plan_type = updates.planType
  if (updates.planTier) dbUpdates.plan_tier = updates.planTier
  if (updates.trialStartDate) dbUpdates.trial_start_date = updates.trialStartDate
  if (updates.trialEndDate) dbUpdates.trial_end_date = updates.trialEndDate

  const { error } = await supabase
    .from('subscriptions')
    .update(dbUpdates)
    .eq('user_id', userId)

  if (error) {
    console.error('updateSubscriptionStatus error:', error)
    throw new Error('Failed to update subscription record')
  }
}
