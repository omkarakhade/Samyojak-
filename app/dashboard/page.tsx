'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import OnboardingTour from '@/components/OnboardingTour'
import { airtable } from '@/lib/airtable'
import { Users, DollarSign, FileText, FolderOpen, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }))
    Promise.all([airtable.get('Leads'), airtable.get('Invoices')])
      .then(([l, i]) => {
        setLeads(l.records || [])
        setInvoices(i.records || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const revenue = invoices
    .filter(i => i.fields?.Status === 'Paid')
    .reduce((s, i) => s + (i.fields?.Total || 0), 0)

  const openInvoices = invoices.filter(i => i.fields?.Status === 'Unpaid').length

  const pipelineValue = leads
    .filter(l => l.fields?.Status !== 'Lost')
    .reduce((s, l) => s + (l.fields?.['Deal Value'] || 0), 0)

  const forecast = revenue + pipelineValue * 0.15

  const convertedLeads = leads.filter(l => l.fields?.Status === 'Converted').length
  const healthScore = Math.min(100, Math.floor((convertedLeads / Math.max(leads.length, 1)) * 100 + 30))

  const metrics = [
    { label: 'Pipeline Growth', value: leads.length, icon: Users, color: 'bg-purple-500', change: '+12%', up: true },
    { label: 'Revenue Flow', value: `₹${revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-pink-500', change: '+8.4%', up: true },
    { label: 'Active Ledgers', value: openInvoices, icon: FileText, color: 'bg-orange-500', change: '-2', up: false },
    { label: 'Ops Velocity', value: 12, icon: FolderOpen, color: 'bg-emerald-500', change: '+1', up: true },
  ]

  const revenueData = [
    { m: 'Jan', v: 8000 },
    { m: 'Feb', v: 14000 },
    { m: 'Mar', v: 15000 },
    { m: 'Apr', v: 18000 },
    { m: 'May', v: 21000 },
    { m: 'Jun', v: 28000 },
    { m: 'Jul', v: 35000 },
    { m: 'Aug', v: 40000 },
  ]

  const leadData = [
    { w: 'W1', v: 48 },
    { w: 'W2', v: 55 },
    { w: 'W3', v: 62 },
    { w: 'W4', v: 68 },
    { w: 'W5', v: 75 },
    { w: 'W6', v: 85 },
    { w: 'W7', v: 95 },
    { w: 'W8', v: 110 },
  ]

  return (
    <Layout>
      <OnboardingTour />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                System Online 🌤️
              </h1>
              <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
                {dateStr} · SYNC ACTIVE
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
              <Activity size={16} />
              Intelligence Export
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${m.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    <m.icon size={20} className="text-white" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${m.up ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {m.change}
                  </span>
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{m.value}</p>
                <p className="text-gray-400 text-xs mt-1">VARIANCE</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                    Revenue Matrix
                  </h3>
                  <p className="text-gray-400 text-xs">Cross-Quarter Data</p>
                </div>
                <span className="text-xs text-purple-500 font-semibold">📈 Scaling Efficiently</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f080" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 12, color: '#fff' }} />
                  <Bar dataKey="v" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-6 border border-gray-100 dark:border-white/5">
              <div className="mb-4">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                  Lead Velocity
                </h3>
                <p className="text-gray-400 text-xs">Momentum Flow</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={leadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f080" />
                  <XAxis dataKey="w" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 12, color: '#fff' }} />
                  <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Revenue Forecast</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                ₹{Math.floor(forecast).toLocaleString()}
              </p>
              <p className="text-green-500 text-xs mt-1">↑ Projected next 30 days</p>
            </div>
            <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Business Health Score</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {healthScore}
                <span className="text-lg text-gray-400">/100</span>
              </p>
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Pipeline Value</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                ₹{pipelineValue.toLocaleString()}
              </p>
              <p className="text-blue-500 text-xs mt-1">↑ Active opportunities</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
