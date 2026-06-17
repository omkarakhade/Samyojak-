'use client'
import { useState } from 'react'
import Link from 'next/link'

interface TestResult {
  ok: boolean
  status?: number | string
  error?: string
  [key: string]: any
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <span>{ok ? '✅' : '❌'}</span>
      <span>{label}</span>
    </div>
  )
}

function Section({ title, children, color = '#8B5CF6' }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200">
      <div className="px-4 py-3 font-bold text-white text-sm" style={{ background: color }}>
        {title}
      </div>
      <div className="p-4 bg-white space-y-2">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium ${ok === true ? 'text-green-600' : ok === false ? 'text-red-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

export default function DebugPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug-full')
      const data = await res.json()
      setResults(data)
      setLastRun(new Date().toLocaleTimeString())
    } catch (e: any) {
      setResults({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#0F172A' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>
              🔧 Samyojak System Debug
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Full system health check · All APIs · All features
              {lastRun && <span className="ml-2 text-green-400">Last run: {lastRun}</span>}
            </p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/20">
            ← Dashboard
          </Link>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-lg mb-8 disabled:opacity-50 hover:opacity-90 transition-opacity"
          style={{ background: '#8B5CF6', border: '3px solid #7C3AED' }}
        >
          {loading ? '⏳ Running all tests...' : '▶ Run Full System Test'}
        </button>

        {/* Manual Checklist */}
        {!results && (
          <div className="space-y-4">
            <Section title="📋 Manual Test Checklist" color="#1E293B">
              {[
                { label: 'Sign up with email + password', check: 'Test at /signup' },
                { label: 'Login with email + password', check: 'Test at /login' },
                { label: 'Google OAuth login', check: 'Click Google button on /login' },
                { label: 'Admin auto-redirect', check: 'Login with omkarakhade083@gmail.com' },
                { label: 'Dashboard loads with stats', check: 'Check /dashboard shows numbers' },
                { label: 'CRM — Add lead manually', check: 'Click Add Lead, fill form, save' },
                { label: 'CRM — Import CSV', check: 'Click Import, upload a CSV file' },
                { label: 'CRM — Export CSV', check: 'Click Export, file downloads' },
                { label: 'Invoices — Create invoice', check: 'Fill form with client name and amount' },
                { label: 'Invoices — Tax selection', check: 'Try GST India, VAT UK, Sales Tax US' },
                { label: 'Invoices — WhatsApp send', check: 'Click WhatsApp button on invoice' },
                { label: 'Inventory — Add product', check: 'Add product manually, check QR code appears' },
                { label: 'Inventory — QR code generates', check: 'Product row shows QR image' },
                { label: 'HR — Add employee', check: 'Fill form, save, card appears' },
                { label: 'Projects — Add project', check: 'Fill form, appears in Kanban' },
                { label: 'Projects — Move project', check: 'Click → In Progress button on a project' },
                { label: 'GST Reports — Load', check: 'Go to /reports, check tables show' },
                { label: 'Support ticket submit', check: 'Go to /support, fill form, submit' },
                { label: 'Referral page loads', check: 'Go to /referral, check commission info' },
                { label: 'AI assistant appears', check: 'Login with Complete plan — check purple brain bubble' },
                { label: 'AI responds correctly', check: 'Click AI bubble, ask "how are my leads?"' },
                { label: 'AI locked for basic plans', check: 'Login with CRM Starter — AI should show upgrade prompt' },
                { label: 'Onboarding tour starts', check: 'Fresh login — tour should appear' },
                { label: 'Dark mode toggle', check: 'Click moon icon in header' },
                { label: 'Global search Cmd+K', check: 'Press Cmd+K or Ctrl+K' },
                { label: 'Payment — CRM Starter', check: 'Go to /choose-plan, click CRM Starter' },
                { label: 'Payment — Dodo checkout', check: 'Checkout page appears with Pay button' },
                { label: 'Payment — Test card works', check: '4242 4242 4242 4242 exp 12/28 CVV 123' },
                { label: 'Payment success redirect', check: 'After payment goes to /payment-success' },
                { label: 'Plan locking — CRM Starter', check: 'Only /crm accessible, others show Upgrade' },
                { label: 'Plan locking — ERP Basic', check: 'CRM + Invoices + Inventory accessible' },
                { label: 'Plan locking — Business', check: 'Above + HR + Projects accessible' },
                { label: 'Plan locking — Complete', check: 'Everything unlocked including AI' },
                { label: 'Demo page', check: 'Go to /demo — shows data, AI works' },
                { label: 'Admin panel', check: 'Login as admin — full access' },
                { label: 'Geo pricing — India', check: 'India timezone — see ₹ prices' },
                { label: 'Geo pricing — US/UK', check: 'Western timezone — see $ prices' },
                { label: 'Session timeout', check: 'Leave open 30 min — should auto logout' },
                { label: 'Mobile responsive', check: 'Check on phone — bottom nav appears' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-lg">⬜</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.check}</p>
                  </div>
                </div>
              ))}
            </Section>

            <div className="p-4 rounded-xl" style={{ background: '#1E3A5F', border: '1.5px solid #2563EB' }}>
              <p className="text-blue-300 text-sm font-bold mb-1">💡 How to use this page</p>
              <p className="text-blue-200 text-xs">Click "Run Full System Test" above to automatically check all APIs and database connections. Use the manual checklist above for UI testing. Share this page with testers by sending them to samyojak.vercel.app/debug (password protect it before sharing).</p>
            </div>
          </div>
        )}

        {results && !results.error && (
          <div className="space-y-6">

            {/* Summary */}
            <Section title="📊 Test Summary" color="#059669">
              {Object.entries(results.summary || {}).map(([key, val]: any) => (
                <Row key={key} label={key.replace(/_/g, ' ').toUpperCase()} value={val} ok={val.includes('✅')} />
              ))}
              <Row label="Test Run At" value={results.timestamp} />
            </Section>

            {/* Environment */}
            <Section title="🔐 Environment Variables" color="#7C3AED">
              <Row label="DODO_ENV" value={results.environment.DODO_ENV} ok={!!results.environment.DODO_ENV && results.environment.DODO_ENV !== 'NOT SET'} />
              <Row label="APP_URL" value={results.environment.APP_URL} ok={results.environment.APP_URL !== 'NOT SET'} />
              <Row label="Airtable Token" value={`${results.environment.AIRTABLE_TOKEN_PREFIX}... (${results.environment.AIRTABLE_TOKEN_LENGTH} chars)`} ok={results.environment.AIRTABLE_TOKEN_EXISTS} />
              <Row label="Airtable Base ID" value={results.environment.AIRTABLE_BASE_ID} ok={results.environment.AIRTABLE_BASE_ID.startsWith('app')} />
              <Row label="Groq API Key" value={results.environment.GROQ_KEY_EXISTS ? `${results.environment.GROQ_KEY_PREFIX}...` : 'NOT SET'} ok={results.environment.GROQ_KEY_EXISTS} />
              <Row label="Dodo Payments Key" value={results.environment.DODO_KEY_EXISTS ? `${results.environment.DODO_KEY_PREFIX}...` : 'NOT SET'} ok={results.environment.DODO_KEY_EXISTS} />
              <Row label="Supabase URL" value={results.environment.SUPABASE_URL_EXISTS ? '✓ Set' : 'NOT SET'} ok={results.environment.SUPABASE_URL_EXISTS} />
            </Section>

            {/* Services */}
            <Section title="🌐 External Services" color="#0891B2">
              <Row label="Groq AI (llama3-8b-8192)" value={results.services.groq?.ok ? `✅ Working — replied: ${results.services.groq?.reply}` : `❌ ${results.services.groq?.error}`} ok={results.services.groq?.ok} />
              <Row label="Dodo Payments SDK" value={results.services.dodo?.ok ? `✅ Initialized (${results.services.dodo?.environment})` : `❌ ${results.services.dodo?.error}`} ok={results.services.dodo?.ok} />
              <Row label="Supabase" value={results.services.supabase?.ok ? `✅ Reachable (${results.services.supabase?.status})` : `❌ ${results.services.supabase?.error}`} ok={results.services.supabase?.ok} />
            </Section>

            {/* Airtable Reads */}
            <Section title="📖 Airtable — Read Tests" color="#D97706">
              {Object.entries(results.airtable.reads || {}).map(([table, r]: any) => (
                <div key={table} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-800">{table}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.ok ? `✅ HTTP ${r.status}` : `❌ HTTP ${r.status}`}
                    </span>
                  </div>
                  {r.ok ? (
                    <p className="text-xs text-gray-500">Fields: {r.fields.join(', ') || 'none'}</p>
                  ) : (
                    <p className="text-xs text-red-500">Error: {JSON.stringify(r.error)}</p>
                  )}
                </div>
              ))}
            </Section>

            {/* Airtable Writes */}
            <Section title="✍️ Airtable — Write Tests" color="#DC2626">
              {Object.entries(results.airtable.writes || {}).map(([table, r]: any) => (
                <div key={table} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-800">{table}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.ok ? '✅ WRITE OK — test record deleted' : `❌ WRITE FAILED`}
                    </span>
                  </div>
                  {!r.ok && (
                    <p className="text-xs text-red-500">Error: {JSON.stringify(r.error)}</p>
                  )}
                </div>
              ))}
            </Section>

            {/* Plan Feature Matrix */}
            <Section title="📋 Plan Feature Matrix" color="#4F46E5">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Feature</th>
                      <th className="p-2 text-center">CRM Starter</th>
                      <th className="p-2 text-center">ERP Basic</th>
                      <th className="p-2 text-center">Business</th>
                      <th className="p-2 text-center">Complete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'CRM / Leads', plans: [true, true, true, true] },
                      { feature: 'Invoices + Universal Tax', plans: [false, true, true, true] },
                      { feature: 'Inventory + QR Codes', plans: [false, true, true, true] },
                      { feature: 'HR + Payroll', plans: [false, false, true, true] },
                      { feature: 'Projects + Kanban', plans: [false, false, true, true] },
                      { feature: 'GST Reports', plans: [false, false, true, true] },
                      { feature: 'AI Assistant', plans: [false, false, false, true] },
                      { feature: 'Import CSV', plans: [true, true, true, true] },
                      { feature: 'Export CSV', plans: [true, true, true, true] },
                      { feature: 'WhatsApp Invoice', plans: [false, true, true, true] },
                      { feature: 'Support Tickets', plans: [true, true, true, true] },
                      { feature: 'Referral Program', plans: [true, true, true, true] },
                    ].map(row => (
                      <tr key={row.feature} className="border-t border-gray-100">
                        <td className="p-2 font-medium text-gray-700">{row.feature}</td>
                        {row.plans.map((has, i) => (
                          <td key={i} className="p-2 text-center">{has ? '✅' : '🔒'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <button onClick={runTests} disabled={loading}
              className="w-full py-3 rounded-2xl text-white font-bold disabled:opacity-50"
              style={{ background: '#1E293B' }}>
              🔄 Run Tests Again
            </button>
          </div>
        )}

        {results?.error && (
          <div className="p-6 rounded-2xl bg-red-900/20 border border-red-500">
            <p className="text-red-400 font-bold">Test Failed: {results.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
