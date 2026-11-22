// Lead scoring, 0-100, from what is already in the CRM. No AI call, so it costs nothing
// and gives the same answer every time. The reasons are listed so the owner can trust the number.

type Row = { id: string; data: Record<string, any> }

export interface ScoredLead {
  id: string
  name: string
  score: number
  level: 'Hot' | 'Warm' | 'Cold'
  status: string
  reasons: string[]
  next: string
}

function num(v: unknown): number {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function field(d: Record<string, any>, pattern: RegExp): string {
  const k = Object.keys(d).find(key => pattern.test(key) && d[key] !== '' && d[key] != null)
  return k ? String(d[k]).trim() : ''
}

const CLOSED = /won|converted|customer|closed|lost|dead|not interested|unqualified/i

function stagePoints(status: string): number {
  const s = status.toLowerCase()
  if (/negotiat|proposal|quote|demo|trial/.test(s)) return 30
  if (/qualif|interested/.test(s)) return 25
  if (/contact|called|replied|follow/.test(s)) return 15
  return 5 // New or unknown
}

function daysBetween(from: string, to: string): number | null {
  const a = Date.parse(from.slice(0, 10))
  const b = Date.parse(to.slice(0, 10))
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86400000)
}

/** Score the open leads (won and lost ones are left out). today is YYYY-MM-DD. */
export function scoreLeads(rows: Row[], today: string): ScoredLead[] {
  const out: ScoredLead[] = []
  for (const r of rows) {
    const d = r.data || {}
    const name = field(d, /^name$|lead.?name|contact|company|^lead$/i) || field(d, /name/i)
    if (!name) continue
    const status = field(d, /status|stage/i) || 'New'
    if (CLOSED.test(status)) continue

    let score = stagePoints(status)
    const reasons: string[] = []
    if (score >= 25) reasons.push(`stage: ${status}`)

    const hasEmail = !!field(d, /e-?mail/i)
    const hasPhone = !!field(d, /phone|mobile|whats/i)
    if (hasEmail) score += 10
    if (hasPhone) score += 10
    if (hasEmail && hasPhone) reasons.push('email and phone on file')
    else if (!hasEmail && !hasPhone) reasons.push('no way to contact them yet')

    const value = num(field(d, /deal|value|amount|budget|worth/i))
    if (value >= 50000) { score += 25; reasons.push('big deal') }
    else if (value > 0) { score += 12; reasons.push('deal value noted') }

    const follow = field(d, /follow.?up|next.?(contact|call)/i)
    let next = 'Contact them and set a follow-up date'
    if (follow) {
      const gap = daysBetween(today, follow)
      if (gap !== null && gap < 0) { score += 10; reasons.unshift(`follow-up ${-gap} day${gap === -1 ? '' : 's'} late`); next = 'Follow-up is late. Call today' }
      else if (gap !== null && gap <= 2) { score += 8; reasons.push('follow-up due soon'); next = 'Follow-up due. Get ready to call' }
      else { score += 3; next = 'Follow-up already planned' }
    }

    if (field(d, /notes?|remarks?/i)) score += 5

    const created = field(d, /created|added|date.?added/i)
    const age = created ? daysBetween(created, today) : null
    if (age !== null) {
      if (age <= 14) { score += 10; reasons.push('new this fortnight') }
      else if (age > 60 && stagePoints(status) <= 5) { score -= 10; reasons.push('untouched for over 60 days') }
    }

    score = Math.max(0, Math.min(100, score))
    out.push({
      id: r.id,
      name,
      score,
      level: score >= 65 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold',
      status,
      reasons: reasons.slice(0, 3),
      next,
    })
  }
  return out.sort((a, b) => b.score - a.score)
}
