'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Copy, RefreshCw, Check, Link, Shield, Users,
  Eye, Trash2, Search, AlertCircle, BarChart3,
  Key, UserCheck, Clock, Globe
} from 'lucide-react'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

const PRESET_TOKENS = [
  'samyojak2025',
  'demo-investor',
  'demo-client',
  'demo-press',
  'demo-trial',
  'product-hunt',
  'linkedin-demo',
  'reddit-demo',
]

const TABS = ['overview', 'users', 'demo-links', 'system'] as const
type Tab = typeof TABS[number]

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Demo link state
  const [demoToken, setDemoToken] = useState('samyojak2025')
  const [customToken, setCustomToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [linkNote, setLinkNote] = useState('')
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([])

  // Users state
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userError, setUserError] = useState('')

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalLeads: 0,
    totalInvoices: 0,
  })

  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }
      setUser(user)
      setLoading(false)
      const saved = localStorage.getItem('samyojak_demo_links')
      if (saved) {
        try { setGeneratedLinks(JSON.parse(saved)) } catch {}
      }
      loadStats()
    })
  }, [router])

  const loadStats = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      setStats(prev => ({ ...prev, totalUsers: count || 0 }))
    } catch {
      // profiles table may not exist — use auth admin instead
      setStats(prev => ({ ...prev, totalUsers: 0 }))
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    setUserError('')
    try {
      // Try to get users via supabase auth admin
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) throw error
      setUsers(data.users || [])
    } catch (e: any) {
      // Admin API may not be available client-side — show available info
      setUserError('User list requires service role key. Showing current session user only.')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUsers([user])
    }
    setUsersLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
  }, [activeTab])

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin
    return 'https://samyojak.vercel.app'
  }

  const generateLink = (token: string) => `${getBaseUrl()}/demo?token=${token}`

  const copyLink = (token: string) => {
    const link = generateLink(token)
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      const entry = `${link}${linkNote ? ` — ${linkNote}` : ''} — ${new Date().toLocaleDateString('en-IN')}`
      const updated = [entry, ...generatedLinks.slice(0, 14)]
      setGeneratedLinks(updated)
      localStorage.setItem('samyojak_demo_links', JSON.stringify(updated))
    })
  }

  const generateRandom = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const token = 'demo-' + Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
    setCustomToken(token)
    setDemoToken(token)
  }

  const whatsappShare = (token: string) => {
    const link = generateLink(token)
    const msg = encodeURIComponent(
      `Hi! Here's a demo link to try Samyojak ERP — the ERP that adapts to you.\n\n🔗 ${link}\n\nExplore CRM, Invoices, Inventory, HR, Projects, BI Dashboard, and AI. No login needed.`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const linkedinShare = (token: string) => {
    const link = generateLink(token)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank')
  }

  const filteredUsers = users.filter(u =>
    !userSearch ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.user_metadata?.full_name || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="space-y-5 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEE2E2', border: '2px solid #EF4444' }}>
            <Shield size={20} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Admin Panel
            </h2>
            <p className="text-gray-500 text-sm">Full control — {user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview', icon: BarChart3 },
            { id: 'users', label: '👥 Users', icon: Users },
            { id: 'demo-links', label: '🔗 Demo Links', icon: Key },
            { id: 'system', label: '⚙️ System', icon: Globe },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className="px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.id ? '#8B5CF6' : 'transparent',
                color: activeTab === tab.id ? '#8B5CF6' : '#64748B',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers || users.length || '—', color: '#8B5CF6', bg: '#EDE9FE', icon: Users },
                { label: 'Admin Email', value: 'Active', color: '#34D399', bg: '#D1FAE5', icon: UserCheck },
                { label: 'Demo Links', value: generatedLinks.length, color: '#FBBF24', bg: '#FEF3C7', icon: Key },
                { label: 'System Status', value: '✅ Live', color: '#34D399', bg: '#D1FAE5', icon: Globe },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-2xl bg-white dark:bg-[#1a2740]"
                  style={{ border: '2px solid #E2E8F0' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: s.bg }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{s.label}</p>
                  <p className="text-xl font-black dark:text-white" style={{ fontFamily: 'Outfit', color: s.color }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick actions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2740]"
                style={{ border: '2px solid #E2E8F0' }}>
                <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Generate Demo Link', action: () => setActiveTab('demo-links'), color: '#8B5CF6', emoji: '🔗' },
                    { label: 'View All Users', action: () => setActiveTab('users'), color: '#34D399', emoji: '👥' },
                    { label: 'Open Debug Page', action: () => window.open('/debug', '_blank'), color: '#FBBF24', emoji: '🐛' },
                    { label: 'View System Status', action: () => setActiveTab('system'), color: '#F472B6', emoji: '⚙️' },
                  ].map(a => (
                    <button key={a.label} onClick={a.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity text-left"
                      style={{ background: `${a.color}15`, border: `1.5px solid ${a.color}30` }}>
                      <span className="text-base">{a.emoji}</span>
                      <span className="text-sm font-bold" style={{ color: a.color }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent demo links */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2740]"
                style={{ border: '2px solid #E2E8F0' }}>
                <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  Recent Demo Links
                </h3>
                {generatedLinks.length === 0 ? (
                  <p className="text-xs text-gray-400">No links generated yet. Go to Demo Links tab.</p>
                ) : (
                  <div className="space-y-2">
                    {generatedLinks.slice(0, 4).map((link, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <p className="text-xs text-gray-500 flex-1 truncate font-mono">{link}</p>
                        <button onClick={() => navigator.clipboard.writeText(link.split(' ')[0])}
                          className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0">
                          <Copy size={11} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:bg-[#1a2740] dark:text-white"
                />
              </div>
              <button onClick={loadUsers}
                className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {userError && (
              <div className="p-3 rounded-xl flex items-start gap-2 text-sm"
                style={{ background: '#FEF3C7', border: '1.5px solid #FBBF24', color: '#92400E' }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Note</p>
                  <p>{userError}</p>
                  <p className="mt-1 text-xs">To see all users, add SUPABASE_SERVICE_ROLE_KEY as a server-side env variable and use a server action instead of client-side auth.admin.listUsers().</p>
                </div>
              </div>
            )}

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0A1628]">
                    <tr>
                      {['User', 'Plan', 'Created', 'Last Sign In', 'Status'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                          No users found
                        </td>
                      </tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium dark:text-white">
                              {u.user_metadata?.full_name || 'No name'}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: u.user_metadata?.plan ? '#EDE9FE' : '#F1F5F9',
                              color: u.user_metadata?.plan ? '#8B5CF6' : '#64748B',
                            }}>
                            {u.user_metadata?.plan || 'No Plan'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {u.last_sign_in_at
                            ? new Date(u.last_sign_in_at).toLocaleDateString('en-IN')
                            : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            u.email_confirmed_at
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {u.email_confirmed_at ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-gray-50 dark:border-white/5">
                  <p className="text-xs text-gray-400">
                    Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEMO LINKS TAB */}
        {activeTab === 'demo-links' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
              style={{ border: '2px solid #8B5CF6', boxShadow: '6px 6px 0px #8B5CF6' }}>
              <div className="flex items-center gap-2 mb-5">
                <Key size={20} style={{ color: '#8B5CF6' }} />
                <h3 className="font-black text-lg dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  Demo Link Generator
                </h3>
              </div>

              {/* Preset tokens */}
              <p className="text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300"
                style={{ fontFamily: 'Outfit' }}>
                Quick Select Token
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_TOKENS.map(token => (
                  <button key={token}
                    onClick={() => { setDemoToken(token); setCustomToken('') }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                    style={{
                      background: demoToken === token && !customToken ? '#8B5CF6' : '#EDE9FE',
                      color: demoToken === token && !customToken ? 'white' : '#8B5CF6',
                      border: `2px solid ${demoToken === token && !customToken ? '#8B5CF6' : '#C4B5FD'}`,
                    }}>
                    {token}
                  </button>
                ))}
              </div>

              {/* Custom token */}
              <p className="text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300"
                style={{ fontFamily: 'Outfit' }}>
                Custom Token
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={customToken}
                  onChange={e => { setCustomToken(e.target.value); if (e.target.value) setDemoToken(e.target.value) }}
                  placeholder="e.g. client-john-doe or investor-xyz"
                  className="flex-1 border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
                />
                <button onClick={generateRandom}
                  className="px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity flex items-center gap-2 flex-shrink-0"
                  style={{ background: '#F1F5F9', color: '#64748B' }}>
                  <RefreshCw size={14} /> Random
                </button>
              </div>

              {/* Note */}
              <p className="text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300"
                style={{ fontFamily: 'Outfit' }}>
                Note (for your records)
              </p>
              <input
                type="text"
                value={linkNote}
                onChange={e => setLinkNote(e.target.value)}
                placeholder="e.g. Sent to investor on LinkedIn June 26"
                className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
              />

              {/* Preview */}
              <div className="p-3 rounded-xl mb-4 flex items-center gap-2"
                style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                <Eye size={14} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 flex-1 truncate font-mono">
                  {generateLink(demoToken || 'samyojak2025')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyLink(demoToken || 'samyojak2025')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-all"
                  style={{ background: copied ? '#34D399' : '#8B5CF6' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => whatsappShare(demoToken || 'samyojak2025')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: '#25D366' }}>
                  📱 WhatsApp
                </button>
                <button
                  onClick={() => linkedinShare(demoToken || 'samyojak2025')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: '#0A66C2' }}>
                  💼 LinkedIn
                </button>
                <a
                  href={generateLink(demoToken || 'samyojak2025')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ background: '#F1F5F9', color: '#64748B' }}>
                  <Eye size={15} /> Preview
                </a>
              </div>
            </div>

            {/* Link history */}
            {generatedLinks.length > 0 && (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
                style={{ border: '2px solid #E2E8F0' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-sm dark:text-white" style={{ fontFamily: 'Outfit' }}>
                    Generated Links History ({generatedLinks.length})
                  </h3>
                  <button
                    onClick={() => { setGeneratedLinks([]); localStorage.removeItem('samyojak_demo_links') }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {generatedLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl"
                      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <p className="text-xs text-gray-500 flex-1 truncate font-mono">{link}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(link.split(' ')[0])}
                        className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0">
                        <Copy size={11} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="p-4 rounded-2xl" style={{ background: '#EDE9FE', border: '1.5px solid #8B5CF6' }}>
              <h4 className="font-black text-sm mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                How demo links work
              </h4>
              <div className="space-y-1">
                {[
                  'Person opens the link — no login required',
                  'They see full ERP dashboard with demo data',
                  'AI assistant works with pre-filled demo answers',
                  'Cannot access or corrupt real user data',
                  'Change token here to revoke access instantly',
                  'Each token = one shareable link = one audience segment',
                ].map(s => (
                  <p key={s} className="text-xs flex items-start gap-1.5" style={{ color: '#64748B' }}>
                    <span style={{ color: '#8B5CF6' }}>→</span> {s}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Product', value: 'Samyojak ERP', icon: '🚀' },
                { label: 'Version', value: 'Next.js 15.3.6', icon: '⚡' },
                { label: 'Database', value: 'Airtable', icon: '🗄️' },
                { label: 'Auth', value: 'Supabase', icon: '🔒' },
                { label: 'AI Model', value: 'llama-3.1-8b-instant (Groq)', icon: '🤖' },
                { label: 'Payments', value: 'Dodo Payments', icon: '💳' },
                { label: 'Email', value: 'Resend', icon: '📧' },
                { label: 'Deployment', value: 'Vercel', icon: '▲' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-[#1a2740]"
                  style={{ border: '1.5px solid #E2E8F0' }}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">{s.label}</p>
                    <p className="text-sm font-bold dark:text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <a href="/debug" target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: '#FEF3C7', color: '#92400E', border: '1.5px solid #FBBF24' }}>
                🐛 Open Debug Page
              </a>
              <a href="https://airtable.com" target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: '#EDE9FE', color: '#8B5CF6', border: '1.5px solid #8B5CF6' }}>
                📊 Open Airtable
              </a>
              <a href="https://vercel.com/dashboard" target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: '#F1F5F9', color: '#1E293B', border: '1.5px solid #E2E8F0' }}>
                ▲ Vercel Dashboard
              </a>
              <a href="https://supabase.com/dashboard" target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: '#D1FAE5', color: '#065F46', border: '1.5px solid #34D399' }}>
                ⚡ Supabase Dashboard
              </a>
            </div>

            <div className="p-4 rounded-xl"
              style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
              <p className="text-sm font-bold text-green-800 mb-2">✅ All systems operational</p>
              <p className="text-xs text-green-700">
                Airtable · Supabase · Groq AI · Dodo Payments · Vercel — all connected and running.
                Check /debug page for detailed health status.
              </p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
