'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata } from '@/lib/planAccess'
import { Brain, Send, Lock, Zap } from 'lucide-react'

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

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
}

export default function AIAssistant() {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState('')
  const [canUseAI, setCanUseAI] = useState(false)
  const [checking, setChecking] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [greetingLoading, setGreetingLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser(user)
      const userPlan = getPlanFromMetadata(user) || 'No Plan'
      setPlan(userPlan)
      const admin = user.email === ADMIN_EMAIL
      setIsAdmin(admin)
      setUserId(user.id)
      const hasAI = AI_PLANS.includes(userPlan) || admin || user.user_metadata?.is_demo
      setCanUseAI(hasAI)
      setChecking(false)
      if (hasAI) loadGreeting(user.id)
    })
  }, [])

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

  const sendMessage = async (text?: string) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')

    const userMsg: Message = {
      role: 'user',
      text: q,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, userId }),
      })
      const data = await res.json()
      const aiMsg: Message = {
        role: 'ai',
        text: data.reply || 'No response. Please try again.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      const errMsg: Message = {
        role: 'ai',
        text: 'Connection error. Please check your internet and try again.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errMsg])
    }
    setLoading(false)
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#8B5CF6' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              AI Business Intelligence
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-xs text-green-500">Live — reading your real business data</p>
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

        {/* Quick questions */}
        {messages.length === 0 && (
          <div className="mb-4 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-400">
              Quick questions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q}
                  onClick={() => sendMessage(q)}
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
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white'
                  : 'dark:text-gray-200 text-gray-800'
              }`}
                style={{
                  background: msg.role === 'user'
                    ? '#8B5CF6'
                    : 'white',
                  border: msg.role === 'ai' ? '1.5px solid #E2E8F0' : 'none',
                }}>
                {msg.text}
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
        </div>

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your leads, invoices, stock, team, projects..."
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
