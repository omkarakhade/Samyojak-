'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { airtable } from '@/lib/airtable'
import { Plus, Download, AlertCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700',
  Unpaid: 'bg-red-100 text-red-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-200 text-red-800',
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [gstRate, setGstRate] = useState(18)
  const [form, setForm] = useState({
    'Client Name': '', 'Client Email': '', 'Client Phone': '',
    Amount: '', 'Due Date': '', Notes: '',
  })

  const fetchInvoices = async () => {
    try {
      const d = await airtable.get('Invoices')
      setInvoices(d.records || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [])

  const amount = Number(form.Amount) || 0
  const gstAmount = Math.round((amount * gstRate) / 100)
  const total = amount + gstAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const invNo = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    await airtable.create('Invoices', {
      ...form,
      'Invoice No': invNo,
      Amount: amount,
      'GST Rate': gstRate,
      'GST Amount': gstAmount,
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
    const msg = encodeURIComponent(
      `Hi ${inv.fields?.['Client Name']}, your Invoice ${inv.fields?.['Invoice No']} for ₹${inv.fields?.Total?.toLocaleString()} is ready. Please make the payment at your earliest convenience. Thank you! - Samyojak`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const exportCSV = () => {
    const csv = ['Invoice No,Client,Amount,GST,Total,Status']
      .concat(invoices.map(i =>
        `${i.fields?.['Invoice No'] || ''},${i.fields?.['Client Name'] || ''},${i.fields?.Amount || ''},${i.fields?.['GST Amount'] || ''},${i.fields?.Total || ''},${i.fields?.Status || ''}`
      ))
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

  return (
    <Layout>
      <div className="space-y-4">
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              ⚠️ {overdue.length} overdue invoice{overdue.length > 1 ? 's' : ''} need attention
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoices</h2>
            <p className="text-gray-500 text-sm">GST invoices with payment tracking</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No invoices yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first GST invoice</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700"
            >
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {['Invoice No', 'Client', 'Amount', 'GST', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm dark:text-white">{inv.fields?.['Invoice No']}</td>
                    <td className="p-4 font-medium text-sm dark:text-white">{inv.fields?.['Client Name']}</td>
                    <td className="p-4 text-gray-500 text-sm">₹{(inv.fields?.Amount || 0).toLocaleString()}</td>
                    <td className="p-4 text-gray-500 text-sm">₹{(inv.fields?.['GST Amount'] || 0).toLocaleString()}</td>
                    <td className="p-4 font-bold text-sm dark:text-white">₹{(inv.fields?.Total || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.fields?.Status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.fields?.Status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {inv.fields?.Status === 'Unpaid' && (
                          <button
                            onClick={() => markPaid(inv.id)}
                            className="bg-green-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => sendWhatsApp(inv)}
                          className="bg-green-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          WhatsApp
                        </button>
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
                  { key: 'Client Phone', label: 'Client WhatsApp (+91)', type: 'tel' },
                  { key: 'Amount', label: 'Amount (₹)', type: 'number', required: true },
                  { key: 'Due Date', label: 'Due Date', type: 'date' },
                  { key: 'Notes', label: 'Notes', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate</label>
                  <select
                    value={gstRate}
                    onChange={e => setGstRate(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[0, 5, 12, 18, 28].map(r => (
                      <option key={r} value={r}>{r}% GST</option>
                    ))}
                  </select>
                </div>
                {amount > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span><span>₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>GST ({gstRate}%)</span><span>₹{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 border-t pt-1">
                      <span>Total</span><span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700"
                  >
                    Create Invoice
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
