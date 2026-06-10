'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import {
  Shield, Users, FileText, Package, UserCheck,
  Search, Edit, CheckCircle, RefreshCw, Brain,
  Send, TrendingUp, DollarSign, Zap, BarChart3
} from 'lucide-react'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'
const ALL_PLANS = ['CRM Starter', 'ERP Basic', 'Business', 'Complete']

export default function Admin() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ leads: 0, invoices: 0, products: 0, employees: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newPlan, setNewPlan] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ai' | 'system'>('overview')
  const [successMsg, setSuccessMsg] = useState('')

  // AI states
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiChat, setAiChat] = useState<{ role: string; content: string }[]>([
    {
      role: 'ai',
      content: '👋 Hello Omkar! I am your Samyojak AI assistant. I can analyze your business data, give insights on leads, revenue, and help you grow. What would you like to know?'
    }
  ])

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/dashboard')
      return
    }
    // Ensure admin has Complete plan
    await supabase.auth.updateUser({
      data: { plan: 'Complete', is_admin: true }
    })
    setAuthorized(true)
    loadData()
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const { airtable } = await import('@/lib/airtable')
      const [l, i, p, e] = await Promise.all([
        airtable.get('Leads'),
        airtable.get('Invoices'),
        airtable.get('Products'),
        airtable.get('Employees'),
      ])
      setStats({
        leads: l.records?.length || 0,
        invoices: i.records?.length || 0,
        products: p.records?.length || 0,
        employees: e.records?.length || 0,
      })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUsers([{
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        plan: user.user_metadata?.plan || 'No Plan',
        full_name: user.user_metadata?.full_name || 'N/A',
        company: user.user_metadata?.company || 'N/A',
      }])
    }
  }

  useEffect(() => {
    if (authorized && activeTab === 'users') loadUsers()
  }, [authorized, activeTab])

  const handleUpdatePlan = async () => {
    if (!selectedUser || !newPlan) return
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { plan: newPlan } })
      setSuccessMsg(`Plan updated to ${newPlan}!`)
      setTimeout(() => setSuccessMsg(''), 3000)
      loadUsers()
      setSelectedUser(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const sendAiMessage = async () => {
    if (!aiMessage.trim() || aiLoading) return
    const userMsg = aiMessage.trim()
    setAiMessage('')
    setAiChat(prev => [...prev, { role: 'user', content: userMsg }])
    setAiLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: {
            totalLeads: stats.leads,
            totalInvoices: stats.invoices,
            totalProducts: stats.products,
            totalEmployees: stats.employees,
            businessName: 'Samyojak',
          }
        }),
      })
      const data = await res.json()
      setAiChat(prev => [...prev, {
        role: 'ai',
        content: data.reply || 'Sorry I could not process that. Try again.'
      }])
    } catch (e) {
      setAiChat(prev => [...prev, {
        role: 'ai',
        content: 'Connection error. Check your GROQ_API_KEY in Vercel.'
      }])
    }
    setAiLoading(false)
  }

  const quickPrompts = [
    'Analyze my business health based on current data',
    'How can I get my first 10 paying customers?',
    'What marketing strategy should I use this week?',
    'How to improve my lead conversion rate?',
    'Give me a revenue forecast for next 3 months',
  ]

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (!authorized) return null

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#8B5CF6' }}>
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin — Master Control
            </h2>
            <p className="text-gray-500 text-sm">Complete Plan · Full Access · {ADMIN_EMAIL}</p>
          </div>
          <button onClick={loadData} className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'users', label: '👥 Users' },
            { key: 'ai', label: '🤖 AI Assistant' },
            { key: 'system', label: '⚙️ System' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.key ? '#8B5CF6' : 'transparent',
                color: activeTab === tab.key ? '#8B5CF6' : '#64748B',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Leads', value: stats.leads, icon: Users, color: '#8B5CF6', bg: '#EDE9FE' },
                    { label: 'Total Invoices', value: stats.invoices, icon: FileText, color: '#34D399', bg: '#D1FAE5' },
                    { label: 'Products', value: stats.products, icon: Package, color: '#FBBF24', bg: '#FEF3C7' },
                    { label: 'Employees', value: stats.employees, icon: UserCheck, color: '#F472B6', bg: '#FCE7F3' },
                  ].map(m => (
                    <div key={m.label} className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
                      style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                        <m.icon size={20} style={{ color: m.color }} />
                      </div>
                      <p className="text-gray-500 text-xs mb-1">{m.label}</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white"
                        style={{ fontFamily: 'Outfit' }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => setActiveTab('users')}
                    className="p-5 rounded-2xl text-left hover:shadow-md transition-all"
                    style={{ border: '2px solid #8B5CF6', background: '#EDE9FE' }}>
                    <Users size={24} style={{ color: '#8B5CF6' }} className="mb-2" />
                    <p className="font-black" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Manage Users</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>View and update user plans</p>
                  </button>
                  <button onClick={() => setActiveTab('ai')}
                    className="p-5 rounded-2xl text-left hover:shadow-md transition-all"
                    style={{ border: '2px solid #34D399', background: '#D1FAE5' }}>
                    <Brain size={24} style={{ color: '#34D399' }} className="mb-2" />
                    <p className="font-black" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>AI Assistant</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>Business insights and strategy</p>
                  </button>
                  <button onClick={() => setActiveTab('system')}
                    className="p-5 rounded-2xl text-left hover:shadow-md transition-all"
                    style={{ border: '2px solid #FBBF24', background: '#FEF3C7' }}>
                    <Shield size={24} style={{ color: '#FBBF24' }} className="mb-2" />
                    <p className="font-black" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>System Health</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>Check all services status</p>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-[#1a2740] dark:text-white"
                />
              </div>
              <button onClick={loadUsers}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: '#8B5CF6' }}>
                Refresh
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a2740] rounded-2xl overflow-x-auto"
              style={{ border: '2px solid #E2E8F0' }}>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#0A1628]">
                  <tr>
                    {['User', 'Email', 'Plan', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                        No users found. Users appear here after signup.
                      </td>
                    </tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ background: '#8B5CF6' }}>
                            {(user.full_name || user.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm dark:text-white">{user.full_name}</p>
                            <p className="text-xs text-gray-400">{user.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.plan === 'Complete' ? 'bg-purple-100 text-purple-700' :
                          user.plan === 'Business' ? 'bg-blue-100 text-blue-700' :
                          user.plan === 'ERP Basic' ? 'bg-green-100 text-green-700' :
                          user.plan === 'CRM Starter' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => { setSelectedUser(user); setNewPlan(user.plan) }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ color: '#8B5CF6', border: '1px solid #8B5CF6' }}>
                          <Edit size={12} /> Change Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md"
                  style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
                  <h3 className="font-black text-lg mb-2 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                    Change Plan
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{selectedUser.email}</p>
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300">Current Plan</label>
                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-sm dark:text-white">
                      {selectedUser.plan}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300">New Plan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_PLANS.map(p => (
                        <button key={p} onClick={() => setNewPlan(p)}
                          className="p-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: newPlan === p ? '#8B5CF6' : '#F8FAFC',
                            color: newPlan === p ? 'white' : '#1E293B',
                            border: `2px solid ${newPlan === p ? '#8B5CF6' : '#E2E8F0'}`,
                          }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedUser(null)}
                      className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">
                      Cancel
                    </button>
                    <button onClick={handleUpdatePlan} disabled={saving}
                      className="flex-1 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                      style={{ background: '#8B5CF6' }}>
                      {saving ? 'Saving...' : 'Update Plan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl" style={{ background: '#0F172A', border: '2px solid #334155' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#8B5CF6' }}>
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white" style={{ fontFamily: 'Outfit' }}>
                    Samyojak AI — Business Intelligence
                  </h3>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    Powered by Groq · llama3-8b-8192 · Free forever
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Leads', value: stats.leads, icon: TrendingUp, color: '#8B5CF6' },
                  { label: 'Invoices', value: stats.invoices, icon: DollarSign, color: '#34D399' },
                  { label: 'Products', value: stats.products, icon: Package, color: '#FBBF24' },
                  { label: 'Employees', value: stats.employees, icon: UserCheck, color: '#F472B6' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">Quick Questions</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setAiMessage(prompt); }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-80 transition-all"
                    style={{ background: '#EDE9FE', color: '#8B5CF6', border: '1.5px solid #8B5CF6' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid #E2E8F0', background: 'white' }}>
              <div className="p-4 border-b border-gray-100 flex items-center gap-2"
                style={{ background: '#F8FAFC' }}>
                <Brain size={16} style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-bold" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  AI Chat
                </span>
              </div>

              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {aiChat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? '#8B5CF6' : '#F8FAFC',
                        color: msg.role === 'user' ? 'white' : '#1E293B',
                        border: msg.role === 'user' ? 'none' : '1.5px solid #E2E8F0',
                        fontFamily: 'Plus Jakarta Sans',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl text-sm"
                      style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#64748B' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    value={aiMessage}
                    onChange={e => setAiMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                    placeholder="Ask anything about your business..."
                    className="flex-1 px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '2px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans' }}
                    onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                  <button
                    onClick={sendAiMessage}
                    disabled={aiLoading || !aiMessage.trim()}
                    className="px-4 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                    style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: '#94A3B8' }}>
                  Powered by Groq AI · Free · Fast · Private
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                System Health
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Vercel Hosting', status: 'Operational' },
                  { label: 'Supabase Auth', status: 'Operational' },
                  { label: 'Airtable Database', status: 'Operational' },
                  { label: 'Dodo Payments', status: 'Live Mode' },
                  { label: 'Groq AI', status: 'Active — Free Tier' },
                  { label: 'Rate Limiting', status: 'Active — 5 attempts' },
                  { label: 'Session Timeout', status: 'Active — 30 minutes' },
                  { label: 'Plan Locking', status: 'Active — Module access controlled' },
                  { label: 'Geo Pricing', status: 'Active — 3 regions' },
                  { label: 'White Label', status: 'Coming Soon' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-xs font-semibold text-green-600">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Admin Controls
              </h3>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await supabase.auth.updateUser({ data: { plan: 'Complete' } })
                    setSuccessMsg('Your plan set to Complete!')
                    setTimeout(() => setSuccessMsg(''), 3000)
                  }}
                  className="w-full p-3 rounded-xl text-sm font-medium text-left"
                  style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#5B21B6' }}>
                  🔓 Set my account to Complete Plan
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('samyojak-tour-done')
                    router.push('/dashboard')
                  }}
                  className="w-full p-3 rounded-xl text-sm font-medium text-left"
                  style={{ background: '#FEF3C7', border: '2px solid #FBBF24', color: '#92400E' }}>
                  🔄 Reset onboarding tour
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/')
                  }}
                  className="w-full p-3 rounded-xl text-sm font-medium text-left"
                  style={{ background: '#FEE2E2', border: '2px solid #FCA5A5', color: '#DC2626' }}>
                  🚪 Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
