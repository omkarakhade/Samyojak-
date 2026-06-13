'use client'
import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, FileText, ArrowRight, RefreshCw } from 'lucide-react'

interface Props {
  module: 'Leads' | 'Invoices' | 'Products' | 'Employees' | 'Projects'
  onClose: () => void
  onSuccess: () => void
}

const MODULE_FIELDS: Record<string, string[]> = {
  Leads: ['Name', 'Company', 'Email', 'Phone', 'Lead Source', 'Status', 'Deal Value', 'Notes', 'Next Follow-up Date', 'skip'],
  Invoices: ['Client Name', 'Client Email', 'Client Phone', 'Amount', 'Tax Rate', 'Tax Amount', 'Total', 'Status', 'Due Date', 'Notes', 'skip'],
  Products: ['Item Name', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Unit Price', 'Supplier', 'skip'],
  Employees: ['Full Name', 'Role', 'Department', 'Email', 'Phone', 'Salary', 'Join Date', 'skip'],
  Projects: ['Project Name', 'Client', 'Status', 'Deadline', 'skip'],
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').trim())

  const rows = lines.slice(1).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  }).filter(row => Object.values(row).some(v => v))

  return { headers, rows }
}

export default function ImportModal({ module, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'done'>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const moduleColors: Record<string, { color: string; bg: string }> = {
    Leads: { color: '#8B5CF6', bg: '#EDE9FE' },
    Invoices: { color: '#F472B6', bg: '#FCE7F3' },
    Products: { color: '#FBBF24', bg: '#FEF3C7' },
    Employees: { color: '#34D399', bg: '#D1FAE5' },
    Projects: { color: '#8B5CF6', bg: '#EDE9FE' },
  }
  const { color, bg } = moduleColors[module] || { color: '#8B5CF6', bg: '#EDE9FE' }

  const handleFile = async (file: File) => {
    setError('')
    setFileName(file.name)

    const text = await file.text()
    const { headers: h, rows: r } = parseCSV(text)

    if (h.length === 0) {
      setError('Could not read file. Make sure it is a valid CSV file.')
      return
    }

    setHeaders(h)
    setRows(r)
    setAnalyzing(true)
    setStep('mapping')

    // Get smart mapping from API
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', module, headers: h }),
      })
      const data = await res.json()
      setMapping(data.mapping || {})
    } catch (e) {
      // Fallback — set all to skip
      const fallback: Record<string, string> = {}
      h.forEach(h => { fallback[h] = 'skip' })
      setMapping(fallback)
    }
    setAnalyzing(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) handleFile(file)
    else setError('Please upload a CSV file')
  }

  const handleImport = async () => {
    setStep('importing')
    setProgress(0)

    const batchSize = 5
    let successTotal = 0
    let failedTotal = 0

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)

      try {
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'import',
            module,
            rows: batch,
            mapping,
          }),
        })
        const data = await res.json()
        successTotal += data.success || 0
        failedTotal += data.failed || 0
      } catch (e) {
        failedTotal += batch.length
      }

      setProgress(Math.round(((i + batchSize) / rows.length) * 100))
      await new Promise(r => setTimeout(r, 200))
    }

    setResult({ success: successTotal, failed: failedTotal })
    setStep('done')
  }

  const mappedCount = Object.values(mapping).filter(v => v !== 'skip').length

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
                Import {module}
              </h3>
              <p className="text-xs text-gray-400">Upload CSV from any CRM or spreadsheet</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">

          {/* STEP 1 — UPLOAD */}
          {step === 'upload' && (
            <div>
              {/* Supported formats */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['Zoho CRM export', 'Excel/Sheets CSV', 'Custom spreadsheet', 'Any CSV format'].map(f => (
                  <span key={f} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: bg, color, border: `1px solid ${color}` }}>
                    ✓ {f}
                  </span>
                ))}
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-violet-400"
                style={{ borderColor: '#CBD5E1', background: '#F8FAFC' }}
              >
                <Upload size={40} className="mx-auto mb-4 text-gray-300" />
                <p className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  Drop your CSV file here
                </p>
                <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                  style={{ background: color, color: 'white' }}>
                  <FileText size={16} /> Choose CSV File
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />

              {error && (
                <div className="mt-4 p-3 rounded-xl flex items-center gap-2"
                  style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  How to export from other tools:
                </p>
                <div className="space-y-1">
                  {[
                    'Zoho CRM → Reports → Export as CSV',
                    'Excel/Google Sheets → File → Download → CSV',
                    'Any spreadsheet → Save as CSV format',
                    'Column names can be in any language or format',
                  ].map(tip => (
                    <p key={tip} className="text-xs text-gray-500">• {tip}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — MAPPING */}
          {step === 'mapping' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1E293B' }}>
                    📄 {fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {rows.length} records found · {headers.length} columns detected
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: bg, color }}>
                  {mappedCount} of {headers.length} mapped
                </div>
              </div>

              {analyzing ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <RefreshCw size={20} className="animate-spin" style={{ color }} />
                  <span className="text-sm font-medium text-gray-500">
                    AI is analyzing your columns...
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500">
                    Map your columns to Samyojak fields
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {headers.map(header => (
                      <div key={header} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: mapping[header] !== 'skip' ? bg : '#F8FAFC', border: `1.5px solid ${mapping[header] !== 'skip' ? color : '#E2E8F0'}` }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>
                            {header}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            Sample: {rows[0]?.[header] || 'empty'}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                        <select
                          value={mapping[header] || 'skip'}
                          onChange={e => setMapping(prev => ({ ...prev, [header]: e.target.value }))}
                          className="text-sm rounded-lg px-3 py-2 outline-none flex-shrink-0"
                          style={{ border: `1.5px solid ${color}`, background: 'white', color: '#1E293B', minWidth: '140px' }}
                        >
                          <option value="skip">⚠️ Skip this column</option>
                          {MODULE_FIELDS[module]?.filter(f => f !== 'skip').map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="p-3 rounded-xl mb-4" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#1E293B' }}>
                      Preview — first record:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(mapping)
                        .filter(([, v]) => v !== 'skip')
                        .slice(0, 4)
                        .map(([col, field]) => (
                          <span key={col} className="text-xs px-2 py-1 rounded-full"
                            style={{ background: bg, color }}>
                            {field}: {rows[0]?.[col] || 'empty'}
                          </span>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={mappedCount === 0}
                    className="candy-btn w-full py-4 flex items-center justify-center gap-3 text-base disabled:opacity-50"
                  >
                    <Upload size={20} />
                    Import {rows.length} Records into {module}
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 3 — IMPORTING */}
          {step === 'importing' && (
            <div className="py-8 text-center">
              <div className="text-5xl mb-6 float">⚡</div>
              <h3 className="font-black text-xl mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Importing your data...
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Please wait. Do not close this window.
              </p>
              <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%`, background: color }}
                />
              </div>
              <p className="text-sm font-bold" style={{ color }}>
                {Math.min(progress, 100)}% complete
              </p>
            </div>
          )}

          {/* STEP 4 — DONE */}
          {step === 'done' && result && (
            <div className="py-8 text-center">
              <div className="text-6xl mb-6 float">
                {result.failed === 0 ? '🎉' : '✅'}
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Import Complete!
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl"
                  style={{ background: '#D1FAE5', border: '2px solid #34D399' }}>
                  <p className="text-3xl font-black" style={{ fontFamily: 'Outfit', color: '#065F46' }}>
                    {result.success}
                  </p>
                  <p className="text-sm font-bold text-green-700">Records imported</p>
                </div>
                <div className="p-4 rounded-2xl"
                  style={{ background: result.failed > 0 ? '#FEE2E2' : '#F0FDF4', border: `2px solid ${result.failed > 0 ? '#FCA5A5' : '#BBF7D0'}` }}>
                  <p className="text-3xl font-black"
                    style={{ fontFamily: 'Outfit', color: result.failed > 0 ? '#DC2626' : '#065F46' }}>
                    {result.failed}
                  </p>
                  <p className="text-sm font-bold" style={{ color: result.failed > 0 ? '#DC2626' : '#065F46' }}>
                    {result.failed > 0 ? 'Failed' : 'Zero errors'}
                  </p>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Your {module.toLowerCase()} data is now in Samyojak.
                Refresh the page to see all imported records.
              </p>

              <div className="flex gap-3">
                <button onClick={onClose} className="outline-btn flex-1 py-3">
                  Close
                </button>
                <button
                  onClick={() => { onSuccess(); onClose() }}
                  className="candy-btn flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Check size={20} /> View {module}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
