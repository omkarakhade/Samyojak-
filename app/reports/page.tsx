'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Download } from 'lucide-react'

export default function Reports() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'reports')) {
      airtable.get('Invoices')
        .then(d => { setInvoices(d.records || []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [checking, plan])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const monthlyData = months.map((month, idx) => {
    const mi = invoices.filter(i => {
      const d = i.fields?.['Issue Date']
      return d && new Date(d).getMonth() === idx
    })
    const taxable = mi.reduce((s, i) => s + (i.fields?.Amount || 0), 0)
    const gst5 = mi.filter(i => i.fields?.['Tax Rate'] === 5).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const gst12 = mi.filter(i => i.fields?.['Tax Rate'] === 12).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const gst18 = mi.filter(i => i.fields?.['Tax Rate'] === 18).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const gst28 = mi.filter(i => i.fields?.['Tax Rate'] === 28).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const totalTax = gst5 + gst12 + gst18 + gst28
    return { month, taxable, gst5, gst12, gst18, gst28, totalTax }
  }).filter(m => m.taxable > 0)

  const totalTaxYear = monthlyData.reduce((s, m) => s + m.totalTax, 0)
  const avgTax = monthlyData.length > 0 ? Math.floor(totalTaxYear / monthlyData.length) : 0

  const exportCSV = () => {
    const csv = ['Month,Taxable Amount,Tax 5%,Tax 12%,Tax 18%,Tax 28%,Total Tax']
      .concat(monthlyData.map(m => `${m.month},${m.taxable},${m.gst5},${m.gst12},${m.gst18},${m.gst28},${m.totalTax}`))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'tax-report.csv'
    a.click()
  }

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </Layout>
  )

  if (!canAccessModuleSync(plan as any, 'reports')) {
    return <Layout><LockedModule moduleName="GST Reports" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">GST Reports</h2>
            <p className="text-gray-500 text-sm">Universal tax summary — GSTR-1 format</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border">
            <p className="text-gray-500 text-xs uppercase mb-1">Total Tax This Year</p>
            <p className="text-3xl font-black dark:text-white">₹{totalTaxYear.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border">
            <p className="text-gray-500 text-xs uppercase mb-1">Average Monthly Tax</p>
            <p className="text-3xl font-black dark:text-white">₹{avgTax.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border">
            <p className="text-gray-500 text-xs uppercase mb-1">Total Invoices</p>
            <p className="text-3xl font-black dark:text-white">{invoices.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-500">No invoice data yet. Create invoices to see tax reports.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>{['Month', 'Taxable Amount', 'Tax 5%', 'Tax 12%', 'Tax 18%', 'Tax 28%', 'Total Tax'].map(h => <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {monthlyData.map(m => (
                  <tr key={m.month} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{m.month}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">₹{m.taxable.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst5.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst12.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst18.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst28.toLocaleString()}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">₹{m.totalTax.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
