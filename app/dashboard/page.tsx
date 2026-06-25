'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Users, FileText, Package, UserCheck, FolderOpen, Brain, Send, Star, TrendingUp, Lock, FileCheck, BarChart3, UserPlus } from 'lucide-react'
import { getPlanFromMetadata } from '@/lib/planAccess'
import OnboardingTour from '@/components/OnboardingTour'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'
const AI_PLANS = ['Complete']
const planOrder = ['CRM Starter', 'ERP Basic', 'Business', 'Complete']

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('No Plan')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [stats, setStats] = useState({
    leads: 0, invoices: 0, products: 0,
    employees: 0, projects: 0, quotations: 0,
    convertedLeads: 0, paidInvoices: 0, overdueInvoices: 0,
    importedLeads: 0, importedInvoices: 0, importedProducts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [aiGreeting, setAiGreeting] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiReply, setAiReply] = useState('')
  const [aiChatLoading, setAiChatLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      const userPlan = getPlanFromMetadata(user) || 'No Plan'
      setPlan(userPlan)
      const admin = user.email === ADMIN_EMAIL
      setIsAdmin(admin)
      setUserId(user.id)
      loadStats(user.id)
      const hasAI = AI_PLANS.includes(userPlan) || admin || user.user_metadata?.is_demo
      if (hasAI) loadAIGreeting(user.id)
    })
  }, [router])

  // Check onboarding after user loads
  useEffect(() => {
    if (!user) return
    const seen = localStorage.getItem('samyojak_onboarding_done')
    if (!seen) setShowOnboarding(true)
  }, [user])

  const loadStats = async (uid: string) => {
    try {
      const [crm, invoices, inventory, hr, projects, quotations] = await Promise.allSettled([
        fetch(`/api/universal-data?userId=${uid}&module=CRM`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Invoices`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Inventory`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=HR`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Projects`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Quotations`).then(r => r.json()),
      ])

      const crmData = crm.status === 'fulfilled' ? crm.value : { records: [], total: 0 }
      const invData = invoices.status === 'fulfilled' ? invoices.value : { records: [], total: 0 }
      const prodData = inventory.status === 'fulfilled' ? inventory.value : { records: [], total: 0 }
      const hrData = hr.status === 'fulfilled' ? hr.value : { records: [], total: 0 }
      const projData = projects.status === 'fulfilled' ? projects.value : { records: [], total: 0 }
      const quoteData = quotations.status === 'fulfilled' ? quotations.value : { records: [], total: 0 }

      const allLeads = crmData.records || []
      const allInvoices = invData.records || []

      const converted = allLeads.filter((r: any) =>
        (r.data?.Status || r.data?.status || '').toLowerCase().includes('convert')
      ).length

      const paid = allInvoices.filter((r: any) =>
        (r.data?.['Payment Status'] || r.data?.status || '').toLowerCase() === 'paid'
      ).length

      const overdue = allInvoices.filter((r: any) =>
        (r.data?.['Payment Status'] || r.data?.status || '').toLowerCase().includes('overdue')
      ).length

      setStats({
        leads: crmData.total || 0,
        invoices: invData.total || 0,
        products: prodData.total || 0,
        employees: hrData.total || 0,
        projects: projData.total || 0,
        quotations: quoteData.total || 0,
        convertedLeads: converted,
        paidInvoices: paid,
        overdueInvoices: overdue,
        importedLeads: crmData.total || 0,
        importedInvoices: invData.total || 0,
        importedProducts: prodData.total || 0,
      })
    } catch (e) {
      console.error('Stats error:', e)
    }
    setLoading(false)
  }

  const loadAIGreeting = async (uid: string) => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me an encouraging business overview and the single most important thing I should focus on today',
          userId: uid,
        }),
      })
      const data = await res.json()
      setAiGreeting(data.reply || '')
    } catch {
      setAiGreeting('🚀 Your ERP is ready! Focus on following up with your top leads today.')
    }
    setAiLoading(false)
  }

  const askAI = async () => {
    if (!aiInput.trim() || aiChatLoading) return
    const q = aiInput.trim()
    setAiInput('')
    setAiChatLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, userId }),
      })
      const data = await res.json()
      setAiReply(data.reply || 'No response. Try again.')
    } catch {
      setAiReply('Connection error. Please try again.')
    }
    setAiChatLoading(false)
  }

  const canUseAI = AI_PLANS.includes(plan) || isAdmin || user?.user_metadata?.is_demo

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const planIndex = planOrder.indexOf(plan)

  const modules = [
    { label: 'Leads', value: stats.leads, sub: `${stats.convertedLeads} converted`, icon: Users, color: '#8B5CF6', bg: '#EDE9FE', path: '/crm' },
    { label: 'Quotations', value: stats.quotations, sub: 'sales quotes', icon: FileCheck, color: '#34D399', bg: '#D1FAE5', path: '/quotations' },
    { label: 'Invoices', value: stats.invoices, sub: `${stats.paidInvoices} paid`, icon: FileText, color: '#F472B6', bg: '#FCE7F3', path: '/invoices' },
    { label: 'Products', value: stats.products, sub: 'in inventory', icon: Package, color: '#FBBF24', bg: '#FEF3C7', path: '/inventory' },
    { label: 'Employees', value: stats.employees, sub: 'team members', icon: UserCheck, color: '#34D399', bg: '#D1FAE5', path: '/hr' },
    { label: 'Projects', value: stats.projects, sub: 'being tracked', icon: FolderOpen, color: '#8B5CF6', bg: '#EDE9FE', path: '/projects' },
  ]

  const quickActions = [
    { label: 'Add Lead', path: '/crm', color: '#8B5CF6', bg: '#EDE9FE', emoji: '👥' },
    { label: 'New Quote', path: '/quotations', color: '#34D399', bg: '#D1FAE5', emoji: '📋' },
    { label: 'Create Invoice', path: '/invoices', color: '#F472B6', bg: '#FCE7F3', emoji: '📄' },
    { label: 'Add Product', path: '/inventory', color: '#FBBF24', bg: '#FEF3C7', emoji: '📦' },
    { label: 'New Project', path: '/projects', color: '#8B5CF6', bg: '#EDE9FE', emoji: '🎯' },
    { label: 'BI Dashboard', path: '/bi', color: '#F472B6', bg: '#FCE7F3', emoji: '📊' },
  ]

  return (
    <Layout>
      <div className="space-y-6">

        {/* ONBOARDING TOUR — shows only on first visit */}
        {showOnboarding && (
          <OnboardingTour onDismiss={() => {
            setShowOnboarding(false)
            localStorage.setItem('samyojak_onboarding_done', '1')
          }} />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              {greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <span className="px-3 py-1.5 rounded-full text-xs font-black"
                style={{ background: '#EF4444', color: 'white' }}>
                🛡️ Admin
              </span>
            )}
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              plan === 'Complete' ? 'bg-purple-100 text-purple-700' :
              plan === 'Business' ? 'bg-blue-100 text-blue-700' :
              plan === 'ERP Basic' ? 'bg-green-100 text-green-700' :
              plan === 'CRM Starter' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'}`}>
              {plan}
            </span>
            {/* Restart onboarding button */}
            <button
              onClick={() => {
                localStorage.removeItem('samyojak_onboarding_done')
                setShowOnboarding(true)
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
              📖 Tour
            </button>
          </div>
        </div>

        {/* AI SECTION */}
        {canUseAI ? (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#0F172A', border: '2px solid #334155', boxShadow: '6px 6px 0px #8B5CF6' }}>
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
                  <p className="text-xs text-green-400">Reading your live data in real-time</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </div>

              {aiLoading ? (
                <div className="flex items-center gap-2 py-2 mb-4">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}></div>
                  ))}
                  <span className="text-xs text-gray-500">Analyzing your data...</span>
                </div>
              ) : aiGreeting ? (
                <p className="text-sm leading-relaxed mb-4"
                  style={{ color: '#C4B5FD', fontFamily: 'Plus Jakarta Sans' }}>
                  {aiGreeting}
                </p>
              ) : null}

              {(aiReply || aiChatLoading) && (
                <div className="mb-4 p-3 rounded-xl text-sm leading-relaxed"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#E9D5FF', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {aiChatLoading ? (
                    <div className="flex items-center gap-2">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}></div>
                      ))}
                    </div>
                  ) : aiReply}
                </div>
              )}

              <div className="flex gap-2 mb-3">
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && askAI()}
                  placeholder="Ask AI about your business..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                  }}
                />
                <button
                  onClick={askAI}
                  disabled={aiChatLoading || !aiInput.trim()}
                  className="px-4 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-40 flex-shrink-0"
                  style={{ background: '#8B5CF6' }}>
                  <Send size={16} />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  'How are my leads?',
                  'Any overdue invoices?',
                  'Low stock alerts?',
                  'What should I focus on?',
                ].map(q => (
                  <button key={q}
                    onClick={() => { setAiInput(q); setTimeout(askAI, 50) }}
                    className="px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{
                      background: 'rgba(139,92,246,0.2)',
                      color: '#C4B5FD',
                      border: '1px solid rgba(139,92,246,0.3)',
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#1E293B', border: '2px solid #334155' }}>
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.3)' }}>
                <Lock size={22} style={{ color: '#8B5CF6' }} />
              </div>
              <div className="flex-1">
                <p className="font-black text-white" style={{ fontFamily: 'Outfit' }}>
                  AI Business Intelligence
                </p>
                <p className="text-sm text-gray-500">
                  Upgrade to Complete plan to unlock AI that reads your live data
                </p>
              </div>
              <a href="/pricing"
                className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 hover:opacity-90 transition-opacity"
                style={{ background: '#8B5CF6', color: 'white' }}>
                Upgrade
              </a>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modules.map(m => (
              <a key={m.label} href={m.path}
                className="block bg-white dark:bg-[#1a2740] rounded-2xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5"
                style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold mb-1">{m.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  {m.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: m.color }}>{m.sub}</p>
              </a>
            ))}
          </div>
        )}

        {/* Alerts */}
        {stats.overdueInvoices > 0 && (
          <div className="p-4 rounded-xl flex items-center gap-3"
            style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-800">
                {stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-600">Follow up on payments to maintain cash flow</p>
            </div>
            <a href="/invoices" className="ml-auto text-xs font-bold text-red-700 hover:underline">
              View →
            </a>
          </div>
        )}

        {/* Plan Progress */}
        {plan !== 'Complete' && !isAdmin && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
            style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} style={{ color: '#FBBF24' }} />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Outfit' }}>
                Upgrade Your Plan
              </h3>
            </div>
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              {planOrder.map((p, i) => (
                <div key={p} className="flex items-center gap-1">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    i <= planIndex
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                  }`}>
                    {p}
                  </div>
                  {i < planOrder.length - 1 && (
                    <div className={`w-3 h-0.5 ${i < planIndex ? 'bg-violet-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Upgrade to{' '}
              <strong style={{ color: '#8B5CF6' }}>
                {planOrder[planIndex + 1] || 'Complete'}
              </strong>{' '}
              to unlock AI assistant and more modules
            </p>
          </div>
        )}

        {/* Business Snapshot */}
        <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
          style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: '#34D399' }} />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Outfit' }}>
              Business Snapshot
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Conversion Rate',
                value: stats.leads > 0
                  ? `${Math.round((stats.convertedLeads / stats.leads) * 100)}%`
                  : '0%',
                color: '#8B5CF6',
              },
              { label: 'Paid Invoices', value: `${stats.paidInvoices}/${stats.invoices}`, color: '#34D399' },
              {
                label: 'Overdue',
                value: stats.overdueInvoices,
                color: stats.overdueInvoices > 0 ? '#EF4444' : '#34D399',
              },
              { label: 'Team Size', value: stats.employees, color: '#FBBF24' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map(a => (
              <a key={a.label} href={a.path}
                className="block p-3 rounded-2xl text-center hover:shadow-md transition-all hover:-translate-y-0.5"
                style={{ background: a.bg, border: `2px solid ${a.color}` }}>
                <span className="text-xl block mb-1">{a.emoji}</span>
                <span className="text-xs font-bold" style={{ color: a.color, fontFamily: 'Outfit' }}>
                  {a.label}
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
