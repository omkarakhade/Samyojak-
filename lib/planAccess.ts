import { supabase } from './supabase'
import { MODULE_ACCESS, PlanName } from './products'

export async function getUserPlan(): Promise<PlanName | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const plan = user.user_metadata?.plan as PlanName
  return plan || null
}

export async function canAccessModule(module: string): Promise<boolean> {
  const plan = await getUserPlan()
  if (!plan) return false
  return MODULE_ACCESS[plan]?.includes(module) ?? false
}

export function getPlanFromMetadata(user: any): PlanName | null {
  return user?.user_metadata?.plan || null
}

export function canAccessModuleSync(plan: PlanName | null, module: string): boolean {
  if (!plan) return false
  return MODULE_ACCESS[plan]?.includes(module) ?? false
}
