'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, AlertCircle, Upload, Trash2 } from 'lucide-react'
import ImportModal from '@/components/ImportModal'

const TAX_SYSTEMS: Record<string, { name: string; rates: number[]; label: string }> = {
  IN: { name: 'GST (India)', rates: [0, 5, 12, 18, 28], label: 'GST' },
  AU: { name: 'GST (Australia)', rates: [0, 10], label: 'GST' },
  NZ: { name: 'GST (New Zealand)', rates: [0, 15], label: 'GST' },
  SG: { name: 'GST (Singapore)', rates: [0, 9], label: 'GST' },
  CA: { name: 'HST/GST (Canada)', rates: [0, 5, 13, 15], label: 'HST' },
  GB: { name: 'VAT (UK)', rates: [0, 5, 20], label: 'VAT' },
  DE: { name: 'VAT (Germany)', rates: [0, 7, 19], label: 'VAT' },
  AE: { name: 'VAT (UAE)', rates: [0, 5], label: 'VAT' },
  US: { name: 'Sales Tax (US)', rates: [0, 5, 8, 10], label: 'Tax' },
  OTHER: { name: 'Custom Tax', rates: [0, 5, 10, 15, 20, 25], label: 'Tax' },
}

const statusColors: Record<string, string> = {
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
  const [form, setForm] = useState({
    'Client Name': '',
    'Client Email': '',
    'Client Phone': '',
    Amount: '',
    'Due Date': '',
    Notes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const taxSystem = TAX_SYSTEMS[taxCountry]
  const amount = Number(form.Amount) || 0
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
    if (!checking && canAccessModuleSync(plan as any, 'invoices')) {
      fetchInvoices()
    }
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form['Client Name'].trim()) {
      setError('Client name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      // IMPORTANT: Invoice No and Total are computed fields - DO NOT write them
      // Payment Status, Due Date, Issue Date, GST % are writable
      // We store all client info in Notes since Client is a linked field
      const noteContent = [
        `Client: ${form['Client Name'].trim()}`,
        form['Client Email'] ? `Email: ${form['Client Email']}` : '',
        form['Client Phone'] ? `Phone: ${form['Client Phone']}` : '',
        `Amount: ${amount}`,
        `${taxSystem.label} ${taxRate}%: ${taxAmount}`,
        `Total: ${total}`,
        `Tax System: ${taxSystem.name}`,
        form.Notes ? `Notes: ${form.Notes}` : '',
      ].filter(Boolean).join(' | ')

      const fields: Record<string, unknown> = {
        'Payment Status': 'Unpaid',
        'Issue Date': new Date().toISOString().split('T')[0],
        'GST %': taxRate,
        Notes: noteContent,
      }
      if (form['Due Date']) fields['Due Date'] = form['Due Date']

      const result = await airtable.create('Invoices', fields)
      console.log('Invoice created:', result.id)

      setShowModal(false)
      setForm({
        'Client Name': '', 'Client Email': '', 'Client Phone': '',
        Amount: '', 'Due Date': '', Notes: '',
      })
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
    } catch (e: any) {
      setError('Update failed: ' + e.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    try {
      await airtable.del('Invoices', id)
      await fetchInvoices()
    } catch (e: any) {
      setError('Delete failed: ' + e.message)
    }
  }

  const sendWhatsApp = (inv: any) => {
    const notes = inv.fields?.Notes || ''
    const phoneMatch = notes.match(/Phone: ([^|]+)/)
    const phone = phoneMatch ? phoneMatch[1].trim().replace(/\D/g, '') : ''
    const clientMatch = notes.match(/Client: ([^|]+)/)
    const clientName = clientMatch ? clientMatch[1].trim() : 'Customer'
    const invNo = inv.fields?.['Invoice No'] || ''
    const totalMatch = notes.match(/Total: ([0-9.]+)/)
    const totalAmt = totalMatch ? totalMatch[1] : ''
    const msg = encodeURIComponent(
      `Hi ${clientName}, your Invoice #${invNo} for ₹${totalAmt} is due. Please make payment at your earliest. Thank you! - Samyojak`
    )
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    } else {
      alert('No phone number found for this invoice. Add phone when creating invoice.')
    }
  }

  const exportCSV = () => {
    const rows = [
      ['Invoice No', 'Client', 'GST %', 'Amount', 'Tax Amount', 'Total', 'Payment Status', 'Issue Date', 'Due Date'],
      ...invoices.map(i => {
        const notes = i.fields?.Notes || ''
        const clientMatch = notes.match(/Client: ([^|]+)/)
        const amtMatch = notes.match(/Amount: ([0-9.]+)/)
        const totalMatch = notes.match(/Total: ([0-9.]+)/)
        const taxMatch = notes.match(/[\w]+ \d+%: ([0-9.]+)/)
        return [
          i.fields?.['Invoice No'] || '',
          clientMatch ? clientMatch[1].trim() : '',
          i.fields?.['GST %'] || '',
          amtMatch ? amtMatch[1] : '',
          taxMatch ? taxMatch[1] : '',
          totalMatch ? totalMatch[1] : '',
          i.fields?.['Payment Status'] || '',
          i.fields?.['Issue Date'] || '',
          i.fields?.['Due Date'] || '',
        ]
      })
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'invoices.csv'
    a.click()
  }

  const overdue = invoices.filter(i =>
    i.fields?.['Payment Status'] === 'Unpaid' &&
    i.fields?.['Due Date'] &&
    new Date(i.fields['Due Date']) < new Date()
  )

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
        {showImport && (
          <ImportModal module="Invoices" onClose={() => setShowImport(false)} onSuccess={fetchInvoices} />
        )}

        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              ⚠️ {overdue.length} overdue invoice{overdue.length > 1 ? 's' : ''} — follow up now
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Invoices
            </h2>
            <p className="text-gray-500 text-sm">
              {invoices.length} invoices · GST, VAT, HST, Sales Tax
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#FCE7F3', color: '#9D174D', border: '2px solid #F472B6' }}
            >
              <Upload size={16} /> Import
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>
              No invoices yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">Create your first invoice or import from CSV</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#FCE7F3', color: '#9D174D', border: '2px solid #F472B6' }}
              >
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
                  {['Invoice #', 'Client', 'Amount Details', 'Tax', 'Status', 'Dates', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {invoices.map(inv => {
                  const notes = inv.fields?.Notes || ''
                  const clientMatch = notes.match(/Client: ([^|]+)/)
                  const clientName = clientMatch ? clientMatch[1].trim() : '—'
                  const amtMatch = notes.match(/Amount: ([0-9.]+)/)
                  const totalMatch = notes.match(/Total: ([0-9.]+)/)
                  const taxSysMatch = notes.match(/Tax System: ([^|]+)/)

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-sm font-bold dark:text-white">
                        #{inv.fields?.['Invoice No'] || 'Auto'}
                      </td>
                      <td className="p-4 font-medium text-sm dark:text-white">{clientName}</td>
                      <td className="p-4 text-sm">
                        <div className="text-gray-600 dark:text-gray-300">
                          Amount: ₹{amtMatch ? Number(amtMatch[1]).toLocaleString() : '—'}
                        </div>
                        <div className="text-gray-900 dark:text-white font-bold">
                          Total: ₹{totalMatch ? Number(totalMatch[1]).toLocaleString() : '—'}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {inv.fields?.['GST %']}%
                        <div className="text-xs text-gray-400">
                          {taxSysMatch ? taxSysMatch[1].trim().split('(')[0] : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.fields?.['Payment Status']] || 'bg-gray-100 text-gray-600'}`}>
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
                            <button
                              onClick={() => markPaid(inv.id)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => sendWhatsApp(inv)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #F472B6' }}
            >
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Create Invoice
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Client Name', label: 'Client Name *', type: 'text', required: true, placeholder: 'Client or company name' },
                  { key: 'Client Email', label: 'Client Email', type: 'email', required: false, placeholder: 'client@email.com' },
                  { key: 'Client Phone', label: 'Client WhatsApp', type: 'tel', required: false, placeholder: '+91 9876543210' },
                  { key: 'Amount', label: 'Amount (before tax) *', type: 'number', required: true, placeholder: '0' },
                  { key: 'Due Date', label: 'Due Date', type: 'date', required: false, placeholder: '' },
                  { key: 'Notes', label: 'Additional Notes', type: 'text', required: false, placeholder: 'Any additional info' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                      style={{ fontFamily: 'Outfit' }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>
                    Tax Country
                  </label>
                  <select
                    value={taxCountry}
                    onChange={e => {
                      setTaxCountry(e.target.value)
                      const sys = TAX_SYSTEMS[e.target.value]
                      setTaxRate(sys.rates.find(r => r > 0) || 0)
                    }}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white"
                  >
                    {Object.entries(TAX_SYSTEMS).map(([code, sys]) => (
                      <option key={code} value={code}>{sys.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>
                    {taxSystem.label} Rate
                  </label>
                  <select
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white"
                  >
                    {taxSystem.rates.map(r => (
                      <option key={r} value={r}>{r}% {taxSystem.label}</option>
                    ))}
                  </select>
                </div>

                {amount > 0 && (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span>₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{taxSystem.label} ({taxRate}%)</span>
                      <span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/20 pt-1">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50"
                  >
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
