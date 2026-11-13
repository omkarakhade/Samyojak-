import { isSafeId, isSafeModule } from '@/lib/serverAuth'
import { storeList } from '@/lib/store'

export interface UserRow {
  id: string
  data: Record<string, any>
}

/**
 * All records of one user for several modules, from wherever their data lives
 * (Supabase while on trial, Airtable once paid).
 * Returns { CRM: [...], Invoices: [...] } with the parsed record data (no _meta).
 */
export async function fetchUserRecords(
  userId: string,
  modules: string[],
  maxRecords = 2000
): Promise<Record<string, UserRow[]>> {
  if (!isSafeId(userId)) throw new Error('Invalid user')
  const mods = Array.from(new Set(modules)).filter(isSafeModule)
  const out: Record<string, UserRow[]> = {}
  mods.forEach(m => (out[m] = []))
  if (mods.length === 0) return out

  const records = await storeList(userId, mods, { max: maxRecords })
  for (const r of records) {
    const mod = r.fields?.Module
    if (!out[mod]) continue
    try {
      const parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
      const { _meta, ...data } = parsed
      out[mod].push({ id: r.id, data })
    } catch {
      // skip unreadable rows
    }
  }
  return out
}
