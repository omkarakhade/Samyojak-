/**
 * Guards for every route that calls the AI model: per-user rate limits, safe text for prompts,
 * model choice by task, and usage logging so cost is visible in the Vercel logs.
 */

/** Cheap model for simple jobs (picking a report, short chat), strong model where a wrong answer writes data. */
export const AI_MODELS = {
  fast: 'openai/gpt-oss-20b',
  smart: 'openai/gpt-oss-120b',
} as const

export type AiBucket = 'chat' | 'agent' | 'insight' | 'pdf' | 'import'

/** Calls allowed per user: a short burst window and a daily total. */
const LIMITS: Record<AiBucket, { perMinute: number; perDay: number }> = {
  chat: { perMinute: 15, perDay: 300 },
  agent: { perMinute: 10, perDay: 200 },
  insight: { perMinute: 20, perDay: 400 },
  pdf: { perMinute: 4, perDay: 40 },
  import: { perMinute: 6, perDay: 60 },
}

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

/**
 * Timestamps of recent calls per user and bucket.
 * This lives in the memory of one server instance, so it is a best-effort brake against a runaway
 * script or a stuck retry loop, not an exact meter. It resets when the instance restarts.
 */
const hits = new Map<string, number[]>()

export interface RateResult {
  ok: boolean
  /** Seconds to wait before trying again (only when not ok). */
  retryAfter: number
  message: string
}

export function checkAiLimit(
  user: { id: string; email?: string | null },
  bucket: AiBucket
): RateResult {
  if (user.email === ADMIN_EMAIL) return { ok: true, retryAfter: 0, message: '' }

  const now = Date.now()
  const key = `${user.id}:${bucket}`
  const { perMinute, perDay } = LIMITS[bucket]
  const recent = (hits.get(key) || []).filter(t => now - t < DAY)

  const lastMinute = recent.filter(t => now - t < MINUTE)
  if (lastMinute.length >= perMinute) {
    const retryAfter = Math.max(1, Math.ceil((lastMinute[0] + MINUTE - now) / 1000))
    hits.set(key, recent)
    return { ok: false, retryAfter, message: `You're going a bit fast. Please wait ${retryAfter} seconds and try again.` }
  }
  if (recent.length >= perDay) {
    const retryAfter = Math.max(1, Math.ceil((recent[0] + DAY - now) / 1000))
    hits.set(key, recent)
    return { ok: false, retryAfter, message: 'You have reached the daily limit for the assistant. It resets within 24 hours.' }
  }

  recent.push(now)
  hits.set(key, recent)

  // Keep memory bounded on a long-lived instance.
  if (hits.size > 5000) {
    hits.forEach((list, k) => {
      if (list.every(t => now - t >= DAY)) hits.delete(k)
    })
  }
  return { ok: true, retryAfter: 0, message: '' }
}

/**
 * Text from the user's own data (names, notes, imported cells) that is about to be placed inside a prompt.
 * Removes line breaks and control characters, collapses spaces and caps the length, so a cell can not
 * add fake instruction lines or flood the prompt.
 */
export function cleanForPrompt(value: unknown, max = 80): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, ' ')
    .replace(/[`<>{}[\]]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/** One log line per model call: which route, which model, how many tokens. Never logs the text itself. */
export function logAiUsage(route: string, model: string, usage: any) {
  try {
    const prompt = Number(usage?.prompt_tokens) || 0
    const completion = Number(usage?.completion_tokens) || 0
    const cached = Number(usage?.prompt_tokens_details?.cached_tokens) || 0
    console.log(`[ai-usage] route=${route} model=${model} prompt=${prompt} cached=${cached} completion=${completion}`)
  } catch {
    // logging must never break a request
  }
}

// ───────────── public routes (no signed-in user) ─────────────

const publicHits = new Map<string, number[]>()

/** Best-effort caller address from the proxy headers. Used only to slow down abuse, never to identify a person. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for') || ''
  return forwarded.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
}

/** True while the caller is under `max` requests in the last `windowMs`. Per server instance, like the user limits above. */
export function checkPublicLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (publicHits.get(key) || []).filter(t => now - t < windowMs)
  if (recent.length >= max) {
    publicHits.set(key, recent)
    return false
  }
  recent.push(now)
  publicHits.set(key, recent)
  if (publicHits.size > 5000) {
    publicHits.forEach((list, k) => {
      if (list.every(t => now - t >= windowMs)) publicHits.delete(k)
    })
  }
  return true
}
