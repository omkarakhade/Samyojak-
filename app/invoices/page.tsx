'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

const TAX_SYSTEMS: Record<string, { name: string; rates: number[]; label: string }> = {
  IN: { name: 'GST (India)', rates: [0, 5, 12, 18, 28], label: 'GST' },
  AU: { name: 'GST (Australia)', rates: [0, 10], label: 'GST' },
  NZ: { name: 'GST (New Zealand)', rates: [0, 15], label: 'GST' },
  SG: { name: 'GST (Singapore)', rates: [0, 9], label: 'GST' },
  CA: { name: 'HST/GST (Canada)', rates: [0, 5, 13, 15], label: 'HST' },
  MY: { name: 'SST (Malaysia)', rates: [0, 6, 10], label: 'SST' },
  GB: { name: 'VAT (UK)', rates: [0, 5, 20], label: 'VAT' },
  DE: { name: 'VAT (Germany)', rates: [0, 7, 19], label: 'VAT' },
  FR: { name: 'VAT (France)', rates: [0, 5.5, 10, 20], label: 'VAT' },
  AE: { name: 'VAT (UAE)', rates: [0, 5], label: 'VAT' },
  SA: { name: 'VAT (Saudi Arabia)', rates: [0, 15], label: 'VAT' },
  US: { name: 'Sales Tax (US)', rates: [0, 5, 8, 10], label: 'Tax' },
  JP: { name: 'Consumption Tax (Japan)', rates: [0, 8, 10], label: 'CT' },
  ZA: { name: 'VAT (South Africa)', rates: [0, 15], label: 'VAT' },
  OTHER: { name: 'Custom Tax', rates: [0, 5, 10, 15, 20, 25], label: 'Tax' },
}

export default function Invoices() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [taxCountry, setTaxCountry] = useState('IN')
  const [taxRate, setTaxRate] = useState(18)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    amount: '',
    dueDate: '',
    extraNotes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setPlan(getPlanFromMetadata(user))
        setUserId(user.id)
        setChecking(false)
      }
    })
  }, [])

  const taxSystem = TAX_SYSTEMS[taxCountry]
  const amount = Number(form.amount) || 0
  const taxAmount = Math.round((amount * taxRate) / 100)
  const total = amount + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName.trim()) { setError('Client name is required'); return }
    setSaving(true)
    setError('')
    try {
      const record: Record<string, string> = {
        'Client Name': form.clientName.trim(),
        'Payment Status': 'Unpaid',
        'Issue Date': new Date().toISOString().split('T')[0],
        'Tax Rate': `${taxRate}%`,
        'Tax System': taxSystem.name,
        'Tax Label': taxSystem.label,
        'Amount': String(amount),
        'Tax Amount': String(taxAmount),
        'Total': String(total),
        Source: 'manual_entry',
      }
      if (form.clientEmail) record['Client Email'] = form.clientEmail.trim()
      if (form.clientPhone) record['Client Phone'] = form.clientPhone.trim()
      if (form.dueDate) record['Due Date'] = form.dueDate
      if (form.extraNotes) record['Notes'] = form.extraNotes.trim()

      const res = await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, module: 'Invoices', record }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save')

      setShowModal(false)
      setForm({ clientName: '', clientEmail: '', clientPhone: '', amount: '', dueDate: '', extraNotes: '' })
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setError('Failed to create invoice: ' + e.message)
    }
    setSaving(false)
  }

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )
  if (!canAccessModuleSync(plan as any, 'invoices')) {
    return <Layout><LockedModule moduleName="Invoices" requiredPlan="ERP Basic" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* HEADER — no Import button here */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Invoices
            </h2>
            <p className="text-gray-500 text-sm">Universal tax — GST, VAT, HST, Sales Tax for 15+ countries</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        {/* UNIFIED DATA VIEW — contains the one and only Import button */}
        {userId && (
          <UniversalDataView
            key={refreshKey}
            userId={userId}
            module="Invoices"
            color="#F472B6"
            bg="#FCE7F3"
          />
        )}

        {/* Create Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #F472B6' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Create Invoice
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'clientName', label: 'Client Name *', type: 'text', required: true, ph: 'Client or company name' },
                  { key: 'clientEmail', label: 'Client Email', type: 'email', required: false, ph: 'client@email.com' },
                  { key: 'clientPhone', label: 'Client WhatsApp', type: 'tel', required: false, ph: '+91 9876543210' },
                  { key: 'amount', label: 'Amount (before tax) *', type: 'number', required: true, ph: '0' },
                  { key: 'dueDate', label: 'Due Date', type: 'date', required: false, ph: '' },
                  { key: 'extraNotes', label: 'Notes', type: 'text', required: false, ph: 'Additional info' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                      style={{ fontFamily: 'Outfit' }}>{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      placeholder={f.ph}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Tax Country</label>
                  <select
                    value={taxCountry}
                    onChange={e => {
                      setTaxCountry(e.target.value)
                      setTaxRate(TAX_SYSTEMS[e.target.value].rates.find(r => r > 0) || 0)
                    }}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {Object.entries(TAX_SYSTEMS).map(([code, sys]) => (
                      <option key={code} value={code}>{sys.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>{taxSystem.label} Rate</label>
                  <select
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {taxSystem.rates.map(r => (
                      <option key={r} value={r}>{r}% {taxSystem.label}</option>
                    ))}
                  </select>
                </div>
                {amount > 0 && (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span><span>₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{taxSystem.label} ({taxRate}%)</span><span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold dark:text-white border-t dark:border-white/20 pt-1">
                      <span>Total</span>
                      <span style={{ color: '#8B5CF6' }}>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Creating...' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
