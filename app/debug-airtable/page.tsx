'use client'
import { useState } from 'react'

export default function DebugAirtable() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug-airtable')
      const data = await res.json()
      setResults(data)
    } catch (e: any) {
      setResults({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#0F172A' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Airtable Debug Panel</h1>
        <button
          onClick={runDebug}
          disabled={loading}
          className="w-full p-4 rounded-xl text-white font-bold mb-6"
          style={{ background: '#8B5CF6' }}
        >
          {loading ? 'Testing...' : 'Run Airtable Diagnostic'}
        </button>
        {results && (
          <div className="p-4 rounded-xl" style={{ background: '#1E293B' }}>
            <pre className="text-green-400 text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
