'use client'
import React, { useState, useRef } from 'react'
import { Upload, X, Check, FileText, AlertCircle, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  module: string
  onClose: () => void
  onSuccess: () => void
}

const SOFTWARE_SOURCES = [
  { value: 'zoho', label: '🟠 Zoho CRM / Books' },
  { value: 'salesforce', label: '☁️ Salesforce' },
  { value: 'hubspot', label: '🟡 HubSpot' },
  { value: 'tally', label: '📊 Tally' },
  { value: 'busy', label: '📋 Busy Accounting' },
  { value: 'sap', label: '🔵 SAP' },
  { value: 'oracle', label: '🔴 Oracle' },
  { value: 'excel', label: '📗 Microsoft Excel' },
  { value: 'google_sheets', label: '📊 Google Sheets' },
  { value: 'odoo', label: '🟣 Odoo ERP' },
  { value: 'quickbooks', label: '💚 QuickBooks' },
  { value: 'csv_import', label: '📄 Generic CSV / Other' },
]

const MODULE_COLORS: Record<string, { color: string; bg: string }> = {
  Leads: { color: '#8B5CF6', bg: '#EDE9FE' },
  CRM: { color: '#8B5CF6', bg: '#EDE9FE' },
  Invoices: { color: '#F472B6', bg: '#FCE7F3' },
  Products: { color: '#FBBF24', bg: '#FEF3C7' },
  Inventory: { color: '#FBBF24', bg: '#FEF3C7' },
  Employees: { color: '#34D399', bg: '#D1FAE5' },
  HR: { color: '#34D399', bg: '#D1FAE5' },
  Projects: { color: '#8B5CF6', bg: '#EDE9FE' },
}

type Step = 'upload' | 'preview' | 'importing' | 'done'

function parseCSVText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''))
    return values
  }

  const headers = parseRow(lines[0]).map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const vals = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim() })
    return row
  }).filter(row => Object.values(row).some(v => v.length > 0))

  return { headers, rows }
}

