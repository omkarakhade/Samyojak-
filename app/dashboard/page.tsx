'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { airtable } from '@/lib/airtable'
import { useRouter } from 'next/navigation'
import {
  Users, FileText, Package, UserCheck,
  FolderOpen, TrendingUp, Brain, Send,
  AlertCircle, Star
} from 'lucide-react'
import { getPlanFromMetadata } from '@/lib/planAccess'

const planOrder = ['CRM Starter', 'ERP Basic', 'Business', 'Complete']

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('No Plan')
  const [stats, setStats] = useState({ leads: 0, invoices: 0, products: 0, employees: 0, projects: 0 })
  const [loading, setLoading] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReply, setAiReply] = useState('')
  const [aiInput, setAiInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      setPlan(getPlanFromMetadata(user) || 'No Plan')
      loadStats()
      loadAIGreeting(user)
    })
  }, [router])

  const loadStats = async () => {
    try {
      const [l, i, p, e, pr] = await Promise.all([
        airtable.get('Leads'),
        airtable.get('Invoices'),
        airtable.get('Products'),
        airtable.get('Employees'),
        airtable.get('Projects'),
      ])
      setStats({
        leads: l.records?.length || 0,
        invoices: i.records?.length || 0,
        products: p.records?.length || 0,
        employees: e.records?.length || 0,
        projects: pr.records?.length || 0,
      })
    } catch (e) {
      console.error('Stats load error:', e)
    }
    setLoading(false)
  }

  const loadAIGreeting = async (u: any) => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a quick encouraging business overview and the one most important thing I should do today',
          isOnboarding: false,
        }),
      })
      const data = await res.json()
      setAiMessage(data.reply || '')
    } catch {
      setAiMessage('🚀 Your ERP is ready! Add leads in CRM and create invoices to start tracking your business growth.')
    }
    setAiLoading(false)
  }

  const askAI = async () => {
    if (!aiInput.trim() || aiLoading) return
    const question = aiInput.trim()
    setAiInput('')
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      })
      const data = await res.json()
      setAiReply(data.reply || '')
    } catch {
      setAiReply('AI temporarily unavailable.')
    }
    setAiLoading(false)
  }

  const planIndex = planOrder.indexOf(plan)

  const modules = [
    { label: 'Leads', value: stats.leads, icon: Users, color: '#8B5CF6', bg: '#EDE9FE', path: '/crm', emoji: '👥' },
    { label: 'Invoices', value: stats.invoices, icon: FileText, color: '#F472B6', bg: '#FCE7F3', path: '/invoices', emoji: '📄' },
    { label: 'Products', value: stats.products, icon: Package, color: '#FBBF24', bg: '#FEF3C7', path: '/inventory', emoji: '📦' },
    { label: 'Employees', value: stats.employees, icon: UserCheck, color: '#34D399', bg: '#D1FAE5', path: '/hr', emoji: '👥' },
    { label: 'Projects', value: stats.projects, icon: FolderOpen, color: '#8B5CF6', bg: '#EDE9FE', path: '/projects', emoji: '🎯' },
  ]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* Greeting */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              {greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              plan === 'Complete' ? 'bg-purple-100 text-purple-700' :
              plan === 'Business' ? 'bg-blue-100 text-blue-700' :
              plan === 'ERP Basic' ? 'bg-green-100 text-green-700' :
              plan === 'CRM Starter' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {plan}
            </span>
          </div>
        </div>

        {/* AI Business Intelligence Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0F172A', border: '2px solid #334155', boxShadow: '6px 6px 0px #8B5CF6' }}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#8B5CF6' }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-white" style={{ fontFamily: 'Outfit' }}>
                  AI Business Intelligence
                </p>
                <p className="text-xs text-green-400">Reading your live Airtable data</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-green-400">Live</span>
              </div>
            </div>

            {aiLoading && !aiMessage ? (
              <div className="flex items-center gap-2 py-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-xs text-gray-400">Analyzing your data...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#C4B5FD', fontFamily: 'Plus Jakarta Sans' }}>
                {aiMessage}
              </p>
            )}

            {aiReply && (
              <div className="mb-4 p-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(139,92,246,0.2)', color: '#E9D5FF', border: '1px solid rgba(139,92,246,0.3)', fontFamily: 'Plus Jakarta Sans' }}>
                {aiReply}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askAI()}
                placeholder="Ask AI about your business..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontFamily: 'Plus Jakarta Sans' }}
              />
              <button
                onClick={askAI}
                disabled={aiLoading || !aiInput.trim()}
                className="px-4 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-40 flex items-center gap-2"
                style={{ background: '#8B5CF6' }}
              >
                <Send size={16} />
              </button>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {['How are my leads?', 'Any overdue invoices?', 'Low stock alerts?', 'Team summary'].map(q => (
                <button
                  key={q}
                  onClick={() => { setAiInput(q); setTimeout(askAI, 100) }}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {modules.map(m => (
              <a key={m.label} href={m.path}
                className="block bg-white dark:bg-[#1a2740] rounded-2xl p-5 hover:shadow-lg transition-all"
                style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                  <m.icon size={20} style={{ color: m.color }} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold mb-1">{m.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  {m.value}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* Plan Progress */}
        {plan !== 'Complete' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
            style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} style={{ color: '#FBBF24' }} />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Outfit' }}>
                Your Plan Progress
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {planOrder.map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    i <= planIndex ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                  }`}>
                    {p}
                  </div>
                  {i < planOrder.length - 1 && (
                    <div className={`w-4 h-0.5 ${i < planIndex ? 'bg-violet-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Upgrade to <strong style={{ color: '#8B5CF6' }}>
                {planOrder[planIndex + 1] || 'Complete'}
              </strong> to unlock more modules
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Lead', path: '/crm', color: '#8B5CF6', bg: '#EDE9FE', emoji: '➕' },
            { label: 'Create Invoice', path: '/invoices', color: '#F472B6', bg: '#FCE7F3', emoji: '📄' },
            { label: 'Add Product', path: '/inventory', color: '#FBBF24', bg: '#FEF3C7', emoji: '📦' },
            { label: 'New Project', path: '/projects', color: '#34D399', bg: '#D1FAE5', emoji: '🎯' },
          ].map(a => (
            <a key={a.label} href={a.path}
              className="block p-4 rounded-2xl text-center hover:shadow-md transition-all"
              style={{ background: a.bg, border: `2px solid ${a.color}` }}
            >
              <span className="text-2xl block mb-1">{a.emoji}</span>
              <span className="text-sm font-bold" style={{ color: a.color, fontFamily: 'Outfit' }}>
                {a.label}
              </span>
            </a>
          ))}
        </div>

      </div>
    </Layout>
  )
}
