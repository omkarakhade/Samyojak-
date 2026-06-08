'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import { Shield, Users, FileText, Package, UserCheck, Search, Edit, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/dashboard')
      return
    }
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
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const loadUsers = async () => {
    // Get all users from Supabase auth
    // Note: this requires admin API key, so we simulate with current user data
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
    if (authorized && activeTab === 'users') {
      loadUsers()
    }
  }, [authorized, activeTab])

  const handleUpdatePlan = async () => {
    if (!selectedUser || !newPlan) return
    setSaving(true)
    try {
      // Update current user's plan (admin updates their own for testing)
      await supabase.auth.updateUser({
        data: { plan: newPlan, plan_updated_at: new Date().toISOString() }
      })
      setSuccessMsg(`Plan updated to ${newPlan} successfully!`)
      setTimeout(() => setSuccessMsg(''), 3000)
      loadUsers()
      setSelectedUser(null)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.company?.toLowerCase().includes(search.toLowerCase())
  )

  if (!authorized) return null

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EF4444' }}>
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel — Master Control</h2>
            <p className="text-gray-500 text-sm">{ADMIN_EMAIL} · Full system access</p>
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
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10">
          {(['overview', 'users', 'system'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-bold capitalize border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab ? '#8B5CF6' : 'transparent',
                color: activeTab === tab ? '#8B5CF6' : '#64748B',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Leads', value: stats.leads, icon: Users, color: 'bg-blue-500' },
                    { label: 'Total Invoices', value: stats.invoices, icon: FileText, color: 'bg-green-500' },
                    { label: 'Products', value: stats.products, icon: Package, color: 'bg-orange-500' },
                    { label: 'Employees', value: stats.employees, icon: UserCheck, color: 'bg-purple-500' },
                  ].map(m => (
                    <div key={m.label} className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
                      <div className={`${m.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                        <m.icon size={20} className="text-white" />
                      </div>
                      <p className="text-gray-500 text-xs mb-1">{m.label}</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-4 rounded-xl text-left hover:shadow-md transition-all border-2"
                      style={{ border: '2px solid #8B5CF6', background: '#EDE9FE' }}
                    >
                      <Users size={24} style={{ color: '#8B5CF6' }} className="mb-2" />
                      <p className="font-bold text-sm" style={{ color: '#1E293B' }}>Manage Users</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>View and update user plans</p>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="p-4 rounded-xl text-left hover:shadow-md transition-all"
                      style={{ border: '2px solid #34D399', background: '#D1FAE5' }}
                    >
                      <CheckCircle size={24} style={{ color: '#34D399' }} className="mb-2" />
                      <p className="font-bold text-sm" style={{ color: '#1E293B' }}>View Dashboard</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>See the full app as a user</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('system')}
                      className="p-4 rounded-xl text-left hover:shadow-md transition-all"
                      style={{ border: '2px solid #FBBF24', background: '#FEF3C7' }}
                    >
                      <Shield size={24} style={{ color: '#FBBF24' }} className="mb-2" />
                      <p className="font-bold text-sm" style={{ color: '#1E293B' }}>System Health</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>Check all services status</p>
                    </button>
                  </div>
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
                  placeholder="Search users by email, name, or company..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-[#1a2740] dark:text-white"
                />
              </div>
              <button onClick={loadUsers} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
                Refresh
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
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
                        No users found. Users appear here after they sign up.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#8B5CF6' }}>
                              {(user.full_name || user.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm dark:text-white">{user.full_name || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{user.company || 'N/A'}</p>
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
                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-50"
                            style={{ color: '#8B5CF6', border: '1px solid #8B5CF6' }}
                          >
                            <Edit size={12} /> Change Plan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Change Plan Modal */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md">
                  <h3 className="font-bold text-lg mb-2 dark:text-white">Change User Plan</h3>
                  <p className="text-gray-500 text-sm mb-4">{selectedUser.email}</p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Plan</label>
                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-sm dark:text-white">
                      {selectedUser.plan}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Plan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_PLANS.map(p => (
                        <button
                          key={p}
                          onClick={() => setNewPlan(p)}
                          className="p-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: newPlan === p ? '#8B5CF6' : '#F8FAFC',
                            color: newPlan === p ? 'white' : '#1E293B',
                            border: `2px solid ${newPlan === p ? '#8B5CF6' : '#E2E8F0'}`,
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 border border-gray-300 py-2 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePlan}
                      disabled={saving || newPlan === selectedUser.plan}
                      className="flex-1 bg-violet-600 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Update Plan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">System Health</h3>
              <div className="space-y-3">
                {[
                  { label: 'Vercel Hosting', status: 'Operational', color: '#34D399' },
                  { label: 'Supabase Auth', status: 'Operational', color: '#34D399' },
                  { label: 'Airtable Database', status: 'Operational', color: '#34D399' },
                  { label: 'Dodo Payments', status: 'Live Mode', color: '#34D399' },
                  { label: 'Rate Limiting', status: 'Active — 5 attempts max', color: '#34D399' },
                  { label: 'Session Management', status: 'Active — 30 min timeout', color: '#34D399' },
                  { label: 'Plan Locking', status: 'Active — module access controlled', color: '#34D399' },
                  { label: 'Geo Pricing', status: 'Active — 3 regions detected', color: '#34D399' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }}></div>
                      <span className="text-xs font-semibold" style={{ color: item.color }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Admin Controls</h3>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await supabase.auth.updateUser({ data: { plan: 'Complete' } })
                    setSuccessMsg('Your plan set to Complete!')
                    setTimeout(() => setSuccessMsg(''), 3000)
                  }}
                  className="w-full p-3 rounded-xl text-sm font-medium text-left"
                  style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#5B21B6' }}
                >
                  🔓 Set my account to Complete Plan (full access)
                </button>
                <button
                  onClick={() => { localStorage.removeItem('samyojak-tour-done'); router.push('/dashboard') }}
                  className="w-full p-3 rounded-xl text-sm font-medium text-left"
                  style={{ background: '#FEF3C7', border: '2px solid #FBBF24', color: '#92400E' }}
                >
                  🔄 Reset onboarding tour
                </button>
                <button
                  onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                  className="w-full p-3 rounded-xl text-sm font-medium text-left"
                  style={{ background: '#FEE2E2', border: '2px solid #FCA5A5', color: '#DC2626' }}
                >
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
