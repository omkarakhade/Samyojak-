'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, AlertCircle, Upload, Trash2, RefreshCw } from 'lucide-react'
import ImportModal from '@/components/ImportModal'
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

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700',
  Unpaid: 'bg-red-100 text-red-700',
  Overdue: 'bg-red-200 text-red-800',
  Partial: 'bg-yellow-100 text-yellow-700',
}

export default function Invoices() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [taxCountry, setTaxCountry] = useState('IN')
  const [taxRate, setTaxRate] = useState(18)
  const [userId, setUserId] = useState('')
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

  const fetchInvoices = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Invoices')
      setInvoices(d.records || [])
    } catch (e: any) {
      setError('Could not load invoices: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'invoices')) fetchInvoices()
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName.trim()) { setError('Client name is required'); return }
    setSaving(true)
    setError('')
    try {
      const noteParts = [
        `Client: ${form.clientName.trim()}`,
        form.clientEmail ? `Email: ${form.clientEmail.trim()}` : '',
        form.clientPhone ? `Phone: ${form.clientPhone.trim()}` : '',
        `Amount: ${amount}`,
        `${taxSystem.label} ${taxRate}%: ${taxAmount}`,
        `Total: ${total}`,
        `Tax System: ${taxSystem.name}`,
        form.extraNotes ? `Notes: ${form.extraNotes.trim()}` : '',
      ].filter(Boolean).join(' | ')

      // Only write writable fields — Invoice No and Total are computed
      const fields: Record<string, unknown> = {
        'Payment Status': 'Unpaid',
        'Issue Date': new Date().toISOString().split('T')[0],
        'GST %': taxRate,
        Notes: noteParts,
      }
      if (form.dueDate) fields['Due Date'] = form.dueDate

      await airtable.create('Invoices', fields)
      setShowModal(false)
      setForm({ clientName: '', clientEmail: '', clientPhone: '', amount: '', dueDate: '', extraNotes: '' })
      await fetchInvoices()
    } catch (e: any) {
      setError('Failed to create invoice: ' + e.message)
    }
    setSaving(false)
  }

  const markPaid = async (id: string) => {
    try {
      await airtable.update('Invoices', id, { 'Payment Status': 'Paid' })
      await fetchInvoices()
    } catch (e: any) { setError('Update failed: ' + e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    try {
      await airtable.del('Invoices', id)
      await fetchInvoices()
    } catch (e: any) { setError('Delete failed: ' + e.message) }
  }

  const sendWhatsApp = (inv: any) => {
    const notes = inv.fields?.Notes || ''
    const phoneMatch = notes.match(/Phone: ([^|]+)/)
    const phone = phoneMatch ? phoneMatch[1].trim().replace(/\D/g, '') : ''
    const clientMatch = notes.match(/Client: ([^|]+)/)
    const clientName = clientMatch ? clientMatch[1].trim() : 'Customer'
    const totalMatch = notes.match(/Total: ([0-9.]+)/)
    const totalAmt = totalMatch ? Number(totalMatch[1]).toLocaleString() : ''
    const msg = encodeURIComponent(
      `Hi ${clientName}, Invoice #${inv.fields?.['Invoice No'] || ''} for ₹${totalAmt} is due. Please make payment. Thank you! — Samyojak`
    )
    if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    else alert('No phone number saved for this invoice.')
  }

  const exportCSV = () => {
    const rows = [
      ['Invoice No', 'Client', 'Amount', 'Tax Rate', 'Tax Amount', 'Total', 'Payment Status', 'Issue Date', 'Due Date'],
      ...invoices.map(i => {
        const notes = i.fields?.Notes || ''
        const client = notes.match(/Client: ([^|]+)/)?.[1]?.trim() || ''
        const amt = notes.match(/Amount: ([0-9.]+)/)?.[1] || ''
        const taxAmt = notes.match(/[\w]+ \d+(?:\.\d+)?%: ([0-9.]+)/)?.[1] || ''
        const tot = notes.match(/Total: ([0-9.]+)/)?.[1] || ''
        return [
          i.fields?.['Invoice No'] || '',
          client, amt,
          i.fields?.['GST %'] || '',
          taxAmt, tot,
          i.fields?.['Payment Status'] || '',
          i.fields?.['Issue Date'] || '',
          i.fields?.['Due Date'] || '',
        ]
      })
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'invoices.csv'
    a.click()
  }

  const parseNote = (notes: string) => {
    const client = notes.match(/Client: ([^|]+)/)?.[1]?.trim() || '—'
    const total = notes.match(/Total: ([0-9.]+)/)?.[1] || null
    const amt = notes.match(/Amount: ([0-9.]+)/)?.[1] || null
    return { client, total: total ? Number(total) : null, amt: amt ? Number(amt) : null }
  }

  const overdue = invoices.filter(i =>
    i.fields?.['Payment Status'] === 'Unpaid' &&
    i.fields?.['Due Date'] &&
    new Date(i.fields['Due Date']) < new Date()
  )

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'invoices')) {
    return <Layout><LockedModule moduleName="Invoices" requiredPlan="ERP Basic" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">

        {showImport && (
          <ImportModal module="Invoices" onClose={() => setShowImport(false)} onSuccess={fetchInvoices} />
        )}

        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">⚠️ {overdue.length} overdue invoice{overdue.length > 1 ? 's' : ''} — follow up now</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>Invoices</h2>
            <p className="text-gray-500 text-sm">{invoices.length} invoices · Universal tax — GST, VAT, HST, Sales Tax</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#FCE7F3', color: '#9D174D', border: '2px solid #F472B6' }}>
              <Upload size={16} /> Import CSV
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white">
              <Download size={16} /> Export
            </button>
            <button onClick={fetchInvoices}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>No invoices yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first invoice or import from any billing software</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#FCE7F3', color: '#9D174D', border: '2px solid #F472B6' }}>
                <Upload size={16} /> Import CSV
              </button>
              <button onClick={() => setShowModal(true)} className="candy-btn px-6 py-2 text-sm">
                Create First Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {['Invoice #', 'Client', 'Amount', 'Tax', 'Total', 'Status', 'Dates', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {invoices.map(inv => {
                  const notes = inv.fields?.Notes || ''
                  const { client, total: parsedTotal, amt: parsedAmt } = parseNote(notes)
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-sm font-bold dark:text-white">
                        #{inv.fields?.['Invoice No'] || 'Auto'}
                      </td>
                      <td className="p-4 font-medium text-sm dark:text-white">{client}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {parsedAmt ? `₹${parsedAmt.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{inv.fields?.['GST %'] || 0}%</td>
                      <td className="p-4 font-bold text-sm dark:text-white">
                        {parsedTotal ? `₹${parsedTotal.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inv.fields?.['Payment Status']] || 'bg-gray-100 text-gray-600'}`}>
                          {inv.fields?.['Payment Status'] || 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        <div>Issued: {inv.fields?.['Issue Date'] || '—'}</div>
                        <div>Due: {inv.fields?.['Due Date'] || '—'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {inv.fields?.['Payment Status'] !== 'Paid' && (
                            <button onClick={() => markPaid(inv.id)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors">
                              Mark Paid
                            </button>
                          )}
                          <button onClick={() => sendWhatsApp(inv)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition-colors">
                            WhatsApp
                          </button>
                          <button onClick={() => handleDelete(inv.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* UNIVERSAL IMPORT SECTION */}
        {userId && (
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-white/10">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-black dark:text-white" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  📂 Imported Invoice Data
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#FCE7F3', color: '#9D174D' }}>
                  Zero data loss
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Imported from Tally, QuickBooks, Busy, Excel, or any billing software — every column preserved
              </p>
            </div>
            <UniversalDataView userId={userId} module="Invoices" color="#F472B6" bg="#FCE7F3" />
          </div>
        )}

        {/* Create Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #F472B6' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Create Invoice</h3>
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
                    <input type={f.type} required={f.required} placeholder={f.ph}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Tax Country</label>
                  <select value={taxCountry}
                    onChange={e => { setTaxCountry(e.target.value); setTaxRate(TAX_SYSTEMS[e.target.value].rates.find(r => r > 0) || 0) }}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {Object.entries(TAX_SYSTEMS).map(([code, sys]) => (
                      <option key={code} value={code}>{sys.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>{taxSystem.label} Rate</label>
                  <select value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
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
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
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
