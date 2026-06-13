'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Download, Upload, TrendingUp, DollarSign, FileText } from 'lucide-react'
import ImportModal from '@/components/ImportModal'

export default function Reports() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [activeTab, setActiveTab] = useState<'gst' | 'revenue' | 'summary'>('summary')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const fetchInvoices = async () => {
    try {
      const d = await airtable.get('Invoices')
      setInvoices(d.records || [])
    } catch (e) { }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'reports')) {
      fetchInvoices()
    }
  }, [checking, plan])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const monthlyData = months.map((month, idx) => {
    const mi = invoices.filter(i => {
      const d = i.fields?.['Issue Date']
      return d && new Date(d).getMonth() === idx
    })
    const taxable = mi.reduce((s, i) => s + (i.fields?.Amount || 0), 0)
    const tax5 = mi.filter(i => i.fields?.['Tax Rate'] === 5).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const tax12 = mi.filter(i => i.fields?.['Tax Rate'] === 12).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const tax18 = mi.filter(i => i.fields?.['Tax Rate'] === 18).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const tax28 = mi.filter(i => i.fields?.['Tax Rate'] === 28).reduce((s, i) => s + (i.fields?.['Tax Amount'] || 0), 0)
    const totalTax = tax5 + tax12 + tax18 + tax28
    const totalRevenue = mi.reduce((s, i) => s + (i.fields?.Total || 0), 0)
    const paidRevenue = mi.filter(i => i.fields?.Status === 'Paid').reduce((s, i) => s + (i.fields?.Total || 0), 0)
    return { month, taxable, tax5, tax12, tax18, tax28, totalTax, totalRevenue, paidRevenue, count: mi.length }
  }).filter(m => m.count > 0)

  const totalTaxYear = monthlyData.reduce((s, m) => s + m.totalTax, 0)
  const totalRevenueYear = monthlyData.reduce((s, m) => s + m.totalRevenue, 0)
  const totalPaidYear = monthlyData.reduce((s, m) => s + m.paidRevenue, 0)
  const avgMonthlyTax = monthlyData.length > 0 ? Math.floor(totalTaxYear / monthlyData.length) : 0

  const paidInvoices = invoices.filter(i => i.fields?.Status === 'Paid')
  const unpaidInvoices = invoices.filter(i => i.fields?.Status === 'Unpaid')
  const overdueInvoices = invoices.filter(i => i.fields?.Status === 'Overdue')

  const exportGSTCSV = () => {
    const csv = ['Month,Taxable Amount,Tax 5%,Tax 12%,Tax 18%,Tax 28%,Total Tax,Total Revenue']
      .concat(monthlyData.map(m =>
        `${m.month},${m.taxable},${m.tax5},${m.tax12},${m.tax18},${m.tax28},${m.totalTax},${m.totalRevenue}`
      )).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'gst-report.csv'
    a.click()
  }

  const exportFullCSV = () => {
    const csv = ['Invoice No,Client,Amount,Tax System,Tax Rate,Tax Amount,Total,Status,Issue Date']
      .concat(invoices.map(i =>
        `${i.fields?.['Invoice No'] || ''},${i.fields?.['Client Name'] || ''},${i.fields?.Amount || ''},${i.fields?.['Tax System'] || 'GST'},${i.fields?.['Tax Rate'] || ''},${i.fields?.['Tax Amount'] || ''},${i.fields?.Total || ''},${i.fields?.Status || ''},${i.fields?.['Issue Date'] || ''}`
      )).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'invoices-full.csv'
    a.click()
  }

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )

  if (!canAccessModuleSync(plan as any, 'reports')) {
    return <Layout><LockedModule moduleName="GST Reports" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-6">

        {showImport && (
          <ImportModal
            module="Invoices"
            onClose={() => setShowImport(false)}
            onSuccess={fetchInvoices}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Tax Reports
            </h2>
            <p className="text-gray-500 text-sm">
              Universal tax — GST, VAT, HST, Sales Tax · GSTR-1 format
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}
            >
              <Upload size={16} /> Import Invoices
            </button>
            <button
              onClick={exportGSTCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white"
            >
              <Download size={16} /> GST Report
            </button>
            <button
              onClick={exportFullCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white"
            >
              <Download size={16} /> Full Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${totalRevenueYear.toLocaleString()}`, icon: TrendingUp, color: '#8B5CF6', bg: '#EDE9FE' },
            { label: 'Paid Revenue', value: `₹${totalPaidYear.toLocaleString()}`, icon: DollarSign, color: '#34D399', bg: '#D1FAE5' },
            { label: 'Total Tax Collected', value: `₹${totalTaxYear.toLocaleString()}`, icon: FileText, color: '#FBBF24', bg: '#FEF3C7' },
            { label: 'Avg Monthly Tax', value: `₹${avgMonthlyTax.toLocaleString()}`, icon: BarChart, color: '#F472B6', bg: '#FCE7F3' },
          ].map(m => (
            <div key={m.label} className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <p className="text-gray-500 text-xs uppercase mb-1">{m.label}</p>
              <p className="text-2xl font-black dark:text-white" style={{ fontFamily: 'Outfit' }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Invoice Status */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Paid', count: paidInvoices.length, color: '#34D399', bg: '#D1FAE5' },
            { label: 'Unpaid', count: unpaidInvoices.length, color: '#FBBF24', bg: '#FEF3C7' },
            { label: 'Overdue', count: overdueInvoices.length, color: '#EF4444', bg: '#FEE2E2' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1a2740] rounded-2xl p-4 text-center"
              style={{ border: `2px solid ${s.color}`, background: s.bg }}>
              <p className="text-3xl font-black" style={{ fontFamily: 'Outfit', color: s.color }}>{s.count}</p>
              <p className="text-sm font-bold" style={{ color: s.color }}>{s.label} Invoices</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10">
          {[
            { key: 'summary', label: 'Summary' },
            { key: 'gst', label: 'GST/Tax Breakdown' },
            { key: 'revenue', label: 'Revenue by Month' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-4 py-2 text-sm font-bold border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab.key ? '#8B5CF6' : 'transparent',
                color: activeTab === tab.key ? '#8B5CF6' : '#64748B',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="font-bold dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>
              No invoice data yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Create invoices or import from CSV to see reports
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mx-auto"
              style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}
            >
              <Upload size={16} /> Import Invoices
            </button>
          </div>
        ) : (
          <>
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl overflow-x-auto"
                style={{ border: '2px solid #E2E8F0' }}>
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0A1628]">
                    <tr>
                      {['Month', 'Invoices', 'Revenue', 'Paid', 'Tax Collected'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {monthlyData.map(m => (
                      <tr key={m.month} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{m.month}</td>
                        <td className="p-4 text-gray-500">{m.count}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">₹{m.totalRevenue.toLocaleString()}</td>
                        <td className="p-4 font-bold" style={{ color: '#34D399' }}>₹{m.paidRevenue.toLocaleString()}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">₹{m.totalTax.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-[#0A1628] font-bold">
                      <td className="p-4 dark:text-white">TOTAL</td>
                      <td className="p-4 dark:text-white">{invoices.length}</td>
                      <td className="p-4 dark:text-white">₹{totalRevenueYear.toLocaleString()}</td>
                      <td className="p-4" style={{ color: '#34D399' }}>₹{totalPaidYear.toLocaleString()}</td>
                      <td className="p-4 dark:text-white">₹{totalTaxYear.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* GST Tab */}
            {activeTab === 'gst' && (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl overflow-x-auto"
                style={{ border: '2px solid #E2E8F0' }}>
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0A1628]">
                    <tr>
                      {['Month', 'Taxable Amount', 'Tax 5%', 'Tax 12%', 'Tax 18%', 'Tax 28%', 'Total Tax'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {monthlyData.map(m => (
                      <tr key={m.month} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">{m.month}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">₹{m.taxable.toLocaleString()}</td>
                        <td className="p-4 text-gray-500">₹{m.tax5.toLocaleString()}</td>
                        <td className="p-4 text-gray-500">₹{m.tax12.toLocaleString()}</td>
                        <td className="p-4 text-gray-500">₹{m.tax18.toLocaleString()}</td>
                        <td className="p-4 text-gray-500">₹{m.tax28.toLocaleString()}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">₹{m.totalTax.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="bg-white dark:bg-[#1a2740] rounded-2xl overflow-x-auto"
                style={{ border: '2px solid #E2E8F0' }}>
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0A1628]">
                    <tr>
                      {['Month', 'Total Revenue', 'Paid', 'Pending', 'Collection Rate'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {monthlyData.map(m => {
                      const pending = m.totalRevenue - m.paidRevenue
                      const rate = m.totalRevenue > 0
                        ? Math.round((m.paidRevenue / m.totalRevenue) * 100)
                        : 0
                      return (
                        <tr key={m.month} className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="p-4 font-medium text-gray-900 dark:text-white">{m.month}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">₹{m.totalRevenue.toLocaleString()}</td>
                          <td className="p-4 font-bold" style={{ color: '#34D399' }}>₹{m.paidRevenue.toLocaleString()}</td>
                          <td className="p-4" style={{ color: pending > 0 ? '#EF4444' : '#34D399' }}>₹{pending.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{ width: `${rate}%`, background: rate >= 80 ? '#34D399' : rate >= 50 ? '#FBBF24' : '#EF4444' }}
                                />
                              </div>
                              <span className="text-xs font-bold" style={{ color: rate >= 80 ? '#34D399' : rate >= 50 ? '#FBBF24' : '#EF4444' }}>
                                {rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

// Simple bar chart icon component since BarChart3 might not be imported
function BarChart({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}
