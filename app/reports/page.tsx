'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { Download, RefreshCw, TrendingUp, Users, Package, FileText, UserCheck } from 'lucide-react'

export default function Reports() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'invoices' | 'inventory' | 'hr'>('overview')
  const [data, setData] = useState<{
    crm: any[]; invoices: any[]; inventory: any[]; hr: any[]; projects: any[]
  }>({ crm: [], invoices: [], inventory: [], hr: [], projects: [] })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setPlan(getPlanFromMetadata(user))
        setUserId(user.id)
        setChecking(false)
      }
    })
  }, [])

  const loadAllData = async (uid: string) => {
    setLoading(true)
    try {
      const [crm, invoices, inventory, hr, projects] = await Promise.all([
        fetch(`/api/universal-data?userId=${uid}&module=CRM`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Invoices`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Inventory`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=HR`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${uid}&module=Projects`).then(r => r.json()),
      ])
      setData({
        crm: crm.records || [],
        invoices: invoices.records || [],
        inventory: inventory.records || [],
        hr: hr.records || [],
        projects: projects.records || [],
      })
    } catch (e) {
      console.error('Reports load error:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && userId && canAccessModuleSync(plan as any, 'reports')) {
      loadAllData(userId)
    }
  }, [checking, userId, plan])

  // CRM Analytics
  const totalLeads = data.crm.length
  const statusCounts: Record<string, number> = {}
  data.crm.forEach(r => {
    const status = r.data?.Status || r.data?.status || r.data?.['Lead Status'] || 'Unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  // Invoice Analytics
  const totalInvoices = data.invoices.length
  const paidInvoices = data.invoices.filter(r => {
    const status = (r.data?.['Payment Status'] || r.data?.Status || r.data?.status || '').toLowerCase()
    return status === 'paid'
  })
  const totalRevenue = paidInvoices.reduce((s, r) => {
    const total = Number(r.data?.Total || r.data?.total || r.data?.Amount || r.data?.amount || 0)
    return s + total
  }, 0)
  const totalTax = paidInvoices.reduce((s, r) => {
    const tax = Number(r.data?.['Tax Amount'] || r.data?.['GST Amount'] || r.data?.['tax_amount'] || 0)
    return s + tax
  }, 0)

  // Inventory Analytics
  const totalProducts = data.inventory.length
  const lowStock = data.inventory.filter(r => {
    const stock = Number(r.data?.['Current Stock'] || r.data?.stock || r.data?.quantity || 0)
    const reorder = Number(r.data?.['Reorder Level'] || r.data?.reorder || 0)
    return reorder > 0 && stock <= reorder
  })

  // HR Analytics
  const totalEmployees = data.hr.length
  const totalPayroll = data.hr.reduce((s, r) => {
    return s + Number(r.data?.Salary || r.data?.salary || r.data?.pay || 0)
  }, 0)

  // Dept breakdown
  const deptCounts: Record<string, number> = {}
  data.hr.forEach(r => {
    const dept = r.data?.Department || r.data?.department || r.data?.dept || 'Unknown'
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  })

  const exportReport = (module: string) => {
    const records = data[module.toLowerCase() as keyof typeof data] || []
    if (records.length === 0) return
    const allCols = new Set<string>()
    records.forEach((r: any) => Object.keys(r.data || {}).forEach(k => allCols.add(k)))
    const cols = Array.from(allCols)
    const rows = [cols, ...records.map((r: any) => cols.map(c => r.data?.[c] || ''))]
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${module.toLowerCase()}-report.csv`
    a.click()
  }

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'reports')) {
    return <Layout><LockedModule moduleName="Reports" requiredPlan="Business" /></Layout>
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'leads', label: '👥 Leads' },
    { id: 'invoices', label: '📄 Invoices' },
    { id: 'inventory', label: '📦 Inventory' },
    { id: 'hr', label: '👤 HR' },
  ]

  return (
    <Layout>
      <div className="space-y-4">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Reports & Analytics
            </h2>
            <p className="text-gray-500 text-sm">
              Business insights across all modules
            </p>
          </div>
          <button onClick={() => userId && loadAllData(userId)}
            className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
            <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Leads', value: totalLeads, icon: Users, color: '#8B5CF6', bg: '#EDE9FE' },
                    { label: 'Revenue Collected', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#34D399', bg: '#D1FAE5' },
                    { label: 'Total Products', value: totalProducts, icon: Package, color: '#FBBF24', bg: '#FEF3C7' },
                    { label: 'Team Members', value: totalEmployees, icon: UserCheck, color: '#F472B6', bg: '#FCE7F3' },
                  ].map(s => (
                    <div key={s.label} className="p-5 rounded-2xl"
                      style={{ background: s.bg, border: `2px solid ${s.color}30` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon size={18} style={{ color: s.color }} />
                        <p className="text-xs font-semibold uppercase" style={{ color: s.color }}>{s.label}</p>
                      </div>
                      <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2740]"
                    style={{ border: '2px solid #E2E8F0' }}>
                    <h3 className="font-black text-sm mb-3 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                      Lead Pipeline
                    </h3>
                    {Object.entries(statusCounts).length === 0 ? (
                      <p className="text-xs text-gray-400">No lead data yet</p>
                    ) : (
                      Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-white/10 last:border-0">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{status}</span>
                          <span className="text-sm font-bold dark:text-white">{count}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2740]"
                    style={{ border: '2px solid #E2E8F0' }}>
                    <h3 className="font-black text-sm mb-3 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                      Invoice Summary
                    </h3>
                    {[
                      { label: 'Total Invoices', value: totalInvoices },
                      { label: 'Paid', value: paidInvoices.length },
                      { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}` },
                      { label: 'Tax Collected', value: `₹${totalTax.toLocaleString()}` },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-white/10 last:border-0">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                        <span className="text-sm font-bold dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1a2740]"
                    style={{ border: '2px solid #E2E8F0' }}>
                    <h3 className="font-black text-sm mb-3 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                      Team & Inventory
                    </h3>
                    {[
                      { label: 'Employees', value: totalEmployees },
                      { label: 'Monthly Payroll', value: `₹${totalPayroll.toLocaleString()}` },
                      { label: 'Products', value: totalProducts },
                      { label: 'Low Stock Alerts', value: lowStock.length },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-white/10 last:border-0">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                        <span className="text-sm font-bold dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{totalLeads} total leads</p>
                  <button onClick={() => exportReport('crm')}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
                    <Download size={14} /> Export Leads
                  </button>
                </div>
                {data.crm.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No lead data. Go to CRM to add or import leads.</div>
                ) : (
                  <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-[#0A1628]">
                        <tr>
                          {['#', ...Object.keys(data.crm[0]?.data || {}).slice(0, 6)].map(h => (
                            <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {data.crm.slice(0, 50).map((r, i) => (
                          <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="p-3 text-xs text-gray-400">{i + 1}</td>
                            {Object.keys(data.crm[0]?.data || {}).slice(0, 6).map(col => (
                              <td key={col} className="p-3 text-sm dark:text-gray-300 max-w-32 truncate">
                                {r.data?.[col] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{totalInvoices} total invoices · ₹{totalRevenue.toLocaleString()} collected</p>
                  <button onClick={() => exportReport('invoices')}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
                    <Download size={14} /> Export Invoices
                  </button>
                </div>
                {data.invoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No invoice data. Go to Invoices to add or import.</div>
                ) : (
                  <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-[#0A1628]">
                        <tr>
                          {['#', ...Object.keys(data.invoices[0]?.data || {}).slice(0, 6)].map(h => (
                            <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {data.invoices.slice(0, 50).map((r, i) => (
                          <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="p-3 text-xs text-gray-400">{i + 1}</td>
                            {Object.keys(data.invoices[0]?.data || {}).slice(0, 6).map(col => (
                              <td key={col} className="p-3 text-sm dark:text-gray-300 max-w-32 truncate">
                                {r.data?.[col] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{totalProducts} products · {lowStock.length} low stock alerts</p>
                  <button onClick={() => exportReport('inventory')}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
                    <Download size={14} /> Export Inventory
                  </button>
                </div>
                {lowStock.length > 0 && (
                  <div className="p-4 rounded-xl"
                    style={{ background: '#FEF3C7', border: '1.5px solid #FBBF24' }}>
                    <p className="text-sm font-bold text-yellow-800">
                      ⚠️ {lowStock.length} product{lowStock.length > 1 ? 's' : ''} at or below reorder level
                    </p>
                    <ul className="mt-2 space-y-1">
                      {lowStock.slice(0, 5).map(r => (
                        <li key={r.id} className="text-xs text-yellow-700">
                          • {r.data?.['Item Name'] || r.data?.name || r.data?.product || 'Unknown'} — Stock: {r.data?.['Current Stock'] || r.data?.stock || '?'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.inventory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No inventory data. Go to Inventory to add or import products.</div>
                ) : (
                  <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-[#0A1628]">
                        <tr>
                          {['#', ...Object.keys(data.inventory[0]?.data || {}).slice(0, 6)].map(h => (
                            <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {data.inventory.slice(0, 50).map((r, i) => (
                          <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="p-3 text-xs text-gray-400">{i + 1}</td>
                            {Object.keys(data.inventory[0]?.data || {}).slice(0, 6).map(col => (
                              <td key={col} className="p-3 text-sm dark:text-gray-300 max-w-32 truncate">
                                {r.data?.[col] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* HR TAB */}
            {activeTab === 'hr' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {totalEmployees} employees · Monthly payroll ₹{totalPayroll.toLocaleString()}
                  </p>
                  <button onClick={() => exportReport('hr')}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
                    <Download size={14} /> Export HR
                  </button>
                </div>
                {Object.keys(deptCounts).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(deptCounts).map(([dept, count]) => (
                      <div key={dept} className="p-3 rounded-xl text-center"
                        style={{ background: '#D1FAE5', border: '1.5px solid #34D399' }}>
                        <p className="text-lg font-black text-green-800" style={{ fontFamily: 'Outfit' }}>{count}</p>
                        <p className="text-xs text-green-700 truncate">{dept}</p>
                      </div>
                    ))}
                  </div>
                )}
                {data.hr.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No HR data. Go to HR to add or import employees.</div>
                ) : (
                  <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-[#0A1628]">
                        <tr>
                          {['#', ...Object.keys(data.hr[0]?.data || {}).slice(0, 6)].map(h => (
                            <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {data.hr.slice(0, 50).map((r, i) => (
                          <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                            <td className="p-3 text-xs text-gray-400">{i + 1}</td>
                            {Object.keys(data.hr[0]?.data || {}).slice(0, 6).map(col => (
                              <td key={col} className="p-3 text-sm dark:text-gray-300 max-w-32 truncate">
                                {r.data?.[col] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </Layout>
  )
}
