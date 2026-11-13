import { isSafeId, isSafeModule } from '@/lib/serverAuth'

const TOKEN = (process.env.AIRTABLE_TOKEN || process.env.NEXT_PUBLIC_AIRTABLE_TOKEN) || ''
const BASE = (process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) || ''

export interface UserRow {
  id: string
  data: Record<string, any>
}

/**
 * One Airtable query (paged) for several modules of one user.
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

  const moduleFilter =
    mods.length === 1 ? `{Module}="${mods[0]}"` : `OR(${mods.map(m => `{Module}="${m}"`).join(',')})`
  const formula = `AND({User ID}="${userId}",${moduleFilter})`

  let offset: string | undefined
  let total = 0
  do {
    const params = new URLSearchParams()
    params.set('filterByFormula', formula)
    params.set('pageSize', '100')
    if (offset) params.set('offset', offset)

    const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData?${params}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (!res.ok) throw new Error(`Data error ${res.status}`)
    const json = await res.json()

    for (const r of json.records || []) {
      const mod = r.fields?.Module
      if (!out[mod]) continue
      try {
        const parsed = JSON.parse(r.fields?.['Record Data'] || '{}')
        const { _meta, ...data } = parsed
        out[mod].push({ id: r.id, data })
      } catch {
        // skip unreadable rows
      }
      total++
    }
    offset = total >= maxRecords ? undefined : json.offset
  } while (offset)

  return out
}
