'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { airtable } from '@/lib/airtable'
import { Search, X, Users, FileText, Package } from 'lucide-react'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [l, i, p] = await Promise.all([
          airtable.get('Leads'),
          airtable.get('Invoices'),
          airtable.get('Products'),
        ])
        const q = query.toLowerCase()
        const all = [
          ...(l.records || [])
            .filter((r: any) =>
              r.fields?.Name?.toLowerCase().includes(q) ||
              r.fields?.Company?.toLowerCase().includes(q)
            )
            .map((r: any) => ({ ...r, type: 'Lead', icon: Users, path: '/crm' })),
          ...(i.records || [])
            .filter((r: any) =>
              r.fields?.['Client Name']?.toLowerCase().includes(q) ||
              r.fields?.['Invoice No']?.toLowerCase().includes(q)
            )
            .map((r: any) => ({ ...r, type: 'Invoice', icon: FileText, path: '/invoices' })),
          ...(p.records || [])
            .filter((r: any) =>
              r.fields?.['Item Name']?.toLowerCase().includes(q)
            )
            .map((r: any) => ({ ...r, type: 'Product', icon: Package, path: '/inventory' })),
        ].slice(0, 8)
        setResults(all)
      } catch (e) {}
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40 px-4 py-2 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
    >
      <Search size={14} />
      <span>Search...</span>
      <kbd className="ml-2 text-xs bg-gray-200 dark:bg-white/20 px-2 py-0.5 rounded font-mono">⌘K</kbd>
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-[#1a2740] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/10">
          <Search size={18} className="text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search leads, invoices, products..."
            className="flex-1 outline-none text-gray-900 dark:text-white bg-transparent"
          />
          <button onClick={() => setOpen(false)}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!loading && query.length < 2 && (
            <p className="text-center py-8 text-gray-400 text-sm">Type at least 2 characters to search</p>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">No results found</p>
          )}
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => { router.push(r.path); setOpen(false); setQuery('') }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <r.icon size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {r.fields?.Name || r.fields?.['Client Name'] || r.fields?.['Item Name'] || r.fields?.['Invoice No']}
                </p>
                <p className="text-xs text-gray-400">{r.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
