'use client'
import { useState } from 'react'

export default function DebugPayment() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCheckout = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'pdt_0NgWF7Sj0uJ5wU4v3Z6p7',
          email: 'test@samyojak.app',
          name: 'Test User',
          planName: 'CRM Starter',
        }),
      })

      const data = await res.json()
      setResult({ status: res.status, data })
    } catch (e: any) {
      setResult({ error: e.message })
    }

    setLoading(false)
  }

  const testEnvVars = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug-env')
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#0F172A' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Payment Debug Panel</h1>

        <div className="space-y-4 mb-6">
          <button
            onClick={testEnvVars}
            disabled={loading}
            className="w-full p-4 rounded-xl text-white font-bold"
            style={{ background: '#8B5CF6' }}
          >
            1. Check Environment Variables
          </button>

          <button
            onClick={testCheckout}
            disabled={loading}
            className="w-full p-4 rounded-xl text-white font-bold"
            style={{ background: '#34D399' }}
          >
            2. Test Checkout API
          </button>
        </div>

        {loading && (
          <div className="text-yellow-400 text-center p-4">Loading...</div>
        )}

        {result && (
          <div className="p-4 rounded-xl" style={{ background: '#1E293B' }}>
            <pre className="text-green-400 text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
