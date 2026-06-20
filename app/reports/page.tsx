'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Download, RefreshCw, TrendingUp, FileText, BarChart3 } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

export default function Reports() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'gst' | 'revenue' | 'imported'>('summary')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setPlan(getPlanFromMetadata(user))
        setUserId(user.id)
        setChecking(false)
      }
    })
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const d = await airtable.get('Invoices')
      setInvoices(d.records || [])
    } catch (e) {
      console.error('Reports load error:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'reports')) fetchInvoices()
  }, [checking, plan])

  const parseNote = (notes: string) => {
    const client = notes.match(/Client: ([^|]+)/)?.[1]?.trim() || '—'
    const amt = notes.match(/Amount: ([0-9.]+)/)?.[1] || '0'
    const taxAmt = notes.match(/[\w]+ \d+(?:\.\d+)?%: ([0-9.]+)/)?.[1] || '0'
    const tot = notes.match(/Total: ([0-9.]+)/)?.[1] || '0'
    const taxSys = notes.match(/Tax System: ([^|]+)/)?.[1]?.trim() || ''
    return {
      client,
      amount: Number(amt),
      taxAmount: Number(taxAmt),
      total: Number(tot),
      taxSystem: taxSys,
    }
  }

  // Summary stats
  const totalRevenue = invoices.reduce((s, i) => {
    const { total } = parseNote(i.fields?.Notes || '')
    return i.fields?.['Payment Status'] === 'Paid' ? s + total : s
  }, 0)

  const totalTax = invoices.reduce((s, i) => {
    const { taxAmount } = parseNote(i.fields?.Notes || '')
    return i.fields?.['Payment Status'] === 'Paid' ? s + taxAmount : s
  }, 0)

  const paidCount = invoices.filter(i => i.fields?.['Payment Status'] === 'Paid').length
  const unpaidCount = invoices.filter(i => i.fields?.['Payment Status'] === 'Unpaid').length
  const overdueCount = invoices.filter(i => i.fields?.['Payment Status'] === 'Overdue').length

  // GST breakdown by rate
  const gstBreakdown: Record<string, { count: number; taxable: number; tax: number; total: number }> = {}
  invoices.forEach(i => {
    if (i.fields?.['Payment Status'] !== 'Paid') return
    const rate = `${i.fields?.['GST %'] || 0}%`
    const { amount, taxAmount, total } = parseNote(i.fields?.Notes || '')
    if (!gstBreakdown[rate]) gstBreakdown[rate] = { count: 0, taxable: 0, tax: 0, total: 0 }
    gstBreakdown[rate].count++
    gstBreakdown[rate].taxable += amount
    gstBreakdown[rate].tax += taxAmount
    gstBreakdown[rate].total += total
  })

  // Revenue by month
  const revenueByMonth: Record<string, { revenue: number; tax: number; count: number }> = {}
  invoices.forEach(i => {
    if (i.fields?.['Payment Status'] !== 'Paid') return
    const date = i.fields?.['Issue Date'] || ''
    if (!date) return
    const month = date.substring(0, 7)
    const { amount, taxAmount } = parseNote(i.fields?.Notes || '')
    if (!revenueByMonth[month]) revenueByMonth[month] = { revenue: 0, tax: 0, count: 0 }
    revenueByMonth[month].revenue += amount
    revenueByMonth[month].tax += taxAmount
    revenueByMonth[month].count++
  })

  const exportReport = () => {
    const rows = [
      ['Invoice No', 'Client', 'Issue Date', 'Payment Status', 'GST Rate', 'Taxable Amount', 'GST Amount', 'Total'],
      ...invoices.map(i => {
        const { client, amount, taxAmount, total } = parseNote(i.fields?.Notes || '')
        return [
          i.fields?.['Invoice No'] || '',
          client,
          i.fields?.['Issue Date'] || '',
          i.fields?.['Payment Status'] || '',
          `${i.fields?.['GST %'] || 0}%`,
          amount.toFixed(2),
          taxAmount.toFixed(2),
          total.toFixed(2),
        ]
      })
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'gst-report.csv'
    a.click()
  }

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'reports')) {
    return <Layout><LockedModule moduleName="GST Reports" requiredPlan="Business" /></Layout>
  }

  const tabs = [
    { id: 'summary', label: '📊 Summary', icon: TrendingUp },
    { id: 'gst', label: '🧾 GST Breakdown', icon: FileText },
    { id: 'revenue', label: '📈 Revenue by Month', icon: BarChart3 },
    { id: 'imported', label: '📂 Imported Data', icon: FileText },
  ]

  return (
    <Layout>
      <div className="space-y-4">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              GST Reports & Analytics
            </h2>
            <p className="text-gray-500 text-sm">{invoices.length} invoices · Tax year overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchInvoices}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.id ? '#8B5CF6' : 'transparent',
                color: activeTab === tab.id ? '#8B5CF6' : '#64748B',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
        ) : (
          <>
            {/* SUMMARY TAB */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: '#34D399', bg: '#D1FAE5' },
                    { label: 'Total Tax Collected', value: `₹${totalTax.toLocaleString()}`, color: '#8B5CF6', bg: '#EDE9FE' },
                    { label: 'Paid Invoices', value: paidCount, color: '#34D399', bg: '#D1FAE5' },
                    { label: 'Pending + Overdue', value: unpaidCount + overdueCount, color: '#EF4444', bg: '#FEE2E2' },
                  ].map(s => (
                    <div key={s.label} className="p-5 rounded-2xl"
                      style={{ background: s.bg, border: `2px solid ${s.color}30` }}>
                      <p className="text-xs font-semibold uppercase mb-1" style={{ color: s.color }}>{s.label}</p>
                      <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#0A1628]">
                      <tr>
                        {['Invoice #', 'Client', 'Issue Date', 'Tax Rate', 'Amount', 'Tax', 'Total', 'Status'].map(h => (
                          <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                      {invoices.map(i => {
                        const { client, amount, taxAmount, total } = parseNote(i.fields?.Notes || '')
                        const isPaid = i.fields?.['Payment Status'] === 'Paid'
                        return (
                          <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="p-4 font-mono text-sm font-bold dark:text-white">
                              #{i.fields?.['Invoice No'] || 'Auto'}
                            </td>
                            <td className="p-4 text-sm dark:text-white">{client}</td>
                            <td className="p-4 text-xs text-gray-400">{i.fields?.['Issue Date'] || '—'}</td>
                            <td className="p-4 text-sm text-gray-500">{i.fields?.['GST %'] || 0}%</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">₹{amount.toLocaleString()}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">₹{taxAmount.toLocaleString()}</td>
                            <td className="p-4 text-sm font-bold dark:text-white">₹{total.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {i.fields?.['Payment Status'] || 'Unpaid'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GST BREAKDOWN TAB */}
            {activeTab === 'gst' && (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0A1628]">
                    <tr>
                      {['GST Rate', 'Invoices', 'Taxable Amount', 'GST Collected', 'Total Billed'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {Object.entries(gstBreakdown).length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">No paid invoices yet</td></tr>
                    ) : (
                      Object.entries(gstBreakdown).map(([rate, data]) => (
                        <tr key={rate} className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="p-4 font-bold text-sm dark:text-white">{rate}</td>
                          <td className="p-4 text-sm text-gray-500">{data.count}</td>
                          <td className="p-4 text-sm dark:text-white">₹{data.taxable.toLocaleString()}</td>
                          <td className="p-4 text-sm font-bold" style={{ color: '#8B5CF6' }}>₹{data.tax.toLocaleString()}</td>
                          <td className="p-4 text-sm font-bold dark:text-white">₹{data.total.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                    {Object.entries(gstBreakdown).length > 0 && (
                      <tr className="bg-gray-50 dark:bg-[#0A1628]">
                        <td className="p-4 font-black text-sm dark:text-white">TOTAL</td>
                        <td className="p-4 font-bold text-sm dark:text-white">{paidCount}</td>
                        <td className="p-4 font-bold text-sm dark:text-white">
                          ₹{Object.values(gstBreakdown).reduce((s, d) => s + d.taxable, 0).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-sm" style={{ color: '#8B5CF6' }}>
                          ₹{totalTax.toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-sm dark:text-white">
                          ₹{totalRevenue.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* REVENUE BY MONTH TAB */}
            {activeTab === 'revenue' && (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0A1628]">
                    <tr>
                      {['Month', 'Invoices Paid', 'Revenue (ex-tax)', 'Tax Collected', 'Total'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {Object.entries(revenueByMonth).length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">No paid invoices yet</td></tr>
                    ) : (
                      Object.entries(revenueByMonth)
                        .sort((a, b) => b[0].localeCompare(a[0]))
                        .map(([month, data]) => (
                          <tr key={month} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="p-4 font-bold text-sm dark:text-white">
                              {new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </td>
                            <td className="p-4 text-sm text-gray-500">{data.count}</td>
                            <td className="p-4 text-sm dark:text-white">₹{data.revenue.toLocaleString()}</td>
                            <td className="p-4 text-sm font-bold" style={{ color: '#8B5CF6' }}>₹{data.tax.toLocaleString()}</td>
                            <td className="p-4 text-sm font-bold dark:text-white">
                              ₹{(data.revenue + data.tax).toLocaleString()}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* IMPORTED DATA TAB */}
            {activeTab === 'imported' && userId && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl" style={{ background: '#EDE9FE', border: '1.5px solid #8B5CF6' }}>
                  <p className="text-sm font-bold text-violet-800 mb-1">📂 All Imported Data Across Modules</p>
                  <p className="text-xs text-violet-600">
                    View and export all data imported from any external software. Every column preserved exactly.
                  </p>
                </div>

                {(['CRM', 'Invoices', 'Inventory', 'HR', 'Projects'] as const).map(module => (
                  <div key={module}>
                    <h3 className="font-black text-sm mb-3 dark:text-white"
                      style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                      {module} Imported Data
                    </h3>
                    <UniversalDataView
                      userId={userId}
                      module={module}
                      color="#8B5CF6"
                      bg="#EDE9FE"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </Layout>
  )
}
