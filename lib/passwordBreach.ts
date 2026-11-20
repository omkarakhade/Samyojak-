// Layer 2: is this password in a known data breach? (Same idea as Supabase's "leaked password protection".)
// Uses the Have I Been Pwned range API with k-anonymity: only the first 5 characters of the SHA-1 hash
// leave our server, never the password and never the full hash.
// Fails OPEN: if the service is slow or down we do not block anyone from signing up.

import { createHash } from 'crypto'

export interface BreachResult {
  /** true = found in breaches, false = not found, null = could not check */
  breached: boolean | null
  /** How many times it appeared in breaches (when breached). */
  count: number
}

export async function checkBreached(password: string, timeoutMs = 3000): Promise<BreachResult> {
  try {
    const hash = createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase()
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let res: Response
    try {
      res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { 'Add-Padding': 'true', 'User-Agent': 'Samyojak-password-check' },
        signal: controller.signal,
        cache: 'no-store',
      })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return { breached: null, count: 0 }

    const text = await res.text()
    return parseRange(text, suffix)
  } catch {
    return { breached: null, count: 0 }
  }
}

/** Reads the "SUFFIX:COUNT" lines. Padding lines have a count of 0 and are ignored. */
export function parseRange(body: string, suffix: string): BreachResult {
  for (const line of body.split(/\r?\n/)) {
    const [s, c] = line.trim().split(':')
    if (s && s.toUpperCase() === suffix) {
      const count = parseInt(c || '0', 10) || 0
      if (count > 0) return { breached: true, count }
    }
  }
  return { breached: false, count: 0 }
}
