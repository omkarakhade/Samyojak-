'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Brain, Users, FileText, Package, UserCheck, FolderOpen, BarChart3, FileCheck, UserPlus, Send, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// All valid demo tokens — add new ones here without touching any other file
const VALID_TOKENS = [
  'samyojak2025',
  'demo-investor',
  'demo-client',
  'demo-press',
  'demo-trial',
  'product-hunt',
  'linkedin-demo',
  'reddit-demo',
]

const DEMO_STATS = [
  { label: 'Leads', value: '248', sub: '12 converted', icon: Users, color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Quotations', value: '34', sub: '₹8.2L quoted', icon: FileCheck, color: '#34D399', bg: '#D1FAE5' },
  { label: 'Invoices', value: '189', sub: '₹4.6L paid', icon: FileText, color: '#F472B6', bg: '#FCE7F3' },
  { label: 'Products', value: '91', sub: '6 low stock', icon: Package, color: '#FBBF24', bg: '#FEF3C7' },
  { label: 'Employees', value: '14', sub: '₹2.1L/month', icon: UserCheck, color: '#34D399', bg: '#D1FAE5' },
  { label: 'Candidates', value: '23', sub: '4 in interview', icon: UserPlus, color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Projects', value: '17', sub: '3 overdue', icon: FolderOpen, color: '#F472B6', bg: '#FCE7F3' },
  { label: 'BI Charts', value: '↗', sub: 'live analytics', icon: BarChart3, color: '#FBBF24', bg: '#FEF3C7' },
]

const DEMO_MODULES = [
  { name: 'Leads & CRM', emoji: '👥', desc: 'AI lead scoring, follow-ups, pipeline' },
  { name: 'Sales Quotations', emoji: '📋', desc: 'Build quotes, PDF download, convert to invoice' },
  { name: 'Invoices', emoji: '📄', desc: 'GST/VAT/HST for 15+ countries, WhatsApp send' },
  { name: 'Inventory + QR', emoji: '📦', desc: 'Free QR codes, low stock alerts' },
  { name: 'HR & Payroll', emoji: '👤', desc: 'Team, salaries, total payroll' },
  { name: 'Recruiting', emoji: '🧑‍💼', desc: 'Applied → Hired candidate pipeline' },
  { name: 'Projects', emoji: '🎯', desc: 'Kanban — Planning to Done' },
  { name: 'BI Dashboard', emoji: '📊', desc: 'Live charts across all modules' },
  { name: 'AI Intelligence', emoji: '🤖', desc: 'AI that reads your live business data' },
  { name: 'Universal Import', emoji: '📥', desc: 'Any CSV from any software, zero field mapping' },
]

export default function Demo() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [valid, setValid] = useState(false)
  const [checking, setChecking] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (!token || !VALID_TOKENS.includes(token)) {
      setChecking(false)
      setValid(false)
    } else {
      setChecking(false)
      setValid(true)
      // Set demo AI greeting
      setAiMessage('👋 Welcome to Samyojak demo! You have 248 leads in your pipeline, 12 converted this month. Revenue collected is ₹4.6L. 3 projects are overdue and need attention today. Your team payroll is ₹2.1L/month.')
    }
  }, [token])

  const askDemoAI = async () => {
    if (!aiInput.trim()) return
    const q = aiInput.toLowerCase()
    setAiInput('')
    setAiLoading(true)
    await new Promise(r => setTimeout(r, 800))

    let reply = ''
    if (q.includes('lead') || q.includes('crm')) {
      reply = '📊 You have 248 leads total. 12 converted this month — a 4.8% conversion rate. 34 leads have follow-ups due this week. Top source is LinkedIn with 89 leads.'
    } else if (q.includes('invoice') || q.includes('payment')) {
      reply = '💰 189 invoices total. ₹4.6L collected. 23 invoices overdue worth ₹1.2L — follow up on these immediately. GST collected this quarter: ₹82,000.'
    } else if (q.includes('stock') || q.includes('inventory')) {
      reply = '📦 91 products tracked. 6 items are at or below reorder level. Fastest moving product: Blue Widget Pro — 43 units sold this month.'
    } else if (q.includes('team') || q.includes('employee') || q.includes('hr')) {
      reply = '👥 14 employees. Monthly payroll ₹2.1L. Engineering has 5 people, Sales has 4, Operations has 3, Management has 2. 3 candidates in final interview stage.'
    } else if (q.includes('project')) {
      reply = '🎯 17 projects tracked. 5 in Planning, 7 In Progress, 2 in Review, 3 Done. 3 projects are overdue — Website Redesign, Mobile App v2, and Q3 Campaign.'
    } else {
      reply = '🤖 This is a demo of Samyojak AI. In your real account, AI reads your live CRM, invoices, inventory, HR, and project data and gives specific answers about your actual business numbers.'
    }

    setAiMessage(reply)
    setAiLoading(false)
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
    </div>
  )

  if (!valid) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#FFFDF5' }}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
          Demo link invalid
        </h1>
        <p className="text-gray-500 mb-6">
          This demo link is not valid or has expired. Request a new link from the Samyojak team.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/"
            className="px-6 py-3 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
            style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
            Visit Website
          </Link>
          <Link href="/signup"
            className="candy-btn px-6 py-3 text-sm">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans', minHeight: '100vh' }}>

      {/* Demo banner */}
      <div className="sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between"
        style={{ background: '#8B5CF6' }}>
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-black">👀 DEMO MODE</span>
          <span className="text-white/70 text-xs">— This is a demonstration of Samyojak ERP</span>
        </div>
        <Link href="/signup"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:opacity-90"
          style={{ background: 'white', color: '#8B5CF6' }}>
          Start Trial <ArrowRight size={12} />
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 py-8" style={{ background: '#0F172A' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: '#8B5CF6', border: '2px solid rgba(139,92,246,0.5)' }}>
              S
            </div>
            <span className="font-black text-xl text-white" style={{ fontFamily: 'Outfit' }}>Samyojak</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit' }}>
            Welcome to Samyojak ERP Demo
          </h1>
          <p className="text-gray-400">
            The ERP that adapts to you — not the other way around. Explore all features below.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Stats grid */}
        <div>
          <h2 className="text-lg font-black mb-4 text-gray-900" style={{ fontFamily: 'Outfit' }}>
            📊 Dashboard Overview (Demo Data)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEMO_STATS.map(s => (
              <div key={s.label}
                className="bg-white rounded-2xl p-4"
                style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #F1F5F9' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: s.bg, border: `2px solid ${s.color}` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <p className="text-gray-500 text-xs uppercase font-semibold mb-1">{s.label}</p>
                <p className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: s.color }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Demo */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#0F172A', border: '2px solid #334155', boxShadow: '6px 6px 0px #8B5CF6' }}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#8B5CF6' }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-white" style={{ fontFamily: 'Outfit' }}>
                  AI Business Intelligence — Demo
                </p>
                <p className="text-xs text-green-400">Ask anything about the demo business data</p>
              </div>
            </div>

            {aiMessage && (
              <div className="mb-4 p-3 rounded-xl text-sm leading-relaxed"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#E9D5FF', border: '1px solid rgba(139,92,246,0.3)' }}>
                {aiLoading ? (
                  <div className="flex items-center gap-2">
                    {[0, 150, 300].map(d => (
                      <div key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                ) : aiMessage}
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askDemoAI()}
                placeholder="Ask about leads, invoices, stock, team..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
              />
              <button onClick={askDemoAI} disabled={!aiInput.trim()}
                className="px-4 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                style={{ background: '#8B5CF6' }}>
                <Send size={16} />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['How are my leads?', 'Overdue invoices?', 'Low stock?', 'Team overview?'].map(q => (
                <button key={q}
                  onClick={() => { setAiInput(q); setTimeout(() => askDemoAI(), 50) }}
                  className="px-2 py-1 rounded-full text-xs font-medium hover:opacity-80"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* All modules */}
        <div>
          <h2 className="text-lg font-black mb-4 text-gray-900" style={{ fontFamily: 'Outfit' }}>
            🚀 All 10 Modules Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_MODULES.map(m => (
              <div key={m.name}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white"
                style={{ border: '2px solid #E2E8F0' }}>
                <span className="text-2xl flex-shrink-0">{m.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-gray-900" style={{ fontFamily: 'Outfit' }}>{m.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key differentiators */}
        <div className="p-6 rounded-2xl"
          style={{ background: '#1E293B', border: '2px solid #334155' }}>
          <h2 className="text-lg font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
            Why businesses choose Samyojak
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: '📥', title: 'Import any CSV', desc: 'From Zoho, Salesforce, Tally, Excel — zero field mapping, zero data loss' },
              { icon: '⚡', title: '5-minute setup', desc: 'No configuration, no consultants, no training required' },
              { icon: '🌍', title: '15+ tax systems', desc: 'GST India, VAT UK, HST Canada, Sales Tax USA and more' },
              { icon: '💳', title: 'Weekly plans from $4.99', desc: 'No annual lock-in. Cancel anytime. Pay only for what you use' },
            ].map(d => (
              <div key={d.title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{d.icon}</span>
                <div>
                  <p className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit' }}>{d.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 px-6 rounded-2xl"
          style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #1E293B' }}>
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit' }}>
            Ready to start?
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            Set up your ERP in 5 minutes. Import your data. No credit card required.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup"
              className="px-8 py-3 rounded-full text-sm font-black inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'white', color: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <Link href="/pricing"
              className="px-8 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
              See Pricing
            </Link>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .candy-btn {
          background: #8B5CF6;
          color: white;
          border: 2px solid #1E293B;
          box-shadow: 4px 4px 0px #1E293B;
          border-radius: 9999px;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .candy-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #1E293B;
        }
      `}</style>
    </div>
  )
}
