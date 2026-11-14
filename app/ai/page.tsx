'use client'
import React, { useEffect, useRef, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata } from '@/lib/planAccess'
import { Brain, Send, Lock, Zap, Check, X, Undo2, Paperclip, Pin, PinOff, LayoutDashboard, FileText } from 'lucide-react'
import { parseSheetText } from '@/lib/csv'
import { MODULE_FIELDS, MODULE_LABELS, exactFieldMapping } from '@/lib/moduleFields'
import type { InsightCard } from '@/lib/insights'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'
const AI_PLANS = ['Complete']

const QUICK_QUESTIONS = [
  'Who has not paid me?',
  'Sales per month',
  'Tax collected per month',
  'Draft payment reminders',
  'What did you change recently?',
  'Leads by status',
  'Any low stock alerts?',
  'Top clients',
  'What should I focus on today?',
  'How is my team doing?',
  'Which projects are overdue?',
]

type RecordData = Record<string, string | number>

interface ProposedAction {
  type?: 'add' | 'update'
  module: string
  records?: RecordData[]
  recordId?: string
  label?: string
  changes?: RecordData
  before?: RecordData
  kind?: 'edit' | 'mark_paid'
}

interface Revert {
  recordId: string
  previous: Record<string, string | number | null>
}

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
  actions?: ProposedAction[]
  status?: 'pending' | 'saved' | 'cancelled' | 'undone'
  batchId?: string
  count?: number
  updated?: number
  reverts?: Revert[]
  card?: InsightCard
  migration?: MigrationPlan
}

interface MigrationPlan {
  fileName: string
  headers: string[]
  module: string
  mapping: Record<string, string | null>
  total: number
  summary: string
  confidence: number
  sample: Record<string, string>[]
  progress?: number
}

interface Summary {
  leads: { total: number; fresh: number }
  invoices: { count: number; unpaidCount: number; unpaidAmount: number; overdueCount: number; billedThisMonth: number }
  inventory: { items: number; low: number }
  hasData: boolean
}

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_SHEET_ROWS = 3000
const CHUNK = 200

const inr = (n: number) => Math.round(n).toLocaleString('en-US')

