'use client'
import { useEffect, useState } from 'react'
import { Download, Trash2, RefreshCw, Upload } from 'lucide-react'
import FlexibleImport from './FlexibleImport'

interface Props {
  userId: string
  module: string
  title: string
  color: string
  bg: string
  onManualAdd?: () => void
}

export default function FlexibleDataView({ userId, module, title, color, bg, onManualAdd }: Props) {
  const [records, setRecords] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/flexible-data?userId=${userId}&module=${module}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRecords(data.records || [])
      setColumns(data.columns || [])
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { if (userId) fetchData() }, [userId, module])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try {
      await fetch(`/api/flexible-data?id=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const exportCSV = () => {
    if (records.length === 0) return
    const allCols = columns
    const rows = [
      allCols,
      ...records.map(r => allCols.map(c => r.data[c] || ''))
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${module.toLowerCase()}-export.csv`
    a.click()
  }

  // Show only first 6 columns in table for readability
  const visibleColumns = columns.slice(0, 6)
  const hiddenCount = columns.length - visibleColumns.length

  return (
    <div className="space-y-4">
      {showImport && (
        <FlexibleImport
          userId={userId}
          module={module}
          onSuccess={fetchData}
          onClose={() => setShowImport(false)}
        />
      )}

      {error && (
        <div className="p-4 rounded-xl text-red-700 text-sm"
          style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-bold dark:text-white" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            {title}
          </h3>
          <p className="text-gray-400 text-xs">
            {records.length} records · {columns.length} columns
            {columns.length > 0 && ` · ${records[0]?.source || 'various sources'}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: bg, color, border: `2px solid ${color}` }}
          >
            <Upload size={16} /> Import Any CSV
          </button>
          <button
            onClick={exportCSV}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>
            No {title} data yet
          </h3>
          <p className="text-gray-500 text-sm mb-2">
            Import your existing data from any software
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Zoho, Odoo, Tally, Excel, Google Sheets — any format works
          </p>
          <button
            onClick={() => setShowImport(true)}
            className="candy-btn px-6 py-3 inline-flex items-center gap-2"
          >
            <Upload size={18} /> Import Your Data
          </button>
        </div>
      ) : (
        <div>
          {hiddenCount > 0 && (
            <p className="text-xs text-gray-400 mb-2">
              Showing {visibleColumns.length} of {columns.length} columns.
              <button onClick={exportCSV} className="ml-1 underline" style={{ color }}>
                Export to see all columns.
              </button>
            </p>
          )}
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {visibleColumns.map(col => (
                    <th key={col} className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap max-w-32 truncate">
                      {col}
                    </th>
                  ))}
                  {hiddenCount > 0 && (
                    <th className="p-3 text-left text-xs font-semibold text-gray-400">
                      +{hiddenCount} cols
                    </th>
                  )}
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    {visibleColumns.map(col => (
                      <td key={col} className="p-3 text-sm dark:text-gray-300 max-w-32 truncate" title={record.data[col] || ''}>
                        {record.data[col] || <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                    {hiddenCount > 0 && (
                      <td className="p-3 text-xs text-gray-400">...</td>
                    )}
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
