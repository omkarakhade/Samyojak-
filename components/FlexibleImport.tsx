'use client'
import { useState, useRef } from 'react'
import { Upload, X, Check, FileText, ArrowRight, AlertCircle } from 'lucide-react'

interface Props {
  userId: string
  module: string
  onSuccess: () => void
  onClose: () => void
}

export default function FlexibleImport({ userId, module, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[] }>({ headers: [], rows: [] })
  const [source, setSource] = useState('csv_import')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const moduleColors: Record<string, { color: string; bg: string }> = {
    CRM: { color: '#8B5CF6', bg: '#EDE9FE' },
    Invoices: { color: '#F472B6', bg: '#FCE7F3' },
    Inventory: { color: '#FBBF24', bg: '#FEF3C7' },
    HR: { color: '#34D399', bg: '#D1FAE5' },
    Projects: { color: '#8B5CF6', bg: '#EDE9FE' },
  }
  const { color, bg } = moduleColors[module] || { color: '#8B5CF6', bg: '#EDE9FE' }

  const SOFTWARE_SOURCES = [
    { value: 'csv_import', label: 'Generic CSV / Excel' },
    { value: 'zoho', label: 'Zoho CRM / Books' },
    { value: 'odoo', label: 'Odoo ERP' },
    { value: 'tally', label: 'Tally' },
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'hubspot', label: 'HubSpot' },
    { value: 'quickbooks', label: 'QuickBooks' },
    { value: 'excel', label: 'Microsoft Excel' },
    { value: 'google_sheets', label: 'Google Sheets' },
    { value: 'other', label: 'Other software' },
  ]

  const readPreview = (f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.trim().split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        setError('File appears empty or has no data rows')
        return
      }

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
      const rows = lines.slice(1, 6).map(line => {
        const vals = parseRow(line)
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = vals[i] || '' })
        return row
      })

      setPreview({ headers, rows })
      setStep('preview')
    }
    reader.readAsText(f)
  }

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) {
      setError('Please upload a CSV file. Excel files: save as CSV first.')
      return
    }
    setError('')
    setFile(f)
    readPreview(f)
  }

  const handleImport = async () => {
    if (!file) return
    setStep('importing')
    setProgress(10)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('module', module)
    formData.append('source', source)

    setProgress(30)

    try {
      const res = await fetch('/api/flexible-import', {
        method: 'POST',
        body: formData,
      })

      setProgress(80)
      const data = await res.json()
      setProgress(100)

      if (data.error) {
        setError(data.error)
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #E2E8F0' }}>

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
              <p className="text-xs text-gray-400">Any format accepted — Zoho, Odoo, Excel, anything</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">

          {/* STEP 1 — UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Source selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Where is this data coming from?
                </label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ fontFamily: 'Plus Jakarta Sans' }}
                >
                  {SOFTWARE_SOURCES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Compatible formats */}
              <div className="flex gap-2 flex-wrap">
                {['Zoho export', 'Odoo export', 'Excel CSV', 'Google Sheets', 'Tally', 'Custom format'].map(f => (
                  <span key={f} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: bg, color, border: `1px solid ${color}` }}>
                    ✓ {f}
                  </span>
                ))}
              </div>

              {/* Drop zone */}
              <div
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:border-violet-400 transition-colors"
                style={{ borderColor: '#CBD5E1', background: '#F8FAFC' }}
              >
                <Upload size={40} className="mx-auto mb-4 text-gray-300" />
                <p className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  Drop your file here
                </p>
                <p className="text-sm text-gray-400 mb-1">or click to browse</p>
                <p className="text-xs text-gray-400">
                  CSV files accepted · Excel: save as CSV first
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mt-4"
                  style={{ background: color, color: 'white' }}>
                  <FileText size={16} /> Choose CSV File
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />

              {error && (
                <div className="p-3 rounded-xl flex items-center gap-2"
                  style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
                <p className="text-xs font-bold text-green-800 mb-2">✨ How this works:</p>
                <div className="space-y-1">
                  {[
                    'Your file is imported exactly as-is — no column renaming needed',
                    'All your original column names are preserved',
                    'AI will learn your data structure automatically',
                    'Works with any ERP or CRM export format',
                  ].map(tip => (
                    <p key={tip} className="text-xs text-green-700">• {tip}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1E293B' }}>
                    📄 {file?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {preview.headers.length} columns detected · Showing first 5 rows
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: bg, color }}>
                  {preview.headers.length} columns
                </div>
              </div>

              {/* Column preview */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">
                  Your columns — imported exactly as-is:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {preview.headers.map(h => (
                    <span key={h} className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: bg, color, border: `1.5px solid ${color}` }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data preview table */}
              <div className="rounded-xl overflow-x-auto"
                style={{ border: '1.5px solid #E2E8F0' }}>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.slice(0, 6).map(h => (
                        <th key={h} className="p-2 text-left font-semibold text-gray-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                      {preview.headers.length > 6 && (
                        <th className="p-2 text-left font-semibold text-gray-400">
                          +{preview.headers.length - 6} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.rows.slice(0, 4).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {preview.headers.slice(0, 6).map(h => (
                          <td key={h} className="p-2 text-gray-600 max-w-24 truncate" title={row[h]}>
                            {row[h] || '—'}
                          </td>
                        ))}
                        {preview.headers.length > 6 && (
                          <td className="p-2 text-gray-400">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl" style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
                <p className="text-xs text-green-700">
                  ✅ Your data looks correct. All {preview.headers.length} columns will be preserved exactly as they are.
                  No renaming, no restructuring needed.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep('upload'); setError('') }}
                  className="flex-1 border border-gray-300 py-3 rounded-xl text-sm">
                  ← Choose Different File
                </button>
                <button
                  onClick={handleImport}
                  className="candy-btn flex-1 py-3 flex items-center justify-center gap-2 text-sm"
                >
                  <Upload size={18} />
                  Import All Data
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — IMPORTING */}
          {step === 'importing' && (
            <div className="py-10 text-center">
              <div className="text-5xl mb-6 float">⚡</div>
              <h3 className="font-black text-xl mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Importing your data...
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Please wait. Preserving all your columns exactly as-is.
              </p>
              <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: color }}
                />
              </div>
              <p className="text-sm font-bold" style={{ color }}>{progress}%</p>
            </div>
          )}

          {/* STEP 4 — DONE */}
          {step === 'done' && result && (
            <div className="py-8 text-center">
              <div className="text-6xl mb-4 float">🎉</div>
              <h3 className="font-black text-2xl mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Import Complete!
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: '#D1FAE5', border: '2px solid #34D399' }}>
                  <p className="text-3xl font-black text-green-800" style={{ fontFamily: 'Outfit' }}>
                    {result.imported}
                  </p>
                  <p className="text-sm font-bold text-green-700">Records imported</p>
                </div>
                <div className="p-4 rounded-2xl"
                  style={{ background: result.failed > 0 ? '#FEE2E2' : '#F0FDF4', border: `2px solid ${result.failed > 0 ? '#FCA5A5' : '#BBF7D0'}` }}>
                  <p className="text-3xl font-black" style={{ fontFamily: 'Outfit', color: result.failed > 0 ? '#DC2626' : '#065F46' }}>
                    {result.failed}
                  </p>
                  <p className="text-sm font-bold" style={{ color: result.failed > 0 ? '#DC2626' : '#065F46' }}>
                    {result.failed > 0 ? 'Failed' : 'Zero errors'}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-3">
                All {result.imported} records imported with your original column names preserved.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Source: {SOFTWARE_SOURCES.find(s => s.value === source)?.label || source}
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} className="outline-btn flex-1 py-3">Close</button>
                <button onClick={() => { onSuccess(); onClose() }}
                  className="candy-btn flex-1 py-3 flex items-center justify-center gap-2">
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

const SOFTWARE_SOURCES = [
  { value: 'csv_import', label: 'Generic CSV / Excel' },
  { value: 'zoho', label: 'Zoho CRM / Books' },
  { value: 'odoo', label: 'Odoo ERP' },
  { value: 'tally', label: 'Tally' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'excel', label: 'Microsoft Excel' },
  { value: 'google_sheets', label: 'Google Sheets' },
  { value: 'other', label: 'Other software' },
]