function newBatchId() {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function looksLikeQuestion(text: string) {
  const t = text.trim()
  return t.endsWith('?') && !/\d/.test(t)
}

function PreviewTable({ actions }: { actions: ProposedAction[] }) {
  return (
    <div className="space-y-3 mt-3">
      {actions.map((action, i) => {
        if (action.type === 'update') {
          const changes = action.changes || {}
          return (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0' }}>
              <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wide"
                style={{ background: action.kind === 'mark_paid' ? '#D1FAE5' : '#FEF3C7',
                  color: action.kind === 'mark_paid' ? '#065F46' : '#92400E' }}>
                {action.kind === 'mark_paid' ? 'Mark paid' : 'Edit'} · {action.module} · {action.label}
              </div>
              <div className="px-3 py-2 space-y-1">
                {Object.keys(changes).map(k => (
                  <p key={k} className="text-xs" style={{ color: '#1E293B' }}>
                    <span className="font-bold" style={{ color: '#64748B' }}>{k}: </span>
                    <span style={{ color: '#94A3B8', textDecoration: 'line-through' }}>
                      {action.before && action.before[k] !== undefined ? String(action.before[k]) : '—'}
                    </span>
                    {' → '}
                    <span className="font-bold">{String(changes[k])}</span>
                  </p>
                ))}
              </div>
            </div>
          )
        }
        const recs = action.records || []
        const keys = Array.from(new Set(recs.flatMap(r => Object.keys(r))))
        return (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0' }}>
            <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wide"
              style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
              Add · {action.module} · {recs.length} record{recs.length > 1 ? 's' : ''}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {keys.map(k => (
                      <th key={k} className="px-3 py-2 text-left font-bold whitespace-nowrap" style={{ color: '#64748B' }}>
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recs.map((r, ri) => (
                    <tr key={ri} style={{ borderTop: '1px solid #F1F5F9' }}>
                      {keys.map(k => (
                        <td key={k} className="px-3 py-2 whitespace-nowrap" style={{ color: '#1E293B' }}>
                          {r[k] !== undefined ? String(r[k]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map(i => i.value))
  return (
    <div className="space-y-1.5 mt-2">
      {items.map(i => (
        <div key={i.label} className="flex items-center gap-2 text-xs">
          <span className="w-24 truncate text-right" style={{ color: '#64748B' }} title={i.label}>{i.label}</span>
          <div className="flex-1 h-4 rounded" style={{ background: '#F1F5F9' }}>
            <div className="h-4 rounded" style={{ width: `${Math.max(2, (i.value / max) * 100)}%`, background: '#8B5CF6' }} />
          </div>
          <span className="w-20 font-bold" style={{ color: '#1E293B' }}>{i.value.toLocaleString('en-US')}</span>
        </div>
      ))}
    </div>
  )
}

function InsightView({ card, pinned, onTogglePin }: { card: InsightCard; pinned: boolean; onTogglePin: () => void }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0' }}>
      <div className="px-3 py-2 flex items-center justify-between gap-2" style={{ background: '#F8FAFC' }}>
        <span className="text-xs font-black uppercase tracking-wide" style={{ color: '#8B5CF6' }}>{card.title}</span>
        <button onClick={onTogglePin}
          className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: pinned ? '#EDE9FE' : 'white', color: '#8B5CF6', border: '1.5px solid #C4B5FD' }}>
          {pinned ? <PinOff size={12} /> : <Pin size={12} />} {pinned ? 'Unpin' : 'Pin'}
        </button>
      </div>
      <div className="px-3 pb-3">
        {card.total && <p className="text-sm font-black mt-2" style={{ color: '#1E293B' }}>{card.total}</p>}
        {card.kind === 'bar' && card.bar && card.bar.length > 0 && <BarList items={card.bar} />}
        {card.kind === 'table' && card.rows.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {card.columns.map(c => (
                    <th key={c} className="px-2 py-1.5 text-left font-bold whitespace-nowrap" style={{ color: '#64748B' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.rows.map((r, ri) => (
                  <tr key={ri} style={{ borderTop: '1px solid #F1F5F9' }}>
                    {r.map((v, vi) => (
                      <td key={vi} className="px-2 py-1.5 whitespace-nowrap" style={{ color: '#1E293B' }}>{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {card.note && <p className="text-xs mt-2" style={{ color: '#64748B' }}>{card.note}</p>}
      </div>
    </div>
  )
}

function MigrationView({
  plan, status, busy, onModuleChange, onConfirm, onCancel,
}: {
  plan: MigrationPlan
  status?: Message['status']
  busy: boolean
  onModuleChange: (m: string) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const mappedCount = Object.values(plan.mapping).filter(Boolean).length
  const editable = status === 'pending' && !busy
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0' }}>
      <div className="px-3 py-2 flex items-center gap-2 flex-wrap" style={{ background: '#EDE9FE' }}>
        <FileText size={14} style={{ color: '#8B5CF6' }} />
        <span className="text-xs font-black" style={{ color: '#8B5CF6' }}>{plan.fileName}</span>
        <span className="text-xs" style={{ color: '#64748B' }}>· {plan.total.toLocaleString('en-US')} rows · {plan.headers.length} columns</span>
      </div>
      <div className="px-3 py-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold" style={{ color: '#64748B' }}>Move into</span>
          <select value={plan.module} disabled={!editable} onChange={e => onModuleChange(e.target.value)}
            className="text-xs font-bold rounded-lg px-2 py-1 outline-none"
            style={{ border: '1.5px solid #C4B5FD', color: '#8B5CF6', background: 'white' }}>
            {Object.keys(MODULE_FIELDS).map(m => <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>)}
          </select>
          {plan.confidence > 0 && (
            <span className="text-xs" style={{ color: '#94A3B8' }}>
              {plan.confidence >= 0.75 ? 'Confident match' : 'Please check this'}
            </span>
          )}
        </div>
        {plan.summary && <p className="text-xs" style={{ color: '#475569' }}>{plan.summary}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left font-bold" style={{ color: '#64748B' }}>Your column</th>
                <th className="px-2 py-1 text-left font-bold" style={{ color: '#64748B' }}>Becomes</th>
                <th className="px-2 py-1 text-left font-bold" style={{ color: '#64748B' }}>Example</th>
              </tr>
            </thead>
            <tbody>
              {plan.headers.slice(0, 14).map(h => (
                <tr key={h} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td className="px-2 py-1 whitespace-nowrap" style={{ color: '#1E293B' }}>{h}</td>
                  <td className="px-2 py-1 whitespace-nowrap font-bold" style={{ color: plan.mapping[h] ? '#065F46' : '#94A3B8' }}>
                    {plan.mapping[h] || 'kept as it is'}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap" style={{ color: '#64748B' }}>
                    {String(plan.sample[0]?.[h] ?? '').slice(0, 24)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {plan.headers.length > 14 && (
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>+ {plan.headers.length - 14} more columns, all kept.</p>
          )}
        </div>
        <p className="text-xs" style={{ color: '#64748B' }}>
          {mappedCount} column{mappedCount === 1 ? '' : 's'} matched. Nothing is dropped. You can undo the whole import afterwards.
        </p>

        {status === 'pending' && (
          <div className="flex gap-2">
            <button onClick={onConfirm} disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-white disabled:opacity-50"
              style={{ background: '#34D399', border: '2px solid #1E293B' }}>
              <Check size={14} />
              {busy
                ? `Moving... ${plan.progress ?? 0}%`
                : `Move ${plan.total.toLocaleString('en-US')} rows in`}
            </button>
            <button onClick={onCancel} disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              style={{ background: 'white', color: '#64748B', border: '2px solid #E2E8F0' }}>
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryTiles({ summary }: { summary: Summary | null }) {
  const tiles = summary
    ? [
        { label: 'Leads', value: summary.leads.total.toLocaleString('en-US'), sub: `${summary.leads.fresh} new` },
        { label: 'Unpaid', value: inr(summary.invoices.unpaidAmount), sub: `${summary.invoices.unpaidCount} invoice${summary.invoices.unpaidCount === 1 ? '' : 's'}${summary.invoices.overdueCount ? ` · ${summary.invoices.overdueCount} overdue` : ''}` },
        { label: 'Billed this month', value: inr(summary.invoices.billedThisMonth), sub: `${summary.invoices.count} invoices in all` },
        { label: 'Low stock', value: String(summary.inventory.low), sub: `of ${summary.inventory.items} items` },
      ]
    : []
  if (!summary) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 flex-shrink-0">
      {[0, 1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#F1F5F9' }} />)}
    </div>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 flex-shrink-0">
      {tiles.map(t => (
        <div key={t.label} className="rounded-xl px-3 py-2" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{t.label}</p>
          <p className="text-lg font-black" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{t.value}</p>
          <p className="text-xs" style={{ color: '#64748B' }}>{t.sub}</p>
        </div>
      ))}
    </div>
  )
}

const PIN_LABELS: Record<string, string> = {
  unpaid_invoices: 'Unpaid invoices',
  revenue_by_month: 'Billed per month',
  leads_by_status: 'Leads by status',
  low_stock: 'Low stock',
  top_clients: 'Top clients',
  gst_summary: 'Tax per month',
  payment_reminders: 'Payment reminders',
  daily_brief: 'Today',
  recent_changes: 'Recent changes',
}

export default function AIAssistant() {
  const [plan, setPlan] = useState('')
  const [userId, setUserId] = useState('')
  const [canUseAI, setCanUseAI] = useState(false)
  const [ent, setEnt] = useState<{ status: string; daysRemaining: number; planName: string; modules: string[]; message: string } | null>(null)
  const lockedMsg = useRef('')
  const [checking, setChecking] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyIndex, setBusyIndex] = useState<number | null>(null)
  const [greeting, setGreeting] = useState('')
  const [greetingLoading, setGreetingLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const migrationRows = useRef<Record<number, Record<string, string>[]>>({})
  const [summary, setSummary] = useState<Summary | null>(null)
  const [pins, setPins] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const userPlan = getPlanFromMetadata(user) || 'No Plan'
      setPlan(userPlan)
      setUserId(user.id)
      let hasAI = false
      try {
        const token = await getToken()
        const res = await fetch('/api/entitlement', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (res.ok) { const e = await res.json(); hasAI = !!e.ai; setEnt(e) }
      } catch { /* treated as no access */ }
      setCanUseAI(hasAI)
      setChecking(false)
      if (hasAI) {
        loadGreeting(user.id)
        loadSummary()
        try {
          const raw = localStorage.getItem(`samyojak_pins_${user.id}`)
          const parsed = raw ? JSON.parse(raw) : []
          if (Array.isArray(parsed)) setPins(parsed.filter((p: unknown) => typeof p === 'string' && p in PIN_LABELS))
        } catch { /* storage unavailable */ }
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadGreeting = async (uid: string) => {
    setGreetingLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: 'Give me a brief business overview and the most important thing to focus on today. Be specific and use actual numbers from my data.',
        }),
      })
      const data = await res.json()
      setGreeting(data.reply || '')
    } catch {
      setGreeting('🚀 Your AI assistant is ready. Ask me anything about your business.')
    }
    setGreetingLoading(false)
  }

  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ''
  }

  const callAgent = async (body: object) => {
    const token = await getToken()
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  }

  const askAssistant = async (q: string) => {
    const token = await getToken()
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: q }),
    })
    const data = await res.json()
    return data.reply || 'No response. Please try again.'
  }


  const loadSummary = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/summary', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (res.ok) setSummary(await res.json())
    } catch { /* keep tiles empty */ }
  }

  const savePins = (next: string[]) => {
    setPins(next)
    try { localStorage.setItem(`samyojak_pins_${userId}`, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const togglePin = (id: string) =>
    savePins(pins.includes(id) ? pins.filter(p => p !== id) : [...pins, id])

  const fetchInsight = async (body: { message?: string; insight?: string }): Promise<InsightCard | null> => {
    try {
      const token = await getToken()
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      })
      if (!res.ok) return null
      const data = await res.json()
      lockedMsg.current = typeof data.locked === 'string' ? data.locked : ''
      return data.card || null
    } catch {
      return null
    }
  }

  /** Show a table or chart when one fits the question, otherwise answer in words. */
  const answerQuestion = async (q: string) => {
    lockedMsg.current = ''
    const card = await fetchInsight({ message: q })
    if (card) {
      addAiMessage({ text: 'Here you go.', card })
    } else if (lockedMsg.current) {
      addAiMessage({ text: '🔒 ' + lockedMsg.current })
    } else {
      addAiMessage({ text: await askAssistant(q) })
    }
  }

  const showPinned = async (id: string) => {
    if (loading) return
    setLoading(true)
    lockedMsg.current = ''
    const card = await fetchInsight({ insight: id })
    if (!card && lockedMsg.current) { addAiMessage({ text: '🔒 ' + lockedMsg.current }); setLoading(false); return }
    addAiMessage(card ? { text: PIN_LABELS[id] || 'Pinned answer', card } : { text: 'Could not load that right now.' })
    setLoading(false)
  }

  // ───── guided migration ─────

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || loading) return
    setMessages(prev => [...prev, { role: 'user', text: `📎 ${file.name}`, time: nowTime() }])

    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      addAiMessage({ text: 'I can read CSV files right now. In Excel or Google Sheets choose File → Save as / Download → CSV, then attach it again. Your data stays as it is.' })
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      addAiMessage({ text: 'That file is over 5 MB. Please split it into smaller files and attach them one by one.' })
      return
    }

    setLoading(true)
    try {
      const sheet = parseSheetText(await file.text())
      if (sheet.headers.length === 0 || sheet.rows.length === 0) {
        addAiMessage({ text: 'I could not find a header row and data rows in that file. Make sure the first row has the column names.' })
        setLoading(false)
        return
      }
      if (sheet.headers.length > 60) {
        addAiMessage({ text: 'That sheet has more than 60 columns. Please remove the extra columns and try again.' })
        setLoading(false)
        return
      }
      const rows = sheet.rows.slice(0, MAX_SHEET_ROWS)
      const sample = rows.slice(0, 8)

      const { ok, data } = await callMigrate({ action: 'analyze', headers: sheet.headers, sample, fileName: file.name })
      const module: string = ok && data.module in MODULE_FIELDS ? data.module : 'CRM'
      const mapping: Record<string, string | null> =
        ok && data.mapping ? data.mapping : exactFieldMapping(module, sheet.headers)

      const plan: MigrationPlan = {
        fileName: file.name,
        headers: sheet.headers,
        module,
        mapping,
        total: rows.length,
        summary: (ok && data.summary) || '',
        confidence: ok ? Number(data.confidence) || 0 : 0,
        sample,
      }
      const index = messages.length + 1 // the user message just added sits before this one
      migrationRows.current[index] = rows
      addAiMessage({
        text: sheet.rows.length > MAX_SHEET_ROWS
          ? `I read the first ${MAX_SHEET_ROWS.toLocaleString('en-US')} of ${sheet.rows.length.toLocaleString('en-US')} rows. Here is what I understood. Check it, then confirm.`
          : 'Here is what I understood. Check it, then confirm and I will move it in.',
        migration: plan,
        status: 'pending',
      })
    } catch {
      addAiMessage({ text: 'I could not read that file. Please try again or export it as a CSV.' })
    }
    setLoading(false)
  }

  const callMigrate = async (body: object) => {
    const token = await getToken()
    const res = await fetch('/api/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data }
  }

  const changeMigrationModule = (index: number, module: string) =>
    setMessages(prev => prev.map((m, i) =>
      i === index && m.migration
        ? { ...m, migration: { ...m.migration, module, mapping: exactFieldMapping(module, m.migration.headers) } }
        : m))

  const confirmMigration = async (index: number) => {
    const msg = messages[index]
    const plan = msg?.migration
    const rows = migrationRows.current[index]
    if (!plan || !rows || busyIndex !== null) return
    setBusyIndex(index)
    const batchId = newBatchId()
    let created = 0
    try {
      for (let start = 0; start < rows.length; start += CHUNK) {
        const { ok, data } = await callMigrate({
          action: 'commit',
          module: plan.module,
          mapping: plan.mapping,
          headers: plan.headers,
          rows: rows.slice(start, start + CHUNK),
          batchId,
          startIndex: start,
        })
        created += data.created || 0
        if (!ok) {
          addAiMessage({ text: data.error || 'Saving stopped. You can undo and try again.' })
          break
        }
        setMessages(prev => prev.map((m, i) =>
          i === index && m.migration
            ? { ...m, migration: { ...m.migration, progress: Math.round(((start + CHUNK) / rows.length) * 100) } }
            : m))
      }
      if (created > 0) {
        updateMessage(index, { status: 'saved', batchId, count: created, reverts: [] })
        loadSummary()
        if (created === rows.length) {
          addAiMessage({ text: `Done. ${created.toLocaleString('en-US')} rows are now in ${MODULE_LABELS[plan.module] || plan.module}. Ask me anything about them.` })
        }
      } else {
        updateMessage(index, { status: 'cancelled' })
      }
    } catch {
      if (created > 0) updateMessage(index, { status: 'saved', batchId, count: created, reverts: [] })
      addAiMessage({ text: 'Connection error while moving your data. You can undo this import and try again.' })
    }
    setBusyIndex(null)
  }

  const addAiMessage = (m: Omit<Message, 'role' | 'time'>) =>
    setMessages(prev => [...prev, { role: 'ai', time: nowTime(), ...m }])

  const sendMessage = async (text?: string, questionOnly = false) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q, time: nowTime() }])
    setLoading(true)

    try {
      // Questions go straight to the assistant. Everything else tries the agent first.
      if (questionOnly || looksLikeQuestion(q)) {
        await answerQuestion(q)
      } else {
        const { ok, data } = await callAgent({ action: 'plan', message: q })

        if (!ok) {
          addAiMessage({ text: data.error || 'Something went wrong. Please try again.' })
        } else if (data.needsConfirm && data.actions?.length) {
          addAiMessage({
            text: data.reply || 'Please review and confirm.',
            actions: data.actions,
            status: 'pending',
          })
        } else if (data.reply && !data.fallback) {
          // The agent understood but could not find the record (or needs more detail)
          addAiMessage({ text: data.reply })
        } else {
          const card = await fetchInsight({ message: q })
          if (card && !data.degraded) {
            addAiMessage({ text: 'Here you go.', card })
          } else {
            const answer = await askAssistant(q)
            addAiMessage({
              text: data.degraded
                ? `${answer}\n\n(The recording agent is unavailable right now, so I answered as a question. Nothing was saved.)`
                : answer,
            })
          }
        }
      }
    } catch {
      addAiMessage({ text: 'Connection error. Please check your internet and try again.' })
    }
    setLoading(false)
  }

  const updateMessage = (index: number, patch: Partial<Message>) =>
    setMessages(prev => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))

  const handleConfirm = async (index: number) => {
    const msg = messages[index]
    if (!msg?.actions || busyIndex !== null) return
    setBusyIndex(index)
    try {
      const { ok, data } = await callAgent({ action: 'confirm', actions: msg.actions })
      if (ok) {
        updateMessage(index, {
          status: 'saved',
          batchId: data.batchId,
          count: data.count || 0,
          updated: data.updated || 0,
          reverts: data.reverts || [],
        })
        loadSummary()
        if (data.skipped?.length) {
          addAiMessage({ text: `I could not change: ${data.skipped.join(', ')}.` })
        }
      } else {
        addAiMessage({ text: data.error || 'Could not save. Nothing was added.' })
      }
    } catch {
      addAiMessage({ text: 'Connection error. Nothing was saved.' })
    }
    setBusyIndex(null)
  }

  const handleCancel = (index: number) => updateMessage(index, { status: 'cancelled' })

  const handleUndo = async (index: number) => {
    const msg = messages[index]
    if ((!msg?.batchId && !msg?.reverts?.length) || busyIndex !== null) return
    setBusyIndex(index)
    try {
      const { ok, data } = await callAgent({
        action: 'undo',
        batchId: msg.batchId,
        reverts: msg.reverts || [],
      })
      if (ok) {
        updateMessage(index, { status: 'undone' })
        loadSummary()
      } else {
        addAiMessage({ text: data.error || 'Could not undo. Please try again.' })
      }
    } catch {
      addAiMessage({ text: 'Connection error. Nothing was undone.' })
    }
    setBusyIndex(null)
  }

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )

  if (!canUseAI) return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl overflow-hidden text-center p-10"
          style={{ background: '#1E293B', border: '2px solid #334155' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.4)' }}>
            <Lock size={28} style={{ color: '#8B5CF6' }} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>
            {ent?.status === 'expired' ? 'Your free trial has ended' : 'Start with a plan'}
          </h2>
          <p className="text-gray-400 mb-3">
            {ent?.message || 'Pick a plan to start your 14-day free trial. Your assistant runs your business with you.'}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Short on budget? A weekly plan lets you pay week by week and keep your data and your work going.
          </p>
          <a href="/choose-plan"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black text-white hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid rgba(139,92,246,0.5)' }}>
            <Zap size={16} /> Choose a plan
          </a>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto flex gap-4" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#8B5CF6' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Samyojak
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-xs text-green-500">Ask, record, or attach a sheet. I do the rest.</p>
            </div>
          </div>
        </div>

        {ent?.status === 'trial' && (
          <div className="mb-3 px-4 py-2 rounded-xl text-xs flex-shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1"
            style={{ background: '#FEF3C7', border: '1px solid #FBBF24', color: '#92400E' }}>
            <span><strong>{ent.daysRemaining} day{ent.daysRemaining === 1 ? '' : 's'}</strong> left in your free trial ({ent.planName}).</span>
            <span>Can't pay yet? A weekly plan keeps your data and work going.</span>
            <a href="/choose-plan" className="font-bold underline">See plans</a>
          </div>
        )}

        <SummaryTiles summary={summary} />

        {pins.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0 lg:hidden">
            {pins.map(id => (
              <button key={id} onClick={() => showPinned(id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: '#EDE9FE', color: '#8B5CF6', border: '1.5px solid #C4B5FD' }}>
                <Pin size={11} /> {PIN_LABELS[id]}
              </button>
            ))}
          </div>
        )}

        {/* AI Greeting */}
        {(greeting || greetingLoading) && (
          <div className="p-4 rounded-2xl mb-4 flex-shrink-0"
            style={{ background: '#0F172A', border: '1.5px solid #334155' }}>
            {greetingLoading ? (
              <div className="flex items-center gap-2">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${d}ms` }} />
                ))}
                <span className="text-xs text-gray-500">Analyzing your data...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: '#C4B5FD' }}>{greeting}</p>
            )}
          </div>
        )}

        {/* Quick questions + capture hint */}
        {messages.length === 0 && (
          <div className="mb-4 flex-shrink-0">
            <div className="p-3 rounded-xl mb-3 text-xs"
              style={{ background: '#D1FAE5', border: '1.5px solid #34D399', color: '#065F46' }}>
              <strong>New here?</strong> Tap the paperclip and attach your Excel or Google Sheet saved as CSV. I will work out what it is and move it in.
              <br /><strong>Or record something:</strong> "Invoiced Rahul Sharma 45000 for the website, due Nov 10.
              New lead Sneha, call her Monday." You can also say "Sharma paid" or "Neha is contacted now".
              You'll see a preview and nothing changes until you confirm.
            </div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-400">Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q}
                  onClick={() => sendMessage(q, true)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ background: '#EDE9FE', color: '#8B5CF6', border: '1.5px solid #C4B5FD' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                  style={{ background: '#8B5CF6' }}>
                  <Brain size={14} className="text-white" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.actions || msg.card || msg.migration ? 'w-full max-w-full md:max-w-xl' : 'max-w-xs md:max-w-md lg:max-w-lg'
                } ${msg.role === 'user' ? 'text-white' : 'dark:text-gray-200 text-gray-800'}`}
                style={{
                  background: msg.role === 'user' ? '#8B5CF6' : 'white',
                  border: msg.role === 'ai' ? '1.5px solid #E2E8F0' : 'none',
                }}>
                {msg.text}

                {msg.card && (
                  <InsightView
                    card={msg.card}
                    pinned={pins.includes(msg.card.id)}
                    onTogglePin={() => togglePin(msg.card!.id)}
                  />
                )}

                {msg.migration && msg.status !== 'cancelled' && msg.status !== 'undone' && (
                  <MigrationView
                    plan={msg.migration}
                    status={msg.status}
                    busy={busyIndex === i}
                    onModuleChange={m => changeMigrationModule(i, m)}
                    onConfirm={() => confirmMigration(i)}
                    onCancel={() => handleCancel(i)}
                  />
                )}

                {msg.actions && msg.status !== 'cancelled' && msg.status !== 'undone' && (
                  <PreviewTable actions={msg.actions} />
                )}

                {msg.actions && msg.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleConfirm(i)}
                      disabled={busyIndex !== null}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-white disabled:opacity-50"
                      style={{ background: '#34D399', border: '2px solid #1E293B' }}>
                      <Check size={14} /> {busyIndex === i ? 'Saving...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      disabled={busyIndex !== null}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
                      style={{ background: 'white', color: '#64748B', border: '2px solid #E2E8F0' }}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                )}

                {msg.status === 'saved' && (
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: '#065F46' }}>
                      ✅ {[
                        msg.count ? `Added ${msg.count} record${msg.count > 1 ? 's' : ''}` : '',
                        msg.updated ? `Updated ${msg.updated} record${msg.updated > 1 ? 's' : ''}` : '',
                      ].filter(Boolean).join(' · ') || 'Done'}
                    </span>
                    <button
                      onClick={() => handleUndo(i)}
                      disabled={busyIndex !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold disabled:opacity-50"
                      style={{ background: '#FEE2E2', color: '#DC2626', border: '1.5px solid #FCA5A5' }}>
                      <Undo2 size={13} /> {busyIndex === i ? 'Undoing...' : 'Undo'}
                    </button>
                  </div>
                )}

                {msg.status === 'cancelled' && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#94A3B8' }}>Cancelled. Nothing was saved.</p>
                )}
                {msg.status === 'undone' && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#94A3B8' }}>Undone. Your data is back as it was.</p>
                )}

                <p className="text-xs mt-1 opacity-50">{msg.time}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 flex-shrink-0"
                style={{ background: '#8B5CF6' }}>
                <Brain size={14} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0">
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            aria-label="Attach a spreadsheet"
            title="Attach a CSV to move your data in"
            className="px-3 py-3 rounded-xl font-bold text-sm disabled:opacity-40 flex-shrink-0"
            style={{ background: '#EDE9FE', color: '#8B5CF6', border: '1.5px solid #C4B5FD' }}>
            <Paperclip size={18} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask a question, or tell me what to record..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none border border-gray-300 dark:border-white/20 focus:ring-2 focus:ring-violet-500 dark:bg-[#1a2740] dark:text-white"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ background: '#8B5CF6' }}>
            <Send size={18} />
          </button>
        </div>

      </div>

      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4 overflow-y-auto">
        <div className="rounded-2xl p-4" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
          <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>Your dashboard</p>
          <div className="space-y-1.5">
            {[
              { href: '/dashboard', label: 'Full dashboard' },
              { href: '/reports', label: 'Reports' },
              { href: '/bi', label: 'BI dashboard' },
              { href: '/invoices', label: 'Invoices' },
              { href: '/crm', label: 'Leads & CRM' },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
                style={{ color: '#8B5CF6' }}>
                <LayoutDashboard size={14} /> {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
          <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>Pinned answers</p>
          {pins.length === 0 ? (
            <p className="text-xs" style={{ color: '#94A3B8' }}>Ask something like "Who has not paid me?" and press Pin on the answer. It stays here.</p>
          ) : (
            <div className="space-y-1.5">
              {pins.map(id => (
                <button key={id} onClick={() => showPinned(id)}
                  className="w-full flex items-center gap-2 text-sm font-medium text-left hover:opacity-80"
                  style={{ color: '#1E293B' }}>
                  <Pin size={13} style={{ color: '#8B5CF6' }} /> {PIN_LABELS[id]}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      </div>
    </Layout>
  )
}
