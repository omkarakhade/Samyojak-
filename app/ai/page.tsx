'use client'
import React, { useEffect, useRef, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata } from '@/lib/planAccess'
import { Brain, Send, Lock, Zap, Check, X, Undo2 } from 'lucide-react'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'
const AI_PLANS = ['Complete']

const QUICK_QUESTIONS = [
  'How are my leads performing?',
  'Which invoices are overdue?',
  'Any low stock alerts?',
  'What should I focus on today?',
  'Give me a revenue summary',
  'How is my team doing?',
  'Which projects are overdue?',
  'What is my conversion rate?',
]

type RecordData = Record<string, string | number>

interface ProposedAction {
  module: string
  records: RecordData[]
}

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
  actions?: ProposedAction[]
  status?: 'pending' | 'saved' | 'cancelled' | 'undone'
  batchId?: string
  count?: number
}

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function looksLikeQuestion(text: string) {
  const t = text.trim()
  return t.endsWith('?') && !/\d/.test(t)
}

function PreviewTable({ actions }: { actions: ProposedAction[] }) {
  return (
    <div className="space-y-3 mt-3">
      {actions.map((action, i) => {
        const keys = Array.from(new Set(action.records.flatMap(r => Object.keys(r))))
        return (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0' }}>
            <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wide"
              style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
              {action.module} · {action.records.length} record{action.records.length > 1 ? 's' : ''}
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
                  {action.records.map((r, ri) => (
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

export default function AIAssistant() {
  const [plan, setPlan] = useState('')
  const [userId, setUserId] = useState('')
  const [canUseAI, setCanUseAI] = useState(false)
  const [checking, setChecking] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyIndex, setBusyIndex] = useState<number | null>(null)
  const [greeting, setGreeting] = useState('')
  const [greetingLoading, setGreetingLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const userPlan = getPlanFromMetadata(user) || 'No Plan'
      setPlan(userPlan)
      const admin = user.email === ADMIN_EMAIL
      setUserId(user.id)
      const hasAI = AI_PLANS.includes(userPlan) || admin || user.user_metadata?.is_demo
      setCanUseAI(!!hasAI)
      setChecking(false)
      if (hasAI) loadGreeting(user.id)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadGreeting = async (uid: string) => {
    setGreetingLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a brief business overview and the most important thing to focus on today. Be specific and use actual numbers from my data.',
          userId: uid,
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
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q, userId }),
    })
    const data = await res.json()
    return data.reply || 'No response. Please try again.'
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
        addAiMessage({ text: await askAssistant(q) })
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
        } else {
          addAiMessage({ text: await askAssistant(q) })
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
        updateMessage(index, { status: 'saved', batchId: data.batchId, count: data.count })
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
    if (!msg?.batchId || busyIndex !== null) return
    setBusyIndex(index)
    try {
      const { ok, data } = await callAgent({ action: 'undo', batchId: msg.batchId })
      if (ok) {
        updateMessage(index, { status: 'undone' })
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
            AI Business Intelligence
          </h2>
          <p className="text-gray-400 mb-2">
            Available on the <strong className="text-white">Complete ERP</strong> plan.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            The AI reads your live CRM, invoices, inventory, HR, and project data and gives specific actionable answers about your actual business numbers.
          </p>
          <div className="space-y-3 mb-8">
            {[
              '🔴 How are my leads — live count, conversion rate',
              '🔴 Which invoices are overdue — exact amounts',
              '🔴 Low stock alerts — specific products',
              '🔴 Payroll overview — team and total cost',
              '🔴 Project status — overdue and at risk',
            ].map(f => (
              <p key={f} className="text-sm text-gray-400">{f}</p>
            ))}
          </div>
          <a href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black text-white hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid rgba(139,92,246,0.5)' }}>
            <Zap size={16} /> Upgrade to Complete Plan
          </a>
          <p className="text-xs text-gray-600 mt-3">Current plan: {plan || 'No Plan'}</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col h-full max-w-3xl mx-auto" style={{ height: 'calc(100vh - 120px)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#8B5CF6' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              AI Business Intelligence
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-xs text-green-500">Live — reads your data and can record it for you</p>
            </div>
          </div>
        </div>

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
              <strong>Try recording something:</strong> "Invoiced Rahul Sharma 45000 for the website, due Nov 10.
              New lead Sneha, call her Monday." You'll see a preview and nothing is saved until you confirm.
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
                  msg.actions ? 'w-full max-w-full md:max-w-xl' : 'max-w-xs md:max-w-md lg:max-w-lg'
                } ${msg.role === 'user' ? 'text-white' : 'dark:text-gray-200 text-gray-800'}`}
                style={{
                  background: msg.role === 'user' ? '#8B5CF6' : 'white',
                  border: msg.role === 'ai' ? '1.5px solid #E2E8F0' : 'none',
                }}>
                {msg.text}

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
                      ✅ Saved {msg.count} record{msg.count && msg.count > 1 ? 's' : ''}
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
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#94A3B8' }}>Undone. Those records were removed.</p>
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
    </Layout>
  )
}
