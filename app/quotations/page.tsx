'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Plus, AlertCircle, RefreshCw, Download } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

const TAX_SYSTEMS: Record<string, { name: string; rates: number[]; label: string }> = {
  IN: { name: 'GST (India)', rates: [0, 5, 12, 18, 28], label: 'GST' },
  GB: { name: 'VAT (UK)', rates: [0, 5, 20], label: 'VAT' },
  US: { name: 'Sales Tax (US)', rates: [0, 5, 8, 10], label: 'Tax' },
  AU: { name: 'GST (Australia)', rates: [0, 10], label: 'GST' },
  AE: { name: 'VAT (UAE)', rates: [0, 5], label: 'VAT' },
  CA: { name: 'HST/GST (Canada)', rates: [0, 5, 13, 15], label: 'HST' },
  DE: { name: 'VAT (Germany)', rates: [0, 7, 19], label: 'VAT' },
  OTHER: { name: 'Custom Tax', rates: [0, 5, 10, 15, 20], label: 'Tax' },
}

interface LineItem {
  description: string
  quantity: string
  unitPrice: string
}

export default function Quotations() {
  const [userId, setUserId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [taxCountry, setTaxCountry] = useState('IN')
  const [taxRate, setTaxRate] = useState(18)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: '1', unitPrice: '' }
  ])
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    validUntil: '',
    notes: '',
    status: 'Draft',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const taxSystem = TAX_SYSTEMS[taxCountry]
  const subtotal = lineItems.reduce((s, item) => s + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)
  const taxAmount = Math.round((subtotal * taxRate) / 100)
  const total = subtotal + taxAmount

  const addLineItem = () => setLineItems(prev => [...prev, { description: '', quantity: '1', unitPrice: '' }])
  const removeLineItem = (i: number) => setLineItems(prev => prev.filter((_, idx) => idx !== i))
  const updateLineItem = (i: number, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const downloadPDF = (record: Record<string, string>) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1E293B; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: 900; color: #8B5CF6; }
          .title { font-size: 32px; font-weight: 900; color: #8B5CF6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #8B5CF6; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #E2E8F0; }
          .total-row { font-weight: bold; background: #EDE9FE; }
          .footer { margin-top: 40px; color: #64748B; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Samyojak</div>
            <div>The ERP that adapts to you</div>
          </div>
          <div>
            <div class="title">QUOTATION</div>
            <div>Status: ${record['Status'] || 'Draft'}</div>
            <div>Date: ${record['Issue Date'] || new Date().toLocaleDateString()}</div>
            ${record['Valid Until'] ? `<div>Valid Until: ${record['Valid Until']}</div>` : ''}
          </div>
        </div>
        <div>
          <strong>To:</strong><br/>
          ${record['Client Name'] || ''}<br/>
          ${record['Client Email'] ? `${record['Client Email']}<br/>` : ''}
          ${record['Client Phone'] ? `${record['Client Phone']}<br/>` : ''}
        </div>
        <table>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
          ${JSON.parse(record['Line Items JSON'] || '[]').map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>₹${Number(item.unitPrice).toLocaleString()}</td>
              <td>₹${(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="3">Subtotal</td>
            <td>₹${Number(record['Subtotal'] || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="3">${record['Tax Label'] || 'Tax'} (${record['Tax Rate'] || '0%'})</td>
            <td>₹${Number(record['Tax Amount'] || 0).toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>₹${Number(record['Total'] || 0).toLocaleString()}</strong></td>
          </tr>
        </table>
        ${record['Notes'] ? `<div><strong>Notes:</strong> ${record['Notes']}</div>` : ''}
        <div class="footer">
          Generated by Samyojak ERP · samyojak.vercel.app
        </div>
      </body>
      </html>
    `
    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `quotation-${record['Client Name'] || 'quote'}.html`
    a.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName.trim()) { setError('Client name is required'); return }
    if (lineItems.every(i => !i.description.trim())) { setError('Add at least one line item'); return }
    setSaving(true)
    setError('')
    try {
      const validItems = lineItems.filter(i => i.description.trim())
      const record: Record<string, string> = {
        'Client Name': form.clientName.trim(),
        'Client Email': form.clientEmail.trim(),
        'Client Phone': form.clientPhone.trim(),
        'Issue Date': new Date().toISOString().split('T')[0],
        'Valid Until': form.validUntil,
        'Status': form.status,
        'Tax Country': taxCountry,
        'Tax System': taxSystem.name,
        'Tax Label': taxSystem.label,
        'Tax Rate': `${taxRate}%`,
        'Subtotal': String(subtotal),
        'Tax Amount': String(taxAmount),
        'Total': String(total),
        'Line Items JSON': JSON.stringify(validItems),
        'Line Items Summary': validItems.map(i => `${i.description} x${i.quantity} @ ₹${i.unitPrice}`).join(' | '),
        'Notes': form.notes.trim(),
        Source: 'manual_entry',
      }

      const res = await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, module: 'Quotations', record }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save')

      setShowModal(false)
      setForm({ clientName: '', clientEmail: '', clientPhone: '', validUntil: '', notes: '', status: 'Draft' })
      setLineItems([{ description: '', quantity: '1', unitPrice: '' }])
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
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

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Sales Quotations
            </h2>
            <p className="text-gray-500 text-sm">Build quotes, download PDF, convert to invoice</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> New Quote
            </button>
          </div>
        </div>

        {userId && (
          <UniversalDataView
            key={refreshKey}
            userId={userId}
            module="Quotations"
            color="#34D399"
            bg="#D1FAE5"
          />
        )}

        {/* New Quote Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                New Sales Quotation
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Client details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'clientName', label: 'Client Name *', type: 'text', required: true, ph: 'Client or company name' },
                    { key: 'clientEmail', label: 'Client Email', type: 'email', required: false, ph: 'client@email.com' },
                    { key: 'clientPhone', label: 'Client Phone', type: 'tel', required: false, ph: '+91 9876543210' },
                    { key: 'validUntil', label: 'Valid Until', type: 'date', required: false, ph: '' },
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
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {['Draft', 'Sent', 'Accepted', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Line items */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-3 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Line Items</label>
                  <div className="space-y-2">
                    {lineItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-start">
                        <input
                          className="col-span-6 border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm outline-none dark:bg-white/5 dark:text-white"
                          placeholder="Description"
                          value={item.description}
                          onChange={e => updateLineItem(i, 'description', e.target.value)} />
                        <input
                          className="col-span-2 border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm outline-none dark:bg-white/5 dark:text-white"
                          placeholder="Qty"
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLineItem(i, 'quantity', e.target.value)} />
                        <input
                          className="col-span-3 border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm outline-none dark:bg-white/5 dark:text-white"
                          placeholder="Unit Price"
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateLineItem(i, 'unitPrice', e.target.value)} />
                        <button type="button" onClick={() => removeLineItem(i)}
                          className="col-span-1 py-2 text-gray-400 hover:text-red-500 text-lg transition-colors">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addLineItem}
                    className="mt-2 text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                    style={{ color: '#34D399' }}>
                    <Plus size={14} /> Add Line Item
                  </button>
                </div>

                {/* Tax */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                      style={{ fontFamily: 'Outfit' }}>Tax Country</label>
                    <select value={taxCountry}
                      onChange={e => { setTaxCountry(e.target.value); setTaxRate(TAX_SYSTEMS[e.target.value].rates.find(r => r > 0) || 0) }}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                      {Object.entries(TAX_SYSTEMS).map(([code, sys]) => (
                        <option key={code} value={code}>{sys.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                      style={{ fontFamily: 'Outfit' }}>{taxSystem.label} Rate</label>
                    <select value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                      {taxSystem.rates.map(r => (
                        <option key={r} value={r}>{r}% {taxSystem.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Totals */}
                {subtotal > 0 && (
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{taxSystem.label} ({taxRate}%)</span><span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold dark:text-white border-t dark:border-white/20 pt-2">
                      <span>Total</span>
                      <span className="text-lg" style={{ color: '#34D399' }}>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={2} placeholder="Terms, validity, or any notes..."
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none resize-none dark:bg-white/5 dark:text-white" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Quotation'}
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
