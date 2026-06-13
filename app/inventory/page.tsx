'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, AlertTriangle, Upload } from 'lucide-react'
import ImportModal from '@/components/ImportModal'

export default function Inventory() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({
    'Item Name': '', SKU: '', Category: '',
    'Current Stock': '', 'Reorder Level': '',
    'Unit Price': '', Supplier: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const fetchProducts = async () => {
    try {
      const d = await airtable.get('Products')
      setProducts(d.records || [])
    } catch (e) { }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'inventory')) {
      fetchProducts()
    }
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sku = form.SKU || `SKU-${Date.now()}`
    await airtable.create('Products', {
      ...form, SKU: sku,
      'Current Stock': Number(form['Current Stock']),
      'Reorder Level': Number(form['Reorder Level']),
      'Unit Price': Number(form['Unit Price']),
    })
    setShowModal(false)
    setForm({ 'Item Name': '', SKU: '', Category: '', 'Current Stock': '', 'Reorder Level': '', 'Unit Price': '', Supplier: '' })
    fetchProducts()
  }

  const exportCSV = () => {
    const csv = ['Name,SKU,Category,Stock,Reorder Level,Price,Supplier']
      .concat(products.map(p =>
        `${p.fields?.['Item Name'] || ''},${p.fields?.SKU || ''},${p.fields?.Category || ''},${p.fields?.['Current Stock'] || ''},${p.fields?.['Reorder Level'] || ''},${p.fields?.['Unit Price'] || ''},${p.fields?.Supplier || ''}`
      )).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'inventory.csv'
    a.click()
  }

  const lowStock = products.filter(p =>
    (p.fields?.['Current Stock'] || 0) < (p.fields?.['Reorder Level'] || 0)
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
          <ImportModal module="Products" onClose={() => setShowImport(false)} onSuccess={fetchProducts} />
        )}

        {lowStock.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">⚠️ {lowStock.length} product{lowStock.length > 1 ? 's' : ''} below reorder level</span>
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
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setShowModal(true)}
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
            <p className="text-gray-500 text-sm mb-6">Add products or import from CSV</p>
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
                <tr>{['Product', 'SKU', 'Category', 'Stock', 'Reorder', 'Price', 'QR Code'].map(h => (
                  <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {products.map(p => {
                  const stock = p.fields?.['Current Stock'] || 0
                  const reorder = p.fields?.['Reorder Level'] || 0
                  const sku = p.fields?.SKU || 'SKU'
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-4 font-medium text-sm dark:text-white">{p.fields?.['Item Name']}</td>
                      <td className="p-4 text-gray-500 text-sm font-mono">{sku}</td>
                      <td className="p-4 text-gray-500 text-sm">{p.fields?.Category}</td>
                      <td className="p-4">
                        <span className={`font-bold text-sm ${stock < reorder ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {stock} {stock < reorder && '⚠️'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{reorder}</td>
                      <td className="p-4 text-gray-900 dark:text-white text-sm font-medium">₹{(p.fields?.['Unit Price'] || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(sku)}&size=60x60`}
                          alt={`QR ${sku}`} className="w-12 h-12 rounded border" loading="lazy" />
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
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #FBBF24' }}>
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit' }}>Add Product</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Item Name', label: 'Product Name', type: 'text', required: true },
                  { key: 'SKU', label: 'SKU (auto if blank)', type: 'text' },
                  { key: 'Category', label: 'Category', type: 'text' },
                  { key: 'Current Stock', label: 'Current Stock', type: 'number', required: true },
                  { key: 'Reorder Level', label: 'Reorder Level', type: 'number' },
                  { key: 'Unit Price', label: 'Unit Price (₹)', type: 'number' },
                  { key: 'Supplier', label: 'Supplier', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{f.label}</label>
                    <input type={f.type} required={f.required} value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" className="candy-btn flex-1 py-2 text-sm">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
