import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { migrateTrialData, purgeExpiredTrials, sendTrialNotices } from '@/lib/trialData'

export const maxDuration = 60

/**
 * Daily job (see vercel.json).
 * 1. finish moving data for anyone who paid but whose data is still in the trial store
 * 2. send trial reminder emails (only if TRIAL_EMAIL_FROM is configured)
 * 3. delete trial data 30 days after the trial started
 * Protected: Vercel sends "Authorization: Bearer <CRON_SECRET>". With no secret set, it refuses to run.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data: paid } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('data_store', 'supabase')
    .eq('subscription_status', 'active')
    .limit(20)

  let moved = 0
  const started = Date.now()
  for (const p of paid || []) {
    const left = 40_000 - (Date.now() - started)
    if (left < 5_000) break
    const r = await migrateTrialData(p.user_id, left)
    moved += r.moved
  }

  const notices = await sendTrialNotices()
  const purged = await purgeExpiredTrials()

  return NextResponse.json({ ok: true, usersWaiting: paid?.length || 0, rowsMoved: moved, notices, purged })
}
