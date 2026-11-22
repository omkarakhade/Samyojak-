'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { qrSvg, productQrText } from '@/lib/qr'
import { Printer, ArrowLeft } from 'lucide-react'

type Label = { id: string; name: string; sku: string; price: string }

function pick(data: Record<string, any>, pattern: RegExp): string {
  const key = Object.keys(data || {}).find(k => pattern.test(k) && data[k] !== '' && data[k] != null)
  return key ? String(data[key]) : ''
}

export default function InventoryLabels() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
      try {
        const res = await fetch('/api/universal-data?' + new URLSearchParams({ userId: user.id, module: 'Inventory' }))
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        const rows: Label[] = (json.records || [])
          .map((r: any) => ({
            id: r.id,
            name: pick(r.data, /item.?name|product|^name$|title/i) || pick(r.data, /name/i),
            sku: pick(r.data, /sku|code/i),
            price: pick(r.data, /unit.?price|price|rate|mrp/i),
          }))
          .filter((l: Label) => l.name)
        setLabels(rows)
      } catch (e: any) {
        setError(e.message || 'Could not load your products.')
      }
      setLoading(false)
    })
  }, [])

  if (checking) return <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  if (!canAccessModuleSync(plan as any, 'inventory')) {
    return <Layout><LockedModule moduleName="Inventory" requiredPlan="ERP Basic" /></Layout>
  }

  return (
    <Layout>
      <style>{`@media print { body * { visibility: hidden } #qr-sheet, #qr-sheet * { visibility: visible } #qr-sheet { position: absolute; left: 0; top: 0; width: 100% } .qr-label { break-inside: avoid } }`}</style>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <a href="/inventory" className="text-sm text-gray-500 flex items-center gap-1"><ArrowLeft size={14} /> Inventory</a>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>QR labels</h2>
            <p className="text-gray-500 text-sm">One label per product. Scan with any phone camera to read the name, SKU and price. Print and stick on shelves or packs.</p>
          </div>
          <button onClick={() => window.print()} disabled={!labels.length} className="candy-btn flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
            <Printer size={16} /> Print labels
          </button>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading your products...</p>
        ) : !labels.length ? (
          <p className="text-gray-500 text-sm">No products yet. Add products in Inventory (or tell the chat) and they appear here.</p>
        ) : (
          <div id="qr-sheet" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {labels.map(l => {
              let svg = ''
              try { svg = qrSvg(productQrText(l.name, l.sku, l.price), 140) } catch { svg = '' }
              return (
                <div key={l.id} className="qr-label bg-white border border-gray-300 rounded-xl p-3 text-center text-black">
                  <div className="mx-auto" style={{ width: 140 }} dangerouslySetInnerHTML={{ __html: svg }} />
                  <div className="text-sm font-bold mt-1 break-words">{l.name}</div>
                  <div className="text-xs text-gray-600">{[l.sku && 'SKU ' + l.sku, l.price].filter(Boolean).join(' · ')}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
