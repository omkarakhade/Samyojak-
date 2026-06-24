'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { RefreshCw, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#8B5CF6', '#34D399', '#F472B6', '#FBBF24', '#60A5FA', '#F97316']

export default function BIDashboard() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    crm: any[]; invoices: any[]; inventory: any[]; hr: any[]; projects: any[]
  }>({ crm: [], invoices: [], inventory: [], hr: [], projects: [] })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id) }
    })
  }, [])

  useEffect(() => {
    if (userId) loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [crm, invoices, inventory, hr, projects] = await Promise.all([
        fetch(`/api/universal-data?userId=${userId}&module=CRM`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${userId}&module=Invoices`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${userId}&module=Inventory`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${userId}&module=HR`).then(r => r.json()),
        fetch(`/api/universal-data?userId=${userId}&module=Projects`).then(r => r.json()),
      ])
      setData({
        crm: crm.records || [],
        invoices: invoices.records || [],
        inventory: inventory.records || [],
        hr: hr.records || [],
        projects: projects.records || [],
      })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // CRM — lead status breakdown
  const leadStatusData = Object.entries(
    data.crm.reduce((acc: Record<string, number>, r) => {
      const status = r.data?.Status || r.data?.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Invoices — revenue by month
  const revenueByMonth = Object.entries(
    data.invoices.reduce((acc: Record<string, number>, r) => {
      const date = r.data?.['Issue Date'] || r.data?.['issue_date'] || r.importedAt?.substring(0, 7) || ''
      const month = date.substring(0, 7)
      if (!month) return acc
      const total = Number(r.data?.Total || r.data?.total || r.data?.Amount || 0)
      acc[month] = (acc[month] || 0) + total
      return acc
    }, {})
  ).sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, revenue]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue,
    }))

  // Invoice status pie
  const invoiceStatusData = Object.entries(
    data.invoices.reduce((acc: Record<string, number>, r) => {
      const status = r.data?.['Payment Status'] || r.data?.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // Inventory — top products by stock
  const inventoryData = data.inventory
    .map(r => ({
      name: (r.data?.['Item Name'] || r.data?.name || r.data?.product || 'Unknown').substring(0, 12),
      stock: Number(r.data?.['Current Stock'] || r.data?.stock || r.data?.quantity || 0),
    }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 8)

  // HR — payroll by department
  const payrollByDept = Object.entries(
    data.hr.reduce((acc: Record<string, number>, r) => {
      const dept = r.data?.Department || r.data?.department || 'Other'
      acc[dept] = (acc[dept] || 0) + Number(r.data?.Salary || r.data?.salary || 0)
      return acc
    }, {})
  ).map(([dept, payroll]) => ({ dept: dept.substring(0, 10), payroll }))

  // Projects — status breakdown
  const projectStatusData = Object.entries(
    data.projects.reduce((acc: Record<string, number>, r) => {
      const status = r.data?.Status || r.data?.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  // KPIs
  const totalRevenue = data.invoices.reduce((s, r) => {
    const isPaid = (r.data?.['Payment Status'] || r.data?.status || '').toLowerCase() === 'paid'
    return isPaid ? s + Number(r.data?.Total || r.data?.total || 0) : s
  }, 0)

  const totalPayroll = data.hr.reduce((s, r) => s + Number(r.data?.Salary || r.data?.salary || 0), 0)

  return (
    <Layout>
      <div className="space-y-6">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              BI Dashboard
            </h2>
            <p className="text-gray-500 text-sm">Live charts across all modules</p>
          </div>
          <button onClick={loadData}
            className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: data.crm.length, color: '#8B5CF6', bg: '#EDE9FE' },
            { label: 'Revenue Collected', value: `₹${totalRevenue.toLocaleString()}`, color: '#34D399', bg: '#D1FAE5' },
            { label: 'Products', value: data.inventory.length, color: '#FBBF24', bg: '#FEF3C7' },
            { label: 'Monthly Payroll', value: `₹${totalPayroll.toLocaleString()}`, color: '#F472B6', bg: '#FCE7F3' },
          ].map(k => (
            <div key={k.label} className="p-5 rounded-2xl"
              style={{ background: k.bg, border: `2px solid ${k.color}30` }}>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: k.color }}>{k.label}</p>
              <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Revenue Trend */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} style={{ color: '#34D399' }} />
                <h3 className="font-black text-sm dark:text-white" style={{ fontFamily: 'Outfit' }}>Revenue by Month</h3>
              </div>
              {revenueByMonth.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No invoice data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#34D399" strokeWidth={3} dot={{ fill: '#34D399', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Lead Pipeline */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Lead Pipeline</h3>
              {leadStatusData.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No CRM data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={leadStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Invoice Status Pie */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Invoice Status</h3>
              {invoiceStatusData.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No invoice data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false}>
                      {invoiceStatusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Inventory Stock */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Top Products by Stock</h3>
              {inventoryData.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No inventory data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={inventoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#FBBF24" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Payroll by Department */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Payroll by Department</h3>
              {payrollByDept.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No HR data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={payrollByDept}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Payroll']} />
                    <Bar dataKey="payroll" fill="#F472B6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Project Status */}
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
              style={{ border: '2px solid #E2E8F0' }}>
              <h3 className="font-black text-sm mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Project Status</h3>
              {projectStatusData.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No project data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {projectStatusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        )}
      </div>
    </Layout>
  )
}
