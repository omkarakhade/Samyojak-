'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { User, Bell, Shield, CreditCard, Globe, CheckCircle } from 'lucide-react'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'notifications' | 'security'>('profile')
  const [profile, setProfile] = useState({ full_name: '', company: '', timezone: '' })
  const [billing, setBilling] = useState({ autopay: true })

  const TIMEZONES = [
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'America/New_York', 'America/Chicago', 'America/Los_Angeles',
    'Australia/Sydney', 'Pacific/Auckland',
  ]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          company: user.user_metadata?.company || '',
          timezone: user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        })
        setBilling({
          autopay: user.user_metadata?.autopay !== false,
        })
      }
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { ...profile } })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const saveBilling = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { autopay: billing.autopay } })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const tabs = [
    { key: 'profile', icon: User, label: 'Profile' },
    { key: 'billing', icon: CreditCard, label: 'Billing & Auto-Pay' },
    { key: 'notifications', icon: Bell, label: 'Notifications' },
    { key: 'security', icon: Shield, label: 'Security' },
  ]

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
        </div>

        {saved && (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#D1FAE5', border: '2px solid #34D399' }}>
            <CheckCircle size={18} style={{ color: '#059669' }} />
            <span className="text-sm font-medium text-green-800">Settings saved successfully!</span>
          </div>
        )}

        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap"
              style={{ borderColor: activeTab === tab.key ? '#8B5CF6' : 'transparent', color: activeTab === tab.key ? '#8B5CF6' : '#64748B' }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6" style={{ border: '2px solid #E2E8F0' }}>
            <h3 className="font-black text-lg mb-6 dark:text-white" style={{ fontFamily: 'Outfit' }}>Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300">Full Name</label>
                <input type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:bg-white/5 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300">Company Name</label>
                <input type="text" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })}
                  className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:bg-white/5 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300">
                  <Globe size={12} className="inline mr-1" /> Timezone
                </label>
                <select value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Current: {Intl.DateTimeFormat().resolvedOptions().timeZone} · Used for geo-based pricing and date display
                </p>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300">Email</label>
                <div className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving}
                className="candy-btn w-full py-3 text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6" style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-lg mb-2 dark:text-white" style={{ fontFamily: 'Outfit' }}>Auto-Pay Settings</h3>
              <p className="text-sm text-gray-500 mb-6">
                Control whether your subscription renews automatically each period.
              </p>

              <div className="flex items-center justify-between p-4 rounded-xl mb-4"
                style={{ background: billing.autopay ? '#D1FAE5' : '#FEF3C7', border: `2px solid ${billing.autopay ? '#34D399' : '#FBBF24'}` }}>
                <div>
                  <p className="font-bold text-sm" style={{ color: billing.autopay ? '#065F46' : '#92400E' }}>
                    Auto-Pay is {billing.autopay ? 'ON' : 'OFF'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: billing.autopay ? '#047857' : '#B45309' }}>
                    {billing.autopay
                      ? 'Your subscription renews automatically. No action needed.'
                      : 'You will need to manually renew when your plan expires.'}
                  </p>
                </div>
                <button
                  onClick={() => setBilling({ autopay: !billing.autopay })}
                  className="w-14 h-7 rounded-full transition-all duration-300 relative flex-shrink-0"
                  style={{ background: billing.autopay ? '#34D399' : '#CBD5E1' }}
                >
                  <div className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300"
                    style={{ left: billing.autopay ? '34px' : '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Weekly Plans</p>
                    <p className="text-xs text-gray-500">You are charged once per week. You can turn off auto-pay anytime to stop at the end of your current week.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Cancel Anytime</p>
                    <p className="text-xs text-gray-500">Turn off auto-pay below and your plan simply expires at the end of the current period. No charges after that.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                  <span className="text-lg">🌍</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Your Pricing Region</p>
                    <p className="text-xs text-gray-500">
                      Pricing is detected from your timezone: <strong>{profile.timezone}</strong>.
                      India timezone = India pricing. Western timezone = Western pricing.
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={saveBilling} disabled={saving}
                className="candy-btn w-full py-3 text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Billing Preferences'}
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6" style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Current Plan</h3>
              <div className="p-4 rounded-xl" style={{ background: '#EDE9FE', border: '2px solid #8B5CF6' }}>
                <p className="font-bold text-violet-800">{user?.user_metadata?.plan || 'No active plan'}</p>
                <p className="text-xs text-violet-600 mt-1">
                  Powered by Dodo Payments · Secure · Cancel anytime
                </p>
              </div>
              <a href="/choose-plan" className="block mt-4 text-center text-sm font-bold py-2 rounded-xl"
                style={{ color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
                Change Plan →
              </a>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6" style={{ border: '2px solid #E2E8F0' }}>
            <h3 className="font-black text-lg mb-6 dark:text-white" style={{ fontFamily: 'Outfit' }}>Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'email_invoices', label: 'Invoice payment reminders', desc: 'Get emailed when invoices are overdue' },
                { key: 'email_leads', label: 'Follow-up reminders', desc: 'Get emailed when leads need follow-up' },
                { key: 'email_tickets', label: 'Support ticket updates', desc: 'Get notified on ticket status changes' },
                { key: 'email_billing', label: 'Billing notifications', desc: 'Renewal confirmations and receipts' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-violet-500 relative flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1" />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400">Full notification management coming soon. Currently all notifications are sent to your account email.</p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6" style={{ border: '2px solid #E2E8F0' }}>
            <h3 className="font-black text-lg mb-6 dark:text-white" style={{ fontFamily: 'Outfit' }}>Security</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: '#D1FAE5', border: '1.5px solid #34D399' }}>
                <p className="text-sm font-bold text-green-800">✅ Your account is secure</p>
                <ul className="text-xs text-green-700 mt-2 space-y-1">
                  <li>• Login rate limited — 5 attempts max then 15 min lockout</li>
                  <li>• Session auto-expires after 30 minutes of inactivity</li>
                  <li>• All data encrypted in transit via HTTPS/SSL</li>
                  <li>• Powered by Supabase Auth — enterprise grade security</li>
                </ul>
              </div>
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5' }}>
                🚪 Sign Out of All Devices
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
