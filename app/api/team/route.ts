import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, isTeamMember, isSafeId } from '@/lib/serverAuth'
import { getEntitlement } from '@/lib/access'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { checkPasswordRules } from '@/lib/passwordRules'
import { teamOf, canAddMember, validEmail, teamLimitFor } from '@/lib/team'

export const maxDuration = 30

// Only the account owner manages the team. Members never see or change it.
async function ownerOnly(req: NextRequest) {
  const user = await getAuthedUser(req)
  if (!user) return { error: NextResponse.json({ error: 'Please sign in again.' }, { status: 401 }) }
  if (isTeamMember(user)) return { error: NextResponse.json({ error: 'Only the account owner can manage the team.' }, { status: 403 }) }
  return { user }
}

export async function GET(req: NextRequest) {
  const r = await ownerOnly(req)
  if (r.error) return r.error
  const ent = await getEntitlement(r.user!)
  return NextResponse.json({ members: teamOf(r.user!.app_metadata), limit: teamLimitFor(ent.tier), plan: ent.planName })
}

export async function POST(req: NextRequest) {
  const r = await ownerOnly(req)
  if (r.error) return r.error
  const owner = r.user!
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
  const password = body.password

  if (!validEmail(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  const pw = checkPasswordRules(password, { email, name })
  if (!pw.ok) return NextResponse.json({ error: pw.problems[0] || 'Choose a stronger password.' }, { status: 400 })

  const team = teamOf(owner.app_metadata)
  const ent = await getEntitlement(owner)
  const can = canAddMember(ent.tier, team.length)
  if (!can.ok) return NextResponse.json({ error: can.reason }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const created = await admin.auth.admin.createUser({
    email,
    password: password as string,
    email_confirm: true,
    user_metadata: { full_name: name, plan: owner.user_metadata?.plan, company: owner.user_metadata?.company },
    app_metadata: { team_owner: owner.id },
  })
  if (created.error || !created.data.user) {
    const taken = /already|registered|exists/i.test(created.error?.message || '')
    return NextResponse.json({ error: taken ? 'That email already has a Samyojak account. Use a different email.' : 'Could not create the login. Try again.' }, { status: taken ? 409 : 500 })
  }

  const member = { id: created.data.user.id, email, name, added: new Date().toISOString().slice(0, 10) }
  const saved = await admin.auth.admin.updateUserById(owner.id, { app_metadata: { team: [...team, member] } })
  if (saved.error) {
    await admin.auth.admin.deleteUser(member.id).catch(() => undefined)
    return NextResponse.json({ error: 'Could not save the team. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ member, members: [...team, member] })
}

export async function DELETE(req: NextRequest) {
  const r = await ownerOnly(req)
  if (r.error) return r.error
  const owner = r.user!
  const id = new URL(req.url).searchParams.get('id')
  const team = teamOf(owner.app_metadata)
  if (!isSafeId(id) || !team.some(m => m.id === id)) return NextResponse.json({ error: 'That person is not on your team.' }, { status: 404 })

  const admin = createSupabaseAdminClient()
  // Unlink first, so access ends at once even if deleting the login fails.
  const rest = team.filter(m => m.id !== id)
  const saved = await admin.auth.admin.updateUserById(owner.id, { app_metadata: { team: rest } })
  if (saved.error) return NextResponse.json({ error: 'Could not remove that person. Try again.' }, { status: 500 })
  await admin.auth.admin.deleteUser(id).catch(() => undefined)
  return NextResponse.json({ members: rest })
}
