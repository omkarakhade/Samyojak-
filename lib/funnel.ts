// The path from signup to paying, worked out from data we already keep (no tracking script needed).
// signed up -> added data (any record) -> made an invoice -> paying (active subscription).

export type FunnelStage = 'signed_up' | 'added_data' | 'made_invoice' | 'paying'

export const FUNNEL_STAGES: { id: FunnelStage; label: string }[] = [
  { id: 'signed_up', label: 'Signed up' },
  { id: 'added_data', label: 'Added data' },
  { id: 'made_invoice', label: 'Made an invoice' },
  { id: 'paying', label: 'Paying' },
]

export interface FunnelUser {
  records?: number
  invoices?: number
  subscription_status?: string | null
  is_admin?: boolean
}

export function funnelStage(u: FunnelUser): FunnelStage {
  if (u.subscription_status === 'active') return 'paying'
  if ((u.invoices || 0) > 0) return 'made_invoice'
  if ((u.records || 0) > 0) return 'added_data'
  return 'signed_up'
}

const ORDER: FunnelStage[] = ['signed_up', 'added_data', 'made_invoice', 'paying']

/** How many users reached AT LEAST each stage (the owner's own account is left out). */
export function funnelCounts(users: FunnelUser[]): Record<FunnelStage, number> {
  const out: Record<FunnelStage, number> = { signed_up: 0, added_data: 0, made_invoice: 0, paying: 0 }
  for (const u of users) {
    if (u.is_admin) continue
    const reached = ORDER.indexOf(funnelStage(u))
    for (let i = 0; i <= reached; i++) out[ORDER[i]]++
  }
  return out
}
