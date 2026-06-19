'use client'
import React, { useEffect, useState } from 'react'
import { Download, Trash2, RefreshCw, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import UniversalImport from './UniversalImport'

interface Props {
  userId: string
  module: string
  color: string
  bg: string
}

const PAGE_SIZE = 50

export default function UniversalDataView({ userId, module, color, bg }: Props) {
  const [records, setRecords] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [importBatches, setImportBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ userId, module })
      if (selectedBatch) params.set('importId', selectedBatch)

      const res = await fetch(`/api/universal-data?${params}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setRecords(data.records || [])
      setColumns(data.columns || [])
      setImportBatches(data.importBatches || [])
      setPage(0)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => { if (userId) fetchData() }, [userId, module, selectedBatch])

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this row?')) return
    try {
      await fetch(`/api/universal-data?id=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const deleteBatch = async (importId: string) => {
    if (!confirm('Delete this entire import batch? This cannot be undone.')) return
    setDeletingBatch(importId)
    try {
      await fetch(`/api/universal-data?importId=${importId}&userId=${userId}&module=${module}`, { method: 'DELETE' })
      setSelectedBatch(null)
      fetchData()
    } catch (e: any) {
      setError(e.message)
    }
    setDeletingBatch(null)
  }

  const exportCSV = () => {
    if (records.length === 0) return
    const rows = [
      columns,
      ...records.map(r => columns.map(c => {
        const val = r.data[c] || ''
        return `"${String(val).replace(/"/g, '""')}"`
      }))
    ]
    const csv = rows.map(r => Array.isArray(r) ? r.join(',') : r).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${module.toLowerCase()}-export.csv`
    a.click()
  }

  // Pagination
  const totalPages = Math.ceil(records.length / PAGE_SIZE)
  const pageRecords = records.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const visibleColumns = columns.slice(0, 8) // Show first 8 in table
  const hiddenCount = columns.length - visibleColumns.length

  return (
    <div className="space-y-4">
      {showImport && (
        <UniversalImport
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
          <button onClick={() => setError('')} className="ml-2 text-red-400">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Imported Data
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {records.length} rows · {columns.length} columns · Zero data loss
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: bg, color, border: `2px solid ${color}` }}>
            <Upload size={16} /> Import CSV
          </button>
          <button
            onClick={exportCSV}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <Download size={16} /> Export All
          </button>
        </div>
      </div>

      {/* Import batches */}
      {importBatches.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBatch(null)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: selectedBatch === null ? '#1E293B' : '#F1F5F9',
              color: selectedBatch === null ? 'white' : '#64748B',
            }}>
            All imports ({records.length})
          </button>
          {importBatches.map(batch => (
            <div key={batch.importId} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedBatch(batch.importId === selectedBatch ? null : batch.importId)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: selectedBatch === batch.importId ? color : bg,
                  color: selectedBatch === batch.importId ? 'white' : color,
                }}>
                {batch.source} ({batch.rowCount} rows)
              </button>
              <button
                onClick={() => deleteBatch(batch.importId)}
                disabled={deletingBatch === batch.importId}
                className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Data */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: color }}></div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>
            No imported data yet
          </h3>
          <p className="text-gray-500 text-sm mb-2">
            Import from any ERP, CRM, or spreadsheet
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Every column and every row will be preserved exactly as-is
          </p>
          <button
            onClick={() => setShowImport(true)}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2"
            style={{ background: color }}>
            <Upload size={18} /> Import Your Data
          </button>
        </div>
      ) : (
        <div>
          {hiddenCount > 0 && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">
                Showing {visibleColumns.length} of {columns.length} columns in table.
              </p>
              <button onClick={exportCSV}
                className="text-xs font-bold underline"
                style={{ color }}>
                Export to see all {columns.length} columns →
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase w-10">#</th>
                  {visibleColumns.map(col => (
                    <th key={col}
                      className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap"
                      style={{ maxWidth: '160px' }}>
                      {col}
                    </th>
                  ))}
                  {hiddenCount > 0 && (
                    <th className="p-3 text-left text-xs font-semibold text-gray-400">
                      +{hiddenCount} more
                    </th>
                  )}
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {pageRecords.map((record, idx) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 text-xs text-gray-400">
                      {page * PAGE_SIZE + idx + 1}
                    </td>
                    {visibleColumns.map(col => (
                      <td key={col}
                        className="p-3 text-sm dark:text-gray-300"
                        style={{ maxWidth: '160px' }}>
                        <span className="block truncate" title={record.data[col] || ''}>
                          {record.data[col] || <span className="text-gray-300 text-xs">—</span>}
                        </span>
                      </td>
                    ))}
                    {hiddenCount > 0 && (
                      <td className="p-3 text-xs text-gray-300">...</td>
                    )}
                    <td className="p-3">
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, records.length)} of {records.length} rows
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-2 text-xs font-bold text-gray-600">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
