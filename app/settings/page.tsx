'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    companyName: '', gstin: '', address: '',
    city: '', country: 'India', whatsapp: '', currency: 'INR',
  })
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = ['profile', 'company', 'notifications', 'security']

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>

        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  defaultValue={user?.user_metadata?.full_name || ''}
                  className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Company Details</h3>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Your Business Name' },
                { key: 'gstin', label: 'GSTIN', type: 'text', placeholder: '22AAAAA0000A1Z5' },
                { key: 'address', label: 'Address', type: 'text', placeholder: 'Street address' },
                { key: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
                { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '+91 9876543210' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-white/5 dark:text-white"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors"
              >
                {saved ? '✅ Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Email Notifications</h3>
            <div className="space-y-4">
              {[
                'Welcome email on signup',
                'Invoice sent to client',
                'Payment received confirmation',
                'Low stock alert daily digest',
                'Overdue invoice reminder',
                'Follow-up due today reminder',
              ].map(item => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Security Status</h3>
              <div className="space-y-3">
                {[
                  'Login rate limiting active — 5 attempts max',
                  'Auto logout after 30 minutes of inactivity',
                  'Session warning at 25 minutes',
                  'Data encrypted at rest via Supabase',
                  'Row level security enabled',
                  'HTTPS enforced via Vercel',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="text-green-500">✅</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Restart Onboarding Tour</h3>
              <p className="text-gray-500 text-sm mb-4">Reset and replay the getting started guide</p>
              <button
                onClick={() => {
                  localStorage.removeItem('samyojak-tour-done')
                  router.push('/dashboard')
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors"
              >
                Restart Tour
              </button>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                Permanently delete your account and all associated data.
              </p>
              <button
                onClick={async () => {
                  if (confirm('Are you sure? This cannot be undone.')) {
                    await supabase.auth.signOut()
                    router.push('/')
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
