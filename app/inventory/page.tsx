'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, AlertTriangle, Upload, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import ImportModal from '@/components/ImportModal'
import UniversalDataView from '@/components/UniversalDataView'

export default function Inventory() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    'Item Name': '',
    SKU: '',
    Category: '',
    'Current Stock': '',
    'Reorder Level': '',
    'Unit Price': '',
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

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Products')
      setProducts(d.records || [])
    } catch (e: any) {
      setError('Could not load products: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'inventory')) fetchProducts()
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form['Item Name'].trim()) { setError('Product name is required'); return }
    setSaving(true)
    setError('')
    try {
      const fields: Record<string, unknown> = {
        'Item Name': form['Item Name'].trim(),
        SKU: form.SKU.trim() || `SKU-${Date.now()}`,
      }
      if (form.Category.trim()) fields['Category'] = form.Category.trim()
      if (form['Current Stock']) fields['Current Stock'] = Number(form['Current Stock'])
      if (form['Reorder Level']) fields['Reorder Level'] = Number(form['Reorder Level'])
      if (form['Unit Price']) fields['Unit Price'] = Number(form['Unit Price'])
      await airtable.create('Products', fields)
      setShowModal(false)
      setForm({ 'Item Name': '', SKU: '', Category: '', 'Current Stock': '', 'Reorder Level': '', 'Unit Price': '' })
      await fetchProducts()
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await airtable.del('Products', id)
      await fetchProducts()
    } catch (e: any) { setError('Delete failed: ' + e.message) }
  }

  const exportCSV = () => {
    const rows = [
      ['Item Name', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Unit Price'],
      ...products.map(p => [
        p.fields?.['Item Name'] || '',
        p.fields?.SKU || '',
        p.fields?.Category || '',
        p.fields?.['Current Stock'] || '',
        p.fields?.['Reorder Level'] || '',
        p.fields?.['Unit Price'] || '',
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'inventory.csv'
    a.click()
  }

  const lowStock = products.filter(p =>
    (p.fields?.['Current Stock'] || 0) <= (p.fields?.['Reorder Level'] || 0) &&
    (p.fields?.['Reorder Level'] || 0) > 0
  )

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'inventory')) {
    return <Layout><LockedModule moduleName="Inventory" requiredPlan="ERP Basic" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">

        {showImport && (
          <ImportModal module="Inventory" onClose={() => setShowImport(false)} onSuccess={fetchProducts} />
        )}

        {lowStock.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              ⚠️ {lowStock.length} product{lowStock.length > 1 ? 's' : ''} at or below reorder level
            </span>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>Inventory</h2>
            <p className="text-gray-500 text-sm">{products.length} products · Free QR codes included</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#FEF3C7', color: '#92400E', border: '2px solid #FBBF24' }}>
              <Upload size={16} /> Import CSV
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
              <Download size={16} /> Export
            </button>
            <button onClick={fetchProducts}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-bold dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>No products yet</h3>
            <p className="text-gray-500 text-sm mb-4">Import from any POS, inventory, or accounting software</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#FEF3C7', color: '#92400E', border: '2px solid #FBBF24' }}>
                <Upload size={16} /> Import CSV
              </button>
              <button onClick={() => setShowModal(true)} className="candy-btn px-6 py-2 text-sm">
                Add First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {['Product', 'SKU', 'Category', 'Stock', 'Reorder', 'Price', 'QR Code', ''].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {products.map(p => {
                  const stock = p.fields?.['Current Stock'] || 0
                  const reorder = p.fields?.['Reorder Level'] || 0
                  const sku = p.fields?.SKU || 'SKU'
                  const qrUrl = p.fields?.['QR Code URL'] ||
                    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(sku)}&size=60x60`
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-sm dark:text-white">{p.fields?.['Item Name']}</td>
                      <td className="p-4 text-gray-500 text-xs font-mono">{sku}</td>
                      <td className="p-4 text-gray-500 text-sm">{p.fields?.Category || '—'}</td>
                      <td className="p-4">
                        <span className={`font-bold text-sm ${stock <= reorder && reorder > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {stock}{stock <= reorder && reorder > 0 ? ' ⚠️' : ''}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{reorder}</td>
                      <td className="p-4 text-gray-900 dark:text-white text-sm font-medium">
                        ₹{(p.fields?.['Unit Price'] || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <img src={qrUrl} alt={`QR ${sku}`} className="w-12 h-12 rounded border" loading="lazy" />
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
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
                  📂 Imported Inventory Data
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#FEF3C7', color: '#92400E' }}>
                  Zero data loss
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Imported from any inventory, POS, or accounting system — every column preserved
              </p>
            </div>
            <UniversalDataView userId={userId} module="Inventory" color="#FBBF24" bg="#FEF3C7" />
          </div>
        )}

        {/* Add Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #FBBF24' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Add Product</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Item Name', label: 'Product Name *', type: 'text', required: true, ph: 'Product name' },
                  { key: 'SKU', label: 'SKU (auto if blank)', type: 'text', required: false, ph: 'e.g. SKU-001' },
                  { key: 'Category', label: 'Category', type: 'text', required: false, ph: 'e.g. Electronics' },
                  { key: 'Current Stock', label: 'Current Stock *', type: 'number', required: true, ph: '0' },
                  { key: 'Reorder Level', label: 'Reorder Alert Level', type: 'number', required: false, ph: '10' },
                  { key: 'Unit Price', label: 'Unit Price (₹)', type: 'number', required: false, ph: '0' },
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
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Product'}
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
