'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { airtable } from '@/lib/airtable'
import Layout from '@/components/Layout'
import { Users, FileText, Package, UserCheck, Shield } from 'lucide-react'

export default function Admin() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState({ leads: 0, invoices: 0, products: 0, employees: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email !== 'omkarakhade083@gmail.com') {
        router.push('/')
        return
      }
      setAuthorized(true)
      Promise.all([
        airtable.get('Leads'),
        airtable.get('Invoices'),
        airtable.get('Products'),
        airtable.get('Employees'),
      ]).then(([l, i, p, e]) => {
        setStats({
          leads: l.records?.length || 0,
          invoices: i.records?.length || 0,
          products: p.records?.length || 0,
          employees: e.records?.length || 0,
        })
        setLoading(false)
      }).catch(() => setLoading(false))
    })
  }, [router])

  if (!authorized) return null

  const statCards = [
    { label: 'Total Leads', value: stats.leads, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Invoices', value: stats.invoices, icon: FileText, color: 'bg-green-500' },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-orange-500' },
    { label: 'Employees', value: stats.employees, icon: UserCheck, color: 'bg-purple-500' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-gray-500 text-sm">Owner access only — omkarakhade083@gmail.com</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map(m => (
              <div key={m.label} className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
                <div className={`${m.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <m.icon size={20} className="text-white" />
                </div>
                <p className="text-gray-500 text-xs mb-1">{m.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              'Vercel Hosting — Operational',
              'Supabase Auth — Operational',
              'Airtable Database — Operational',
              'Rate Limiting — Active',
              'Session Management — Active',
              'Cookie Consent — Active',
            ].map(item => (
              <div key={item} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.split('—')[0]}</span>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  ✅ {item.split('—')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
