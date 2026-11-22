// Team logins (Complete plan). The owner adds people; each person has their own email and
// password and works in the owner's business data. Links are kept in the Supabase auth
// "app_metadata", which only the server can change:
//   owner.app_metadata.team = [{ id, email, name, added }]
//   member.app_metadata.team_owner = owner id

export const TEAM_LIMIT = 5

export interface TeamMember {
  id: string
  email: string
  name: string
  added: string
}

export function teamOf(appMetadata: any): TeamMember[] {
  const list = appMetadata && Array.isArray(appMetadata.team) ? appMetadata.team : []
  return list
    .filter((m: any) => m && typeof m.id === 'string' && typeof m.email === 'string')
    .map((m: any) => ({ id: m.id, email: m.email, name: typeof m.name === 'string' ? m.name : '', added: typeof m.added === 'string' ? m.added : '' }))
}

export function isMemberOf(ownerAppMetadata: any, memberId: string): boolean {
  return teamOf(ownerAppMetadata).some(m => m.id === memberId)
}

export function teamLimitFor(tier: string | null | undefined): number {
  return tier === 'complete' ? TEAM_LIMIT : 0
}

export function canAddMember(tier: string | null | undefined, current: number): { ok: boolean; reason?: string } {
  const limit = teamLimitFor(tier)
  if (limit === 0) return { ok: false, reason: 'Team logins are part of the Complete plan. Upgrade to add people.' }
  if (current >= limit) return { ok: false, reason: `You can add up to ${limit} people on the Complete plan. Remove someone to add another.` }
  return { ok: true }
}

export function validEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
