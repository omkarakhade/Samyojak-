import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUser, ADMIN_EMAIL } from '@/lib/serverAuth'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { funnelStage } from '@/lib/funnel'

/** Admin only: everyone who signed up, with their plan and whether they have paid. */
export async function GET(req: NextRequest) {
  const me = await getAuthedUser(req)
  if (!me || me.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 })
  }
  try {
    const admin = createSupabaseAdminClient()
    const users: any[] = []
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
      if (error) throw new Error(error.message)
      users.push(...(data?.users || []))
      if (!data?.users || data.users.length < 200) break
    }
    const { data: subs } = await admin
      .from('subscriptions')
      .select('user_id, subscription_status, plan_type, plan_tier, trial_end_date')
    const byUser = new Map((subs || []).map((s: any) => [s.user_id, s]))

    // How much each person has actually used the product (page through, the API returns 1000 rows at a time)
    const usage = new Map<string, { records: number; invoices: number; last: string }>()
    for (let from = 0; from < 50000; from += 1000) {
      const { data: recs, error: recErr } = await admin
        .from('records')
        .select('user_id, module, updated_at')
        .range(from, from + 999)
      if (recErr || !recs) break
      for (const r of recs as any[]) {
        const u = usage.get(r.user_id) || { records: 0, invoices: 0, last: '' }
        u.records++
        if (r.module === 'Invoices') u.invoices++
        if (String(r.updated_at || '') > u.last) u.last = String(r.updated_at)
        usage.set(r.user_id, u)
      }
      if (recs.length < 1000) break
    }

    const rows = users
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map(u => {
        const s: any = byUser.get(u.id)
        const use = usage.get(u.id)
        const subscription_status = s?.subscription_status || null
        return {
          records: use?.records || 0,
          invoices: use?.invoices || 0,
          last_activity: use?.last || null,
          is_admin: u.email === ADMIN_EMAIL,
          stage: funnelStage({ records: use?.records, invoices: use?.invoices, subscription_status }),
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          user_metadata: { full_name: u.user_metadata?.full_name, plan: u.user_metadata?.plan },
          subscription_status: s?.subscription_status || null,
          plan_type: s?.plan_type || null,
          trial_end_date: s?.trial_end_date || null,
        }
      })
    return NextResponse.json({ users: rows })
  } catch (e: any) {
    console.error('admin users error:', e?.message)
    return NextResponse.json({ error: 'Could not load users.' }, { status: 500 })
  }
}