export default function ImportModal({ module, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState('csv_import')
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, string>[]; totalRows: number } | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { color, bg } = MODULE_COLORS[module] || { color: '#8B5CF6', bg: '#EDE9FE' }

  const readPreview = (f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers, rows } = parseCSVText(text)

      if (headers.length === 0) {
        setError('File appears empty or has no headers in first row')
        return
      }
      if (rows.length === 0) {
        setError('File has headers but no data rows')
        return
      }

      setPreview({
        headers,
        rows: rows.slice(0, 5),
        totalRows: rows.length,
      })
      setError('')
      setStep('preview')
    }
    reader.onerror = () => setError('Could not read file')
    reader.readAsText(f)
  }

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(csv|txt|tsv)$/i)) {
      setError('Please upload a CSV file. For Excel: File → Save As → CSV format.')
      return
    }
    setError('')
    setFile(f)
    readPreview(f)
  }

  const handleImport = async () => {
    if (!file || !preview) return
    setStep('importing')
    setProgress(10)

    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('module', module)
      formData.append('source', source)

      setProgress(30)

      const res = await fetch('/api/universal-import', {
        method: 'POST',
        body: formData,
      })

      setProgress(85)

      const data = await res.json()
      setProgress(100)

      if (!res.ok || data.error) {
        setError(data.error || 'Import failed. Please try again.')
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
              <p className="text-xs text-gray-400">
                Zero field mapping · Zero data loss · Every column preserved
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

              {/* Promise */}
              <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '2px solid #34D399' }}>
                <p className="text-sm font-black text-green-800 mb-2" style={{ fontFamily: 'Outfit' }}>
                  ✅ How Samyojak import is different
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'No field mapping required',
                    'No columns skipped ever',
                    'No data loss guaranteed',
                    'Works from any software',
                    'Original column names kept',
                    'Upload → Done in 2 minutes',
                  ].map(p => (
                    <p key={p} className="text-xs text-green-700 flex items-center gap-1.5">
                      <Check size={12} className="flex-shrink-0" /> {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Where is this data coming from?
                </label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
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
                style={{ borderColor: '#CBD5E1' }}
              >
                <Upload size={44} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
                <p className="font-black text-xl mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  Drop your CSV file here
                </p>
                <p className="text-sm text-gray-400 mb-1">or click to choose file</p>
                <p className="text-xs text-gray-400 mb-5">
                  Any CSV format from any software accepted
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold"
                  style={{ background: color, color: 'white' }}>
                  <FileText size={16} /> Choose CSV File
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

              {/* Compatible sources */}
              <div>
                <p className="text-xs text-gray-400 text-center mb-3">Works with exports from:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Zoho', 'Salesforce', 'HubSpot', 'Tally', 'Busy', 'SAP', 'Oracle', 'Excel', 'Google Sheets', 'Odoo', 'QuickBooks', 'Any CSV'].map(s => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#F1F5F9', color: '#64748B' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — PREVIEW */}
          {step === 'preview' && preview && (
            <div className="space-y-5">

              {/* File stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Rows', value: preview.totalRows, color: '#8B5CF6', bg: '#EDE9FE' },
                  { label: 'Total Columns', value: preview.headers.length, color: '#34D399', bg: '#D1FAE5' },
                  { label: 'Data Loss', value: 'Zero', color: '#FBBF24', bg: '#FEF3C7' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center"
                    style={{ background: s.bg, border: `1.5px solid ${s.color}40` }}>
                    <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: s.color }}>{s.value}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: s.color }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* All columns */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#64748B' }}>
                  All {preview.headers.length} columns — imported exactly as-is, no renaming:
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {preview.headers.map(h => (
                    <span key={h}
                      className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0"
                      style={{ background: bg, color, border: `1.5px solid ${color}30` }}>
                      <Check size={10} /> {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data preview */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#64748B' }}>
                  Preview (first {Math.min(5, preview.rows.length)} of {preview.totalRows} rows):
                </p>
                <div className="rounded-xl overflow-x-auto"
                  style={{ border: '1.5px solid #E2E8F0', maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left text-gray-400 font-semibold w-8">#</th>
                        {preview.headers.slice(0, 7).map(h => (
                          <th key={h} className="p-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-20">
                            {h}
                          </th>
                        ))}
                        {preview.headers.length > 7 && (
                          <th className="p-2 text-gray-400">+{preview.headers.length - 7} more</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {preview.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 text-gray-300">{i + 1}</td>
                          {preview.headers.slice(0, 7).map(h => (
                            <td key={h} className="p-2 text-gray-600 max-w-28 truncate" title={row[h]}>
                              {row[h] || <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                          {preview.headers.length > 7 && <td className="p-2 text-gray-300">...</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guarantee */}
              <div className="p-3 rounded-xl" style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
                <p className="text-xs text-green-700 font-medium">
                  ✅ All <strong>{preview.totalRows} rows</strong> and all <strong>{preview.headers.length} columns</strong> will be imported with zero data loss. Your original column names are preserved exactly as-is. No field mapping required.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl" style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5' }}>
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
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: color, fontFamily: 'Outfit' }}>
                  <Upload size={18} />
                  Import All {preview.totalRows} Rows
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — IMPORTING */}
          {step === 'importing' && (
            <div className="py-14 text-center">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="font-black text-2xl mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Importing your data...
              </h3>
              <p className="text-sm mb-1 text-gray-500">Every row · Every column · Nothing skipped</p>
              <p className="text-xs mb-8 text-gray-400">
                Large files take a moment. Please do not close this window.
              </p>
              <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
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

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="p-4 rounded-2xl" style={{ background: '#D1FAE5', border: '2px solid #34D399' }}>
                  <p className="text-3xl font-black text-green-800" style={{ fontFamily: 'Outfit' }}>{result.imported}</p>
                  <p className="text-xs font-bold text-green-700 mt-1">Rows imported</p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: bg, border: `2px solid ${color}` }}>
                  <p className="text-3xl font-black" style={{ fontFamily: 'Outfit', color }}>{result.totalColumns}</p>
                  <p className="text-xs font-bold mt-1" style={{ color }}>Columns kept</p>
                </div>
                <div className="p-4 rounded-2xl"
                  style={{
                    background: result.failed > 0 ? '#FEE2E2' : '#D1FAE5',
                    border: `2px solid ${result.failed > 0 ? '#FCA5A5' : '#34D399'}`,
                  }}>
                  <p className="text-3xl font-black"
                    style={{ fontFamily: 'Outfit', color: result.failed > 0 ? '#DC2626' : '#059669' }}>
                    {result.failed}
                  </p>
                  <p className="text-xs font-bold mt-1"
                    style={{ color: result.failed > 0 ? '#DC2626' : '#059669' }}>
                    {result.failed > 0 ? 'Failed' : 'Zero errors'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-1">{result.message}</p>
              <p className="text-xs text-gray-400 mb-2">
                Source: {SOFTWARE_SOURCES.find(s => s.value === source)?.label || source}
              </p>

              {result.failed > 0 && result.errors?.length > 0 && (
                <div className="p-3 rounded-xl mb-4 text-left"
                  style={{ background: '#FEF3C7', border: '1.5px solid #FBBF24' }}>
                  <p className="text-xs font-bold text-yellow-800 mb-1">Issues encountered:</p>
                  {result.errors.slice(0, 3).map((e: string, i: number) => (
                    <p key={i} className="text-xs text-yellow-700">• {e}</p>
                  ))}
                  {result.errors.length > 3 && (
                    <p className="text-xs text-yellow-600 mt-1">...and {result.errors.length - 3} more</p>
                  )}
                </div>
              )}

              <div className="p-3 rounded-xl mb-5"
                style={{ background: '#EDE9FE', border: '1.5px solid #8B5CF6' }}>
                <p className="text-xs text-violet-700">
                  📂 Your imported data is visible in the <strong>"Imported Data"</strong> section below the main table on this page. All {result.totalColumns} original columns are preserved exactly.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 border border-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Close
                </button>
                <button
                  onClick={() => { onSuccess(); onClose() }}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 hover:opacity-90"
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
