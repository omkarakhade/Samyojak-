import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { airtableCreateRaw, forgetStoreKind, rowToRecord } from '@/lib/store'
import { DATA_KEEP_DAYS } from '@/lib/trialLogic'

/**
 * Trial data lifecycle.
 *  - Free trial  : data lives in Supabase (public.records)
 *  - Payment     : data is copied to Airtable, then removed from Supabase (migrateTrialData)
 *  - No payment  : notices on days 7, 12, 14, 25; data deleted on day 30 (purgeExpiredTrials)
 */

const DAY = 24 * 60 * 60 * 1000
const MOVE_CHUNK = 10 // rows per Airtable request; marked as moved right after each one
const NOTICE_DAYS = [7, 12, 14, 25]

/** Only one mover per user at a time (webhook and daily job can overlap). */
async function claimLock(userId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient()
  const stale = new Date(Date.now() - 2 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('subscriptions')
    .update({ migration_lock: new Date().toISOString() })
    .eq('user_id', userId)
    .or(`migration_lock.is.null,migration_lock.lt.${stale}`)
    .select('id')
  return !!data && data.length > 0
}

async function releaseLock(userId: string) {
  await createSupabaseAdminClient().from('subscriptions').update({ migration_lock: null }).eq('user_id', userId)
}

export interface MoveResult {
  done: boolean
  moved: number
  skipped?: string
}

/**
 * Copy a paid user's trial data from Supabase to Airtable.
 * Safe to run again: rows already copied are marked, and the user keeps reading from
 * Supabase until the very last step flips subscriptions.data_store to 'airtable'.
 */
export async function migrateTrialData(userId: string, budgetMs = 40_000): Promise<MoveResult> {
  const supabase = createSupabaseAdminClient()
  const started = Date.now()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('data_store, subscription_status')
    .eq('user_id', userId)
    .maybeSingle()
  if (!sub) return { done: false, moved: 0, skipped: 'no subscription' }
  if (sub.data_store !== 'supabase') return { done: true, moved: 0, skipped: 'already on Airtable' }
  if (sub.subscription_status !== 'active') return { done: false, moved: 0, skipped: 'not paid' }

  if (!(await claimLock(userId))) return { done: false, moved: 0, skipped: 'another move is running' }

  let moved = 0
  try {
    while (Date.now() - started < budgetMs) {
      const { data: rows, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId)
        .eq('moved', false)
        .order('created_at', { ascending: true })
        .limit(MOVE_CHUNK)
      if (error) throw new Error(error.message)

      if (!rows || rows.length === 0) {
        // Everything is in Airtable. Remove the Supabase copy and switch over.
        await supabase.from('records').delete().eq('user_id', userId)
        await supabase.from('subscriptions').update({ data_store: 'airtable' }).eq('user_id', userId)
        forgetStoreKind(userId)
        return { done: true, moved }
      }

      await airtableCreateRaw(rows.map(r => ({ fields: rowToRecord(r).fields })))
      await supabase.from('records').update({ moved: true }).in('id', rows.map((r: any) => r.id))
      moved += rows.length
    }
    return { done: false, moved }
  } catch (e: any) {
    console.error('migrateTrialData error:', userId, e?.message)
    return { done: false, moved, skipped: e?.full ? 'Airtable full' : 'error' }
  } finally {
    await releaseLock(userId)
  }
}

/** Delete trial data of people who never paid, 30 days after their trial started. */
export async function purgeExpiredTrials(): Promise<number> {
  const supabase = createSupabaseAdminClient()
  const cutoff = new Date(Date.now() - DATA_KEEP_DAYS * DAY).toISOString()
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('data_store', 'supabase')
    .neq('subscription_status', 'active')
    .is('data_deleted_at', null)
    .lt('trial_start_date', cutoff)
    .limit(200)

  let purged = 0
  for (const s of subs || []) {
    const { error } = await supabase.from('records').delete().eq('user_id', s.user_id)
    if (error) {
      console.error('purge error:', s.user_id, error.message)
      continue
    }
    await supabase
      .from('subscriptions')
      .update({ data_deleted_at: new Date().toISOString(), subscription_status: 'expired' })
      .eq('user_id', s.user_id)
    purged++
  }
  return purged
}

// ───────────── reminder emails ─────────────

function noticeText(day: number, deleteOn: string) {
  const link = 'https://www.samyojak-erp.com/pricing'
  if (day < 14) {
    const left = 14 - day
    return {
      subject: `${left} days left in your Samyojak trial`,
      body: `Your free trial ends in ${left} days. Choose a plan any time and everything you have added moves with you automatically.`,
      link,
    }
  }
  if (day === 14) {
    return {
      subject: 'Your Samyojak trial has ended. Your data is safe',
      body: `Your free trial ended today. Your data is kept safe until ${deleteOn}. Choose a plan before then and everything is restored.`,
      link,
    }
  }
  return {
    subject: `Your Samyojak data will be deleted on ${deleteOn}`,
    body: `Your trial data will be permanently deleted on ${deleteOn}. Choose a plan before then to keep it.`,
    link,
  }
}

/**
 * Send the next due reminder. Needs RESEND_API_KEY and TRIAL_EMAIL_FROM
 * (an address on a domain verified in Resend). Without them nothing is sent or marked.
 */
export async function sendTrialNotices(): Promise<{ sent: number; configured: boolean }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.TRIAL_EMAIL_FROM
  if (!key || !from) return { sent: 0, configured: false }

  const supabase = createSupabaseAdminClient()
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id, email, trial_start_date, notices_sent, subscription_status')
    .eq('data_store', 'supabase')
    .neq('subscription_status', 'active')
    .neq('subscription_status', 'cancelled')
    .is('data_deleted_at', null)
    .limit(500)

  let sent = 0
  for (const s of subs || []) {
    if (!s.email) continue
    const startMs = new Date(s.trial_start_date).getTime()
    const day = Math.floor((Date.now() - startMs) / DAY)
    const reached = NOTICE_DAYS.filter(d => day >= d)
    if (reached.length === 0) continue
    const latest = reached[reached.length - 1]
    const done: Record<string, string> = s.notices_sent || {}
    if (done[`d${latest}`]) continue

    const deleteOn = new Date(startMs + DATA_KEEP_DAYS * DAY).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    const t = noticeText(latest, deleteOn)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [s.email],
          subject: t.subject,
          html: `<div style="font-family:sans-serif;max-width:520px"><p>${t.body}</p><p><a href="${t.link}">Choose a plan</a></p><p style="color:#64748B;font-size:12px">Samyojak</p></div>`,
        }),
      })
      if (!res.ok) {
        console.error('notice email failed:', res.status)
        continue
      }
      // mark this and every earlier reminder as handled, so nobody gets a pile of emails
      const next = { ...done }
      for (const d of reached) next[`d${d}`] = new Date().toISOString()
      await supabase.from('subscriptions').update({ notices_sent: next }).eq('user_id', s.user_id)
      sent++
    } catch (e: any) {
      console.error('notice email error:', e?.message)
    }
  }
  return { sent, configured: true }
}
