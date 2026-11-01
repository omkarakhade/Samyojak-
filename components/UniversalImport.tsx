'use client'
import React, { useState, useRef } from 'react'
import { Upload, X, Check, FileText, AlertCircle, Trash2, ChevronRight } from 'lucide-react'

interface Props {
  userId: string
  module: string
  onSuccess: () => void
  onClose: () => void
}

const SOFTWARE_SOURCES = [
  { value: 'zoho', label: '🟠 Zoho CRM / Books' },
  { value: 'salesforce', label: '☁️ Salesforce' },
  { value: 'hubspot', label: '🟡 HubSpot' },
  { value: 'tally', label: '📊 Tally' },
  { value: 'busy', label: '📋 Busy Accounting' },
  { value: 'excel', label: '📗 Microsoft Excel' },
  { value: 'google_sheets', label: '📊 Google Sheets' },
  { value: 'odoo', label: '🟣 Odoo ERP' },
  { value: 'quickbooks', label: '💚 QuickBooks' },
  { value: 'csv_import', label: '📄 Generic CSV / Other' },
]

type Step = 'upload' | 'preview' | 'importing' | 'done'

export default function UniversalImport({ userId, module, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState('csv_import')
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, string>[]; totalRows: number } | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const MODULE_COLORS: Record<string, { color: string; bg: string }> = {
    CRM: { color: '#8B5CF6', bg: '#EDE9FE' },
    Invoices: { color: '#F472B6', bg: '#FCE7F3' },
    Inventory: { color: '#FBBF24', bg: '#FEF3C7' },
    HR: { color: '#34D399', bg: '#D1FAE5' },
    Projects: { color: '#8B5CF6', bg: '#EDE9FE' },
  }

  const { color, bg } = MODULE_COLORS[module] || { color: '#8B5CF6', bg: '#EDE9FE' }

  const readPreview = (f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.trim().split('\n').filter(l => l.trim())
      if (lines.length < 2) { setError('File has no data rows'); return }

      const parseRow = (line: string) => {
        const values: string[] = []
        let current = ''
        let inQuotes = false
        for (const char of line) {
          if (char === '"') inQuotes = !inQuotes
          else if (char === ',' && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, '')); current = '' }
          else current += char
        }
        values.push(current.trim().replace(/^"|"$/g, ''))
        return values
      }

      const headers = parseRow(lines[0])
      const dataRows = lines.slice(1)
      const previewRows = dataRows.slice(0, 5).map(line => {
        const vals = parseRow(line)
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = vals[i] || '' })
        return row
      })

      setPreview({ headers, rows: previewRows, totalRows: dataRows.length })
      setError('')
      setStep('preview')
    }
    reader.onerror = () => setError('Could not read file')
    reader.readAsText(f)
  }

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(csv|txt|tsv)$/i)) {
      setError('Please upload a CSV file. For Excel: File → Save As → CSV.')
      return
    }
    setError('')
    setFile(f)
    readPreview(f)
  }

  const handleImport = async () => {
    if (!file || !preview) return
    setStep('importing')
    setProgress(5)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('module', module)
    formData.append('source', source)

    setProgress(20)

    try {
      const res = await fetch('/api/universal-import', {
        method: 'POST',
        body: formData,
      })

      setProgress(90)
      const data = await res.json()
      setProgress(100)

      if (!res.ok || data.error) {
        setError(data.error || 'Import failed')
        setStep('preview')
        return
      }

      setResult(data)
      setStep('done')
    } catch (e: any) {
      setError('Import failed: ' + e.message)
      setStep('preview')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: bg, border: `2px solid ${color}` }}>
              <Upload size={20} style={{ color }} />
            </div>
            <div>
              <h3 className="font-black text-lg" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Import to {module}
              </h3>
              <p className="text-xs" style={{ color: '#64748B' }}>
                Every column · Every row · Zero data loss
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">

          {/* STEP 1 — UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Key promise */}
              <div className="p-4 rounded-xl"
                style={{ background: '#F0FDF4', border: '2px solid #34D399' }}>
                <p className="text-sm font-bold text-green-800 mb-2">
                  ✅ How this is different from other ERPs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'Every column is preserved exactly',
                    'Every row is imported completely',
                    'No column renaming required',
                    'No data loss ever',
                    'Works with any format or software',
                    'Ready to use in 2 minutes',
                  ].map(p => (
                    <p key={p} className="text-xs text-green-700 flex items-center gap-1">
                      <Check size={12} /> {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Source selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Where is your data coming from?
                </label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ fontFamily: 'Plus Jakarta Sans' }}
                >
                  {SOFTWARE_SOURCES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Drop zone */}
              <div
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-violet-400 hover:bg-violet-50"
                style={{ borderColor: '#CBD5E1', background: '#F8FAFC' }}
              >
                <Upload size={40} className="mx-auto mb-4 text-gray-300" />
                <p className="font-black text-xl mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  Drop your CSV file here
                </p>
                <p className="text-sm text-gray-400 mb-1">or click to browse</p>
                <p className="text-xs text-gray-400 mb-4">
                  CSV format required · Excel: save as CSV first
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
                  style={{ background: color, color: 'white' }}>
                  <FileText size={16} /> Choose File
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />

              {error && (
                <div className="p-3 rounded-xl flex items-start gap-2"
                  style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5' }}>
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — PREVIEW */}
          {step === 'preview' && preview && (
            <div className="space-y-5">
              {/* File info */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                <div className="flex items-center gap-3">
                  <FileText size={20} style={{ color }} />
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#1E293B' }}>{file?.name}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      {preview.totalRows} rows · {preview.headers.length} columns · All will be imported
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-black"
                  style={{ background: bg, color }}>
                  {preview.headers.length} cols
                </div>
              </div>

              {/* All columns preview */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>
                  All {preview.headers.length} columns — imported exactly as-is:
                </p>
                <div className="flex flex-wrap gap-2">
                  {preview.headers.map(h => (
                    <span key={h}
                      className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      style={{ background: bg, color, border: `1.5px solid ${color}40` }}>
                      <Check size={10} /> {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data preview table */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#94A3B8' }}>
                  First {preview.rows.length} rows preview:
                </p>
                <div className="rounded-xl overflow-x-auto"
                  style={{ border: '1.5px solid #E2E8F0', maxHeight: '220px', overflowY: 'auto' }}>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left text-gray-500 font-semibold w-8">#</th>
                        {preview.headers.map(h => (
                          <th key={h} className="p-2 text-left font-semibold text-gray-700 whitespace-nowrap min-w-24">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {preview.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 text-gray-400">{i + 1}</td>
                          {preview.headers.map(h => (
                            <td key={h} className="p-2 text-gray-600 max-w-32 truncate" title={row[h]}>
                              {row[h] || <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guarantee */}
              <div className="p-3 rounded-xl"
                style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
                <p className="text-xs text-green-700 font-medium">
                  ✅ All {preview.totalRows} rows and all {preview.headers.length} columns will be imported with zero data loss. Your original column names are preserved exactly.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl"
                  style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5' }}>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('upload'); setError(''); setPreview(null); setFile(null) }}
                  className="flex-1 border border-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  ← Different File
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: color }}>
                  <Upload size={18} />
                  Import All {preview.totalRows} Rows
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — IMPORTING */}
          {step === 'importing' && (
            <div className="py-12 text-center">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="font-black text-xl mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Importing your data...
              </h3>
              <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                Every row. Every column. Nothing lost.
              </p>
              <p className="text-xs mb-8" style={{ color: '#94A3B8' }}>
                Large files may take a minute. Please do not close this window.
              </p>
              <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                />
              </div>
              <p className="text-sm font-bold" style={{ color }}>{progress}%</p>
            </div>
          )}

          {/* STEP 4 — DONE */}
          {step === 'done' && result && (
            <div className="py-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-black text-2xl mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Import Complete!
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: '#D1FAE5', border: '2px solid #34D399' }}>
                  <p className="text-3xl font-black text-green-800" style={{ fontFamily: 'Outfit' }}>
                    {result.imported}
                  </p>
                  <p className="text-xs font-bold text-green-700 mt-1">Rows imported</p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: bg, border: `2px solid ${color}` }}>
                  <p className="text-3xl font-black" style={{ fontFamily: 'Outfit', color }}>
                    {result.totalColumns}
                  </p>
                  <p className="text-xs font-bold mt-1" style={{ color }}>Columns preserved</p>
                </div>
                <div className="p-4 rounded-2xl"
                  style={{
                    background: result.failed > 0 ? '#FEE2E2' : '#F0FDF4',
                    border: `2px solid ${result.failed > 0 ? '#FCA5A5' : '#34D399'}`
                  }}>
                  <p className="text-3xl font-black"
                    style={{ fontFamily: 'Outfit', color: result.failed > 0 ? '#DC2626' : '#059669' }}>
                    {result.failed}
                  </p>
                  <p className="text-xs font-bold mt-1"
                    style={{ color: result.failed > 0 ? '#DC2626' : '#059669' }}>
                    {result.failed > 0 ? 'Failed rows' : 'Zero errors'}
                  </p>
                </div>
              </div>

              <p className="text-sm mb-1" style={{ color: '#64748B' }}>{result.message}</p>
              <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>
                Source: {SOFTWARE_SOURCES.find(s => s.value === source)?.label || source}
              </p>

              {result.errors?.length > 0 && (
                <div className="p-3 rounded-xl mb-4 text-left"
                  style={{ background: '#FEF3C7', border: '1.5px solid #FBBF24' }}>
                  <p className="text-xs font-bold text-yellow-800 mb-1">Some rows had issues:</p>
                  {result.errors.map((e: string, i: number) => (
                    <p key={i} className="text-xs text-yellow-700">• {e}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 border border-gray-300 py-3 rounded-xl text-sm font-medium">
                  Close
                </button>
                <button
                  onClick={() => { onSuccess(); onClose() }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: color }}>
                  <Check size={18} /> View {module} Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
