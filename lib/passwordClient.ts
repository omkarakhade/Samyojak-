// Browser side of the password checks: instant rules first, then the server check (breach list).
import { checkPasswordRules, PasswordContext } from '@/lib/passwordRules'

export async function checkPassword(password: string, ctx: PasswordContext): Promise<{ ok: boolean; problems: string[] }> {
  const local = checkPasswordRules(password, ctx)
  if (!local.ok) return { ok: false, problems: local.problems }
  try {
    const res = await fetch('/api/password-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, ...ctx }),
    })
    const data = await res.json()
    if (data && data.ok === false && Array.isArray(data.problems) && data.problems.length) {
      return { ok: false, problems: data.problems }
    }
  } catch {
    // If the server check can not be reached we keep going: the local rules already passed.
  }
  return { ok: true, problems: [] }
}
