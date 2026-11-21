// Password rules that run in the browser (instant feedback) and on the server (/api/password-check).
// Layer 1 of our own protection. Layer 2 is the breached-password check in lib/passwordBreach.ts.
// Pure functions, no network, so they are easy to test.

export const MIN_PASSWORD_LENGTH = 10
export const MAX_PASSWORD_LENGTH = 128

/** The passwords attackers try first. Compared after lower-casing and removing spaces/symbols. */
const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234', 'passw0rd', 'p@ssw0rd', 'pass1234',
  '123456', '1234567', '12345678', '123456789', '1234567890', '0123456789', '11111111', '00000000', '12341234',
  'qwerty', 'qwerty123', 'qwertyuiop', 'qwerty12345', 'asdfghjkl', 'zxcvbnm', '1q2w3e4r', '1q2w3e4r5t', 'qazwsx',
  'iloveyou', 'iloveyou1', 'welcome', 'welcome1', 'welcome123', 'admin', 'admin123', 'administrator', 'letmein',
  'monkey', 'dragon', 'football', 'baseball', 'abc123', 'abcd1234', 'abcdefgh', 'abcdefghij', 'master', 'login',
  'princess', 'sunshine', 'superman', 'batman', 'shadow', 'trustno1', 'whatever', 'freedom', 'hello123', 'hello1234',
  'india123', 'india1234', 'india@123', 'indian123', 'bharat123', 'krishna', 'krishna123', 'ganesh', 'ganesh123',
  'omsairam', 'jaishreeram', 'radhakrishna', 'mumbai123', 'pune123', 'delhi123', 'bangalore', 'samyojak', 'samyojak123',
  'samyojak1', 'erp12345', 'business', 'business123', 'company123', 'test1234', 'testing123', 'changeme', 'default',
  'secret', 'secret123', 'google123', 'internet', 'computer', 'michael', 'jordan23', 'liverpool', 'cricket', 'cricket123',
  'sachin', 'dhoni', 'virat18', 'rahul123', 'amit1234', 'priya123', 'pass@123', 'pass@1234', 'abc@123', 'admin@123',
  'welcome@123', 'india@1234', 'user1234', 'guest', 'guest123', 'root', 'toor', 'access', 'access14', 'hunter2',
])

function squash(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9@]/g, '')
}

/** Common substitutions people use to dress up a weak word (p@ssw0rd -> password). */
function unleet(s: string): string {
  return s
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
}

function uniqueChars(s: string): number {
  const seen: Record<string, true> = {}
  let n = 0
  const lower = s.toLowerCase()
  for (let i = 0; i < lower.length; i++) {
    if (!seen[lower[i]]) { seen[lower[i]] = true; n++ }
  }
  return n
}

/** A run like 12345, abcde or 98765 of this length or more. */
function hasSequence(s: string, run = 5): boolean {
  const lower = s.toLowerCase()
  let up = 1
  let down = 1
  for (let i = 1; i < lower.length; i++) {
    const d = lower.charCodeAt(i) - lower.charCodeAt(i - 1)
    up = d === 1 ? up + 1 : 1
    down = d === -1 ? down + 1 : 1
    if (up >= run || down >= run) return true
  }
  return false
}

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890']
function hasKeyboardRun(s: string, run = 5): boolean {
  const lower = s.toLowerCase()
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i + run <= row.length; i++) {
      const piece = row.slice(i, i + run)
      if (lower.includes(piece) || lower.includes(piece.split('').reverse().join(''))) return true
    }
  }
  return false
}

export interface PasswordContext {
  email?: string
  name?: string
  company?: string
}

export interface PasswordCheck {
  ok: boolean
  /** Every reason the password is not accepted, in plain words. */
  problems: string[]
  /** 0 (very weak) to 4 (strong), for a simple meter. */
  score: 0 | 1 | 2 | 3 | 4
}

/** Words from the person's own details that must not appear inside the password. */
function personalWords(ctx: PasswordContext): string[] {
  const words = new Set<string>()
  const add = (w: string) => {
    const c = squash(w)
    if (c.length >= 4) words.add(c)
  }
  if (ctx.email) {
    const local = ctx.email.split('@')[0] || ''
    add(local)
    local.split(/[._\-+0-9]+/).forEach(add)
  }
  for (const text of [ctx.name, ctx.company]) {
    if (!text) continue
    add(text)
    text.split(/\s+/).forEach(add)
  }
  return Array.from(words)
}

export function checkPasswordRules(password: unknown, ctx: PasswordContext = {}): PasswordCheck {
  const problems: string[] = []
  const pw = typeof password === 'string' ? password : ''

  if (pw.length < MIN_PASSWORD_LENGTH) {
    problems.push(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
  if (pw.length > MAX_PASSWORD_LENGTH) {
    problems.push(`Use at most ${MAX_PASSWORD_LENGTH} characters.`)
  }

  if (pw.length > 0) {
    const squashed = squash(pw)
    const plain = unleet(squashed)
    if (COMMON.has(squashed) || COMMON.has(plain)) {
      problems.push('This is one of the most commonly used passwords. Pick something only you would think of.')
    } else {
      // "password2026!" or "Samyojak@2026" are a common word with a few extras added at the end.
      const base = squashed.replace(/[0-9@]+$/, '')
      if (base.length >= 4 && base !== squashed && (COMMON.has(base) || COMMON.has(unleet(base)))) {
        problems.push('This is a common word with a few extra characters added. Try a longer phrase instead.')
      }
    }

    if (/^(.)\1+$/.test(pw)) {
      problems.push('Do not repeat one character.')
    } else if (uniqueChars(pw) < 5 && pw.length >= MIN_PASSWORD_LENGTH) {
      problems.push('Use a wider mix of characters.')
    }

    if (hasSequence(pw) || hasKeyboardRun(pw)) {
      problems.push('Avoid runs like 12345, abcde or qwerty.')
    }

    const lowered = squash(pw)
    const loweredPlain = unleet(lowered)
    for (const word of personalWords(ctx)) {
      if (lowered.includes(word) || loweredPlain.includes(unleet(word))) {
        problems.push('Do not use your name, email or company name inside your password.')
        break
      }
    }
  }

  // Score: length matters most, then variety. Any problem caps the score.
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= MIN_PASSWORD_LENGTH + 2) score++
  if (pw.length >= 16) score++
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length
  if (kinds >= 3) score++
  if (problems.length > 0) score = Math.min(score, 1)

  return { ok: problems.length === 0, problems, score: Math.min(4, score) as PasswordCheck['score'] }
}
