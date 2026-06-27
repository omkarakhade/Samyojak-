'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, Bell, Shield, Trash2, BookOpen, RefreshCw, Check, AlertCircle } from 'lucide-react'
import OnboardingTour from '@/components/OnboardingTour'

const CORRECT_EMAIL = 'hello.samyojak@gmail.com'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'account'>('profile')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      setFullName(user.user_metadata?.full_name || '')
      setCompany(user.user_metadata?.company || '')
    })
  }, [router])

  const saveProfile = async () => {
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, company },
      })
      if (error) throw error
      setSuccess('Profile updated successfully')
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  const changePassword = async () => {
    setSuccess('')
    setError('')
    if (!user?.email) return
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSuccess('Password reset email sent. Check your inbox.')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Type DELETE in capitals to confirm')
      return
    }
    setError('')
    setSuccess(`To delete your account, please email ${CORRECT_EMAIL} with subject: "Delete My Account" and include your registered email address.`)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('samyojak_onboarding_done')
    setShowOnboarding(true)
    setSuccess('Onboarding tour restarting!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Trash2 },
  ]

  return (
    <Layout>
      <div className="space-y-4 max-w-2xl">

        {showOnboarding && (
          <OnboardingTour onDismiss={() => {
            setShowOnboarding(false)
            localStorage.setItem('samyojak_onboarding_done', '1')
          }} />
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
            Settings
          </h2>
          <p className="text-gray-500 text-sm">Manage your account and preferences</p>
        </div>

        {success && (
          <div className="p-3 rounded-xl flex items-center gap-2 text-sm"
            style={{ background: '#D1FAE5', border: '1.5px solid #34D399', color: '#065F46' }}>
            <Check size={16} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl flex items-center gap-2 text-sm"
            style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5', color: '#DC2626' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSuccess(''); setError('') }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.id ? '#8B5CF6' : 'transparent',
                color: activeTab === tab.id ? '#8B5CF6' : '#64748B',
              }}>
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 space-y-4"
            style={{ border: '2px solid #E2E8F0' }}>
            <h3 className="font-black text-base dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Profile Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                style={{ fontFamily: 'Outfit' }}>
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-200 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                style={{ fontFamily: 'Outfit' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                style={{ fontFamily: 'Outfit' }}>
                Company / Business Name
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Your business name"
                className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
              />
            </div>

            <button onClick={saveProfile} disabled={saving}
              className="candy-btn px-6 py-2.5 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>

            {/* Onboarding reset — prominent */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
              <div className="p-4 rounded-2xl"
                style={{ background: '#EDE9FE', border: '2px solid #8B5CF6' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#8B5CF6' }}>
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm mb-1"
                      style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                      Onboarding Tutorial
                    </h4>
                    <p className="text-xs mb-3" style={{ color: '#64748B' }}>
                      Restart the step-by-step tour to explore all 12 modules including new Quotations, BI Dashboard, Recurring Invoices, and Recruiting.
                    </p>
                    <button onClick={resetOnboarding}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white hover:opacity-90 transition-opacity"
                      style={{ background: '#8B5CF6' }}>
                      <RefreshCw size={15} /> Restart Onboarding Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 space-y-4"
            style={{ border: '2px solid #E2E8F0' }}>
            <h3 className="font-black text-base dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Notification Preferences
            </h3>
            {[
              { label: 'Follow-up reminders', desc: 'Alert when a lead follow-up is due today' },
              { label: 'Overdue invoice alerts', desc: 'Notify when invoices pass their due date' },
              { label: 'Low stock alerts', desc: 'Alert when product stock hits reorder level' },
              { label: 'New candidate applications', desc: 'Notify when a new candidate is added' },
              { label: 'Project deadline reminders', desc: 'Alert 2 days before project deadline' },
            ].map(n => (
              <div key={n.label}
                className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 dark:border-white/10 last:border-0">
                <div>
                  <p className="text-sm font-semibold dark:text-white">{n.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                </div>
                <div className="w-10 h-6 rounded-full flex-shrink-0 cursor-pointer relative"
                  style={{ background: '#8B5CF6' }}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">
              Notifications sent to {user?.email}
            </p>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 space-y-5"
            style={{ border: '2px solid #E2E8F0' }}>
            <h3 className="font-black text-base dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Security Settings
            </h3>

            <div className="p-4 rounded-xl" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
              <p className="text-sm font-bold dark:text-white mb-1">Change Password</p>
              <p className="text-xs text-gray-400 mb-3">
                A reset link will be sent to {user?.email}
              </p>
              <button onClick={changePassword}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: '#1E293B', color: 'white' }}>
                <Shield size={15} /> Send Reset Link
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold dark:text-white">Active Security Features</p>
              {[
                '✅ SSL encrypted connection',
                '✅ Supabase enterprise authentication',
                '✅ Rate limiting — max 5 login attempts',
                '✅ Session timeout — 30 min auto logout',
                '✅ Email verification required',
              ].map(s => (
                <p key={s} className="text-xs" style={{ color: '#64748B' }}>{s}</p>
              ))}
            </div>

            <div className="p-4 rounded-xl"
              style={{ background: '#EDE9FE', border: '1.5px solid #8B5CF6' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#8B5CF6' }}>
                Security concerns?
              </p>
              <p className="text-xs" style={{ color: '#64748B' }}>
                Report security issues immediately to{' '}
                <a href={`mailto:${CORRECT_EMAIL}?subject=SECURITY`}
                  className="font-bold underline"
                  style={{ color: '#8B5CF6' }}>
                  {CORRECT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-4">

            {/* Plan info */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-base dark:text-white mb-3" style={{ fontFamily: 'Outfit' }}>
                Current Plan
              </h3>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold dark:text-white">
                    {user?.user_metadata?.plan || 'No Plan'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    For billing questions email {CORRECT_EMAIL}
                  </p>
                </div>
                <a href="/pricing"
                  className="px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ background: '#8B5CF6', color: 'white' }}>
                  Manage Plan
                </a>
              </div>
            </div>

            {/* Contact support */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-base dark:text-white mb-2" style={{ fontFamily: 'Outfit' }}>
                Need Help?
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Contact our support team for account issues, billing questions, or technical help.
              </p>
              <a href={`mailto:${CORRECT_EMAIL}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold w-fit hover:opacity-80 transition-opacity"
                style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                ✉️ {CORRECT_EMAIL}
              </a>
            </div>

            {/* Delete account */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
              style={{ border: '2px solid #FEE2E2' }}>
              <h3 className="font-black text-base text-red-600 mb-2" style={{ fontFamily: 'Outfit' }}>
                Delete Account
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                This permanently deletes your account and all data. This cannot be undone.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                You can also email {CORRECT_EMAIL} with subject "Delete My Account"
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE" in capitals to confirm'
                className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-red-300 outline-none dark:bg-white/5 dark:text-white"
              />
              <button onClick={deleteAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ background: '#EF4444', color: 'white' }}>
                <Trash2 size={15} /> Request Account Deletion
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
