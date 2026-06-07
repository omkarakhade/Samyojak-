'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, AlertCircle } from 'lucide-react'

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

const statusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700',
  Unpaid: 'bg-red-100 text-red-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-200 text-red-800',
}

export default function Invoices() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [taxCountry, setTaxCountry] = useState('IN')
  const [taxRate, setTaxRate] = useState(18)
  const [form, setForm] = useState({
    'Client Name': '', 'Client Email': '', 'Client Phone': '',
    Amount: '', 'Due Date': '', Notes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const taxSystem = TAX_SYSTEMS[taxCountry]

  const fetchInvoices = async () => {
    try {
      const d = await airtable.get('Invoices')
      setInvoices(d.records || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'invoices')) {
      fetchInvoices()
    }
  }, [checking, plan])

  const amount = Number(form.Amount) || 0
  const taxAmount = Math.round((amount * taxRate) / 100)
  const total = amount + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const invNo = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    await airtable.create('Invoices', {
      ...form,
      'Invoice No': invNo,
      Amount: amount,
      'Tax System': taxSystem.name,
      'Tax Label': taxSystem.label,
      'Tax Rate': taxRate,
      'Tax Amount': taxAmount,
      Total: total,
      Status: 'Unpaid',
      'Issue Date': new Date().toISOString().split('T')[0],
    })
    setShowModal(false)
    setForm({ 'Client Name': '', 'Client Email': '', 'Client Phone': '', Amount: '', 'Due Date': '', Notes: '' })
    fetchInvoices()
  }

  const markPaid = async (id: string) => {
    await airtable.update('Invoices', id, { Status: 'Paid' })
    fetchInvoices()
  }

  const sendWhatsApp = (inv: any) => {
    const phone = inv.fields?.['Client Phone']?.replace(/\D/g, '') || ''
    const msg = encodeURIComponent(`Hi ${inv.fields?.['Client Name']}, your Invoice ${inv.fields?.['Invoice No']} for ${inv.fields?.Total?.toLocaleString()} is ready. Thank you! - Samyojak`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const exportCSV = () => {
    const csv = ['Invoice No,Client,Amount,Tax,Total,Status']
      .concat(invoices.map(i => `${i.fields?.['Invoice No'] || ''},${i.fields?.['Client Name'] || ''},${i.fields?.Amount || ''},${i.fields?.['Tax Amount'] || ''},${i.fields?.Total || ''},${i.fields?.Status || ''}`))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'invoices.csv'
    a.click()
  }

  const overdue = invoices.filter(i =>
    i.fields?.Status === 'Unpaid' &&
    i.fields?.['Due Date'] &&
    new Date(i.fields['Due Date']) < new Date()
  )

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </Layout>
  )

  if (!canAccessModuleSync(plan as any, 'invoices')) {
    return <Layout><LockedModule moduleName="Invoices" requiredPlan="ERP Basic" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">⚠️ {overdue.length} overdue invoice{overdue.length > 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoices</h2>
            <p className="text-gray-500 text-sm">Universal tax engine — GST, VAT, HST, Sales Tax</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">No invoices yet</h3>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm mt-4 hover:bg-blue-700">Create First Invoice</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>{['Invoice', 'Client', 'Amount', 'Tax', 'Total', 'Status', 'Actions'].map(h => <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4 font-mono text-sm dark:text-white">{inv.fields?.['Invoice No']}</td>
                    <td className="p-4 font-medium text-sm dark:text-white">{inv.fields?.['Client Name']}</td>
                    <td className="p-4 text-gray-500 text-sm">{inv.fields?.Amount?.toLocaleString()}</td>
                    <td className="p-4 text-sm">
                      <span className="text-gray-500">{inv.fields?.['Tax Label'] || 'GST'} {inv.fields?.['Tax Rate']}%</span>
                      <div className="text-xs text-gray-400">{inv.fields?.['Tax Amount']?.toLocaleString()}</div>
                    </td>
                    <td className="p-4 font-bold text-sm dark:text-white">{inv.fields?.Total?.toLocaleString()}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.fields?.Status] || 'bg-gray-100 text-gray-600'}`}>{inv.fields?.Status}</span></td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {inv.fields?.Status === 'Unpaid' && (
                          <button onClick={() => markPaid(inv.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-green-700">Mark Paid</button>
                        )}
                        <button onClick={() => sendWhatsApp(inv)} className="bg-green-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-green-600">WhatsApp</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Create Invoice</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Client Name', label: 'Client Name', type: 'text', required: true },
                  { key: 'Client Email', label: 'Client Email', type: 'email' },
                  { key: 'Client Phone', label: 'Client Phone (WhatsApp)', type: 'tel' },
                  { key: 'Amount', label: 'Amount', type: 'number', required: true },
                  { key: 'Due Date', label: 'Due Date', type: 'date' },
                  { key: 'Notes', label: 'Notes', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input type={f.type} required={f.required} value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax System</label>
                  <select value={taxCountry} onChange={e => { setTaxCountry(e.target.value); setTaxRate(TAX_SYSTEMS[e.target.value].rates.find(r => r > 0) || 0) }} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    {Object.entries(TAX_SYSTEMS).map(([code, sys]) => <option key={code} value={code}>{sys.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{taxSystem.label} Rate</label>
                  <select value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    {taxSystem.rates.map(r => <option key={r} value={r}>{r}% {taxSystem.label}</option>)}
                  </select>
                </div>
                {amount > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{amount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-gray-600"><span>{taxSystem.label} ({taxRate}%)</span><span>{taxAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 border-t pt-1"><span>Total</span><span>{total.toLocaleString()}</span></div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700">Create Invoice</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
