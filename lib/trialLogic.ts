// Trial calculation and status logic for Samyojak
// Weekly plans: 7 paid days + 7 bonus days = 14 days before next payment required
// Monthly/Yearly plans: 14-day free trial before first payment

export type PlanType = 'weekly' | 'monthly' | 'yearly'
export type PlanTier = 'starter' | 'basic' | 'business' | 'complete'
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'

export interface UserSubscriptionData {
  planType: PlanType
  planTier: PlanTier
  trialStartDate: string
  trialEndDate: string
  subscriptionStatus: SubscriptionStatus
  paymentCompletedAt: string | null
  lastPaymentId: string | null
  dodoSubscriptionId: string | null
}

export interface TrialStatus {
  isLocked: boolean
  daysRemaining: number
  hoursRemaining: number
  status: SubscriptionStatus
  message: string
  showBanner: boolean
}

export function calculateTrialEndDate(planType: PlanType, startDate: Date): Date {
  const end = new Date(startDate)
  // All plans get 14 days total before payment is required
  end.setDate(end.getDate() + 14)
  return end
}

export function createNewSubscription(planType: PlanType, planTier: PlanTier): UserSubscriptionData {
  const now = new Date()
  const trialEnd = calculateTrialEndDate(planType, now)

  return {
    planType,
    planTier,
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    subscriptionStatus: 'trial',
    paymentCompletedAt: null,
    lastPaymentId: null,
    dodoSubscriptionId: null,
  }
}

export function getTrialStatus(sub: UserSubscriptionData | null | undefined): TrialStatus {
  if (!sub) {
    return {
      isLocked: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      status: 'expired',
      message: 'No active plan found. Please choose a plan to continue.',
      showBanner: false,
    }
  }

  if (sub.subscriptionStatus === 'active') {
    return {
      isLocked: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      status: 'active',
      message: 'Subscription active',
      showBanner: false,
    }
  }

  if (sub.subscriptionStatus === 'cancelled') {
    return {
      isLocked: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      status: 'expired',
      message: 'Your subscription was cancelled. Resubscribe to continue.',
      showBanner: false,
    }
  }

  const now = new Date()
  const trialEnd = new Date(sub.trialEndDate)
  const msRemaining = trialEnd.getTime() - now.getTime()

  if (msRemaining <= 0) {
    return {
      isLocked: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      status: 'expired',
      message: 'Your free trial has ended. Upgrade now to keep using Samyojak.',
      showBanner: false,
    }
  }

  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60))
  const trialLabel = sub.planType === 'weekly' ? 'bonus period' : 'free trial'

  return {
    isLocked: false,
    daysRemaining,
    hoursRemaining,
    status: 'trial',
    message: daysRemaining > 1
      ? `${daysRemaining} days left in your ${trialLabel}`
      : `${hoursRemaining} hours left in your ${trialLabel}`,
    showBanner: true,
  }
}

export function formatPlanName(tier: PlanTier): string {
  const names: Record<PlanTier, string> = {
    starter: 'CRM Starter',
    basic: 'ERP Basic',
    business: 'Business',
    complete: 'Complete ERP',
  }
  return names[tier]
    }
