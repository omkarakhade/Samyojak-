import { NextRequest, NextResponse } from 'next/server'
import { checkPasswordRules, MAX_PASSWORD_LENGTH } from '@/lib/passwordRules'
import { checkBreached } from '@/lib/passwordBreach'
import { clientIp, checkPublicLimit } from '@/lib/aiGuard'

// Used by signup and reset-password before a password is sent to Supabase.
// The password is only held in memory for this request: never logged, never stored.
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers)
  if (!checkPublicLimit(`pwcheck:${ip}`, 30, 10 * 60_000)) {
    return NextResponse.json({ ok: false, problems: ['Too many attempts. Please wait a few minutes and try again.'] }, { status: 429 })
  }

  let body: any = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, problems: ['Invalid request.'] }, { status: 400 })
  }

  const password = typeof body?.password === 'string' ? body.password : ''
  if (password.length > MAX_PASSWORD_LENGTH + 1) {
    return NextResponse.json({ ok: false, problems: [`Use at most ${MAX_PASSWORD_LENGTH} characters.`] })
  }

  const rules = checkPasswordRules(password, {
    email: typeof body?.email === 'string' ? body.email.slice(0, 200) : undefined,
    name: typeof body?.name === 'string' ? body.name.slice(0, 200) : undefined,
    company: typeof body?.company === 'string' ? body.company.slice(0, 200) : undefined,
  })
  if (!rules.ok) return NextResponse.json({ ok: false, problems: rules.problems, score: rules.score })

  const breach = await checkBreached(password)
  if (breach.breached) {
    return NextResponse.json({
      ok: false,
      problems: ['This password has appeared in a known data breach, so attackers already have it. Please choose a different one.'],
      score: 0,
    })
  }

  return NextResponse.json({ ok: true, problems: [], score: rules.score, breachChecked: breach.breached === false })
}
