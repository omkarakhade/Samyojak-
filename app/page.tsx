'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Menu, X, Check, ChevronDown, ChevronUp,
  Users, FileText, Package, UserCheck, FolderOpen,
  BarChart3, Brain, Globe, Zap, Shield, TrendingUp,
  FileCheck, RefreshCw, UserPlus
} from 'lucide-react'

const MARQUEE_ITEMS = [
  '🚀 Adaptive ERP', '🤖 AI Business Intelligence', '📊 Sales Quotations',
  '📈 BI Dashboard', '🔄 Recurring Invoices', '👥 Recruiting Tracker',
  '🌍 15+ Tax Systems', '📦 Free QR Codes', '⚡ 5-Minute Setup',
  '📥 Import Any CSV', '💳 Weekly Plans', '🔒 Enterprise Security',
]

const FEATURES = [
  { icon: Users, title: 'CRM + AI Lead Scoring', color: '#8B5CF6', bg: '#EDE9FE', desc: 'Manage your pipeline with AI scoring, follow-up reminders, and status tracking.' },
  { icon: FileText, title: 'Universal Tax Invoicing', color: '#F472B6', bg: '#FCE7F3', desc: 'GST, VAT, HST, Sales Tax for 15+ countries. WhatsApp sending included.' },
  { icon: FileCheck, title: 'Sales Quotations', color: '#34D399', bg: '#D1FAE5', desc: 'Build professional quotes instantly. One-click PDF download. Convert to invoice.' },
  { icon: Package, title: 'Inventory + QR Codes', color: '#FBBF24', bg: '#FEF3C7', desc: 'Track stock with auto-generated QR codes, low stock alerts, reorder management.' },
  { icon: UserCheck, title: 'HR & Payroll', color: '#34D399', bg: '#D1FAE5', desc: 'Manage your team, salaries, departments, joining dates, and leave balance.' },
  { icon: FolderOpen, title: 'Projects Kanban', color: '#8B5CF6', bg: '#EDE9FE', desc: 'Track client projects with visual Kanban — Planning, In Progress, Review, Done.' },
  { icon: BarChart3, title: 'BI Dashboard + Charts', color: '#F472B6', bg: '#FCE7F3', desc: 'Live charts across all modules. Revenue trends, pipeline health, payroll overview.' },
  { icon: RefreshCw, title: 'Recurring Invoices', color: '#FBBF24', bg: '#FEF3C7', desc: 'Set up weekly, monthly, or yearly auto-invoices. Never miss a billing cycle.' },
  { icon: UserPlus, title: 'Recruiting Tracker', color: '#8B5CF6', bg: '#EDE9FE', desc: 'Track candidates through Applied, Screening, Interview, Offer, Hired stages.' },
  { icon: Brain, title: 'AI Business Intelligence', color: '#FBBF24', bg: '#FEF3C7', desc: 'AI that reads your live data and gives specific, actionable business insights.' },
  { icon: Globe, title: 'Import Any CSV Format', color: '#34D399', bg: '#D1FAE5', desc: 'From Zoho, Salesforce, HubSpot, Tally, Excel — every column preserved. Zero loss.' },
  { icon: Shield, title: 'Enterprise Security', color: '#F472B6', bg: '#FCE7F3', desc: 'SSL encrypted, Supabase auth, rate limiting, session timeout. Bank-grade security.' },
]

const PRICING = {
  india: {
    weekly: { crm: '$4.99', erp: '$9.99', business: '$16.99', complete: '$21.99' },
    monthly: { crm: '$15', erp: '$29', business: '$49', complete: '$69' },
  },
  western: {
    weekly: { crm: '$9.99', erp: '$19.99', business: '$29.99', complete: '$39.99' },
    monthly: { crm: '$29', erp: '$59', business: '$89', complete: '$119' },
  },
}

const COMPARISON = [
  { feature: 'Setup time', us: '5 minutes', them: '2-8 weeks' },
  { feature: 'Field mapping on import', us: 'None required', them: 'Manual every time' },
  { feature: 'Columns skipped on import', us: 'Zero', them: '30-60% skipped' },
  { feature: 'AI business intelligence', us: 'Live data', them: 'Add-on extra cost' },
  { feature: 'Weekly plans', us: 'Yes — from $4.99', them: 'Annual lock-in only' },
  { feature: 'Tax systems', us: '15+ countries', them: '3-5 countries' },
  { feature: 'WhatsApp invoicing', us: 'Built in', them: 'Not available' },
  { feature: 'Sales quotations', us: 'Built in + PDF', them: 'Paid add-on' },
  { feature: 'Recurring invoices', us: 'Built in', them: 'Paid add-on' },
  { feature: 'BI Dashboard charts', us: 'Built in', them: 'Enterprise plan only' },
  { feature: 'Recruiting tracker', us: 'Built in', them: 'Separate HR module' },
  { feature: 'Price per month', us: 'From $15', them: '$50-500+' },
]

const FAQS = [
  { q: 'Can I import my existing data from any software?', a: 'Yes. Upload any CSV from Zoho, Salesforce, HubSpot, Tally, Excel, SAP, or any software. Every column and every row is imported exactly as-is. No field mapping required. No data loss.' },
  { q: 'How long does setup take?', a: 'Under 5 minutes. Sign up, import your CSV or add your first record, and you are running. No configuration, no consultants, no training.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Weekly plans expire at the end of the week. Monthly plans at the end of the month. No cancellation fees ever.' },
  { q: 'What countries and tax systems are supported?', a: 'India (GST), UK (VAT), USA (Sales Tax), Canada (HST/GST), Australia (GST), Germany (VAT), France (VAT), UAE (VAT), Saudi Arabia (VAT), Singapore (GST), New Zealand (GST), Malaysia (SST), Japan (CT), South Africa (VAT), and custom tax.' },
  { q: 'What is included in AI Business Intelligence?', a: 'The AI reads your live CRM, invoice, inventory, HR, and project data and gives specific actionable answers. Ask it how your leads are doing, which invoices are overdue, or what you should focus on today.' },
  { q: 'Do you charge per user?', a: 'No. All plans are flat-rate for your whole team regardless of how many people use it.' },
]

const BUSINESS_TYPES = [
  { emoji: '🏪', type: 'Retail & Trading' },
  { emoji: '🏭', type: 'Manufacturing' },
  { emoji: '🏥', type: 'Healthcare' },
  { emoji: '🏫', type: 'Schools & Training' },
  { emoji: '💼', type: 'Agencies' },
  { emoji: '🚚', type: 'Logistics' },
  { emoji: '🍽️', type: 'Restaurants' },
  { emoji: '💻', type: 'SaaS & Tech' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billing, setBilling] = useState<'weekly' | 'monthly'>('weekly')
  const [region, setRegion] = useState<'india' | 'western'>('western')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) setRegion('india')
  }, [])

  const prices = PRICING[region][billing]

  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 px-6 py-4"
        style={{ background: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '2px solid #E2E8F0' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              S
            </div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={href} href={href}
                className="text-sm font-medium hover:text-violet-600 transition-colors"
                style={{ color: '#64748B' }}>{label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full"
              style={{ color: '#64748B' }}>Sign In</Link>
            <Link href="/signup"
              className="candy-btn px-5 py-2 text-sm">Start Trial</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={href} href={href} className="block text-sm font-medium text-gray-600 py-1"
                onClick={() => setMenuOpen(false)}>{label}</Link>
            ))}
            <Link href="/login" className="block text-sm font-medium text-gray-600 py-1"
              onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link href="/signup" className="candy-btn block text-center py-2 text-sm"
              onClick={() => setMenuOpen(false)}>Start Trial</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="px-6 py-20 md:py-28 relative overflow-hidden">
        {/* dot grid background */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #8B5CF6 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* color blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: '#8B5CF6' }} />
        <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full opacity-10 blur-3xl"
          style={{ background: '#F472B6' }} />

        <div className="max-w-5xl mx-auto relative">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
              <Zap size={14} /> Now with Sales Quotations, BI Charts & Recurring Invoices
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              The ERP that{' '}
              <span style={{
                background: 'linear-gradient(90deg, #8B5CF6, #F472B6, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite',
              }}>
                adapts to you
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-3xl leading-relaxed" style={{ color: '#64748B' }}>
              Most ERP software says: <em>adapt to us.</em><br />
              Samyojak says: <strong style={{ color: '#8B5CF6' }}>we adapt to you.</strong>
            </p>
            <p className="text-lg mb-10 max-w-2xl" style={{ color: '#94A3B8' }}>
              Upload any CSV from Zoho, Salesforce, Tally, Excel — every column preserved, zero field mapping, zero data loss. CRM, Invoices, Quotations, Inventory, HR, Projects, BI Charts, AI — all in one place.
            </p>

            <div className="flex gap-4 flex-wrap mb-10">
              <Link href="/signup"
                className="candy-btn px-8 py-4 text-lg inline-flex items-center gap-2">
                Start Trial <ArrowRight size={20} />
              </Link>
              <Link href="/features"
                className="px-8 py-4 text-lg rounded-full font-bold inline-flex items-center gap-2 transition-colors hover:bg-gray-100"
                style={{ border: '2px solid #E2E8F0', color: '#64748B' }}>
                See All Features
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex gap-3 flex-wrap">
              {['✅ No field mapping', '✅ Zero data loss', '✅ 5-min setup', '✅ Cancel anytime', '✅ 15+ tax systems'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#F1F5F9', color: '#64748B' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: '2px solid #E2E8F0', background: 'white' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 px-3 py-1 rounded-full text-xs text-gray-400"
                style={{ background: 'white', border: '1px solid #E2E8F0' }}>
                samyojak.vercel.app/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="p-6" style={{ background: '#0F172A' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Leads', value: '248', color: '#8B5CF6', bg: '#1E1040' },
                  { label: 'Revenue', value: '₹4.2L', color: '#34D399', bg: '#0A2818' },
                  { label: 'Products', value: '91', color: '#FBBF24', bg: '#1C1500' },
                  { label: 'Projects', value: '17', color: '#F472B6', bg: '#1C0A14' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: s.bg }}>
                    <p className="text-xs mb-1" style={{ color: s.color }}>{s.label}</p>
                    <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'AI Insight', text: '🤖 3 overdue invoices need follow-up today', color: '#8B5CF6' },
                  { label: 'New Quote', text: '📋 Quote #47 sent to Sharma Exports', color: '#34D399' },
                  { label: 'Recurring', text: '🔄 Auto-invoice sent to 12 clients', color: '#F472B6' },
                ].map(c => (
                  <div key={c.label} className="rounded-xl p-3" style={{ background: '#1E293B' }}>
                    <p className="text-xs mb-1" style={{ color: c.color }}>{c.label}</p>
                    <p className="text-xs text-gray-300">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden py-4" style={{ background: '#8B5CF6', borderTop: '2px solid #1E293B', borderBottom: '2px solid #1E293B' }}>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-white font-bold text-sm flex-shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* NEW FEATURES BANNER */}
      <section className="px-6 py-12" style={{ background: '#0F172A' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-black"
            style={{ background: '#8B5CF6', color: 'white' }}>
            🆕 Just Added
          </div>
          <h2 className="text-3xl font-black text-white mb-8" style={{ fontFamily: 'Outfit' }}>
            4 powerful new features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileCheck, title: 'Sales Quotations', desc: 'Build quotes, download PDF, convert to invoice in one click', color: '#34D399', bg: '#0A2818' },
              { icon: BarChart3, title: 'BI Dashboard', desc: 'Live charts — revenue trends, pipeline, payroll, inventory', color: '#8B5CF6', bg: '#1E1040' },
              { icon: RefreshCw, title: 'Recurring Invoices', desc: 'Auto-invoice weekly, monthly, or yearly. Never miss billing', color: '#F472B6', bg: '#1C0A14' },
              { icon: UserPlus, title: 'Recruiting Tracker', desc: 'Track candidates from Applied to Hired with Kanban stages', color: '#FBBF24', bg: '#1C1500' },
            ].map(f => (
              <div key={f.title} className="p-5 rounded-2xl text-left"
                style={{ background: f.bg, border: `2px solid ${f.color}30` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}20`, border: `2px solid ${f.color}` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-black text-white text-sm mb-1" style={{ fontFamily: 'Outfit' }}>{f.title}</h3>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADAPTIVE ERP VISION */}
      <section className="px-6 py-20" style={{ background: '#1E293B' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
              The world's first truly adaptive ERP
            </h2>
            <p style={{ color: '#94A3B8' }} className="text-lg max-w-2xl mx-auto">
              Every other ERP forces your business to change. Samyojak changes itself to fit your business — whatever industry, whatever data format, whatever workflow.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {BUSINESS_TYPES.map(b => (
              <div key={b.type} className="p-4 rounded-2xl text-center"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1.5px solid rgba(139,92,246,0.3)' }}>
                <span className="text-3xl block mb-2">{b.emoji}</span>
                <p className="text-white text-xs font-bold">{b.type}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl text-center"
            style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.4)' }}>
            <p className="text-lg font-bold text-white">
              "Whatever data the user uploads, the ERP preserves, displays, analyzes, and reports on exactly that data — without forcing the user to adapt."
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              12 modules. One platform.
            </h2>
            <p className="text-lg" style={{ color: '#64748B' }}>
              Everything your business needs — CRM to AI to Recruiting — all in one adaptive workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl"
                style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #F1F5F9' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg, border: `2px solid ${f.color}` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: '#64748B' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="px-6 py-20" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Samyojak vs Legacy ERP A/B
            </h2>
            <p style={{ color: '#64748B' }}>Why growing businesses are switching</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #E2E8F0' }}>
            <div className="grid grid-cols-3 bg-gray-50" style={{ borderBottom: '2px solid #E2E8F0' }}>
              <div className="p-4 text-xs font-bold uppercase text-gray-400">Feature</div>
              <div className="p-4 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#8B5CF6' }}>Samyojak</span>
              </div>
              <div className="p-4 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-200">Legacy ERP A/B</span>
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div className="p-4 text-sm text-gray-600 font-medium">{row.feature}</div>
                <div className="p-4 text-center text-sm font-bold" style={{ color: '#34D399' }}>✅ {row.us}</div>
                <div className="p-4 text-center text-sm text-gray-400">❌ {row.them}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Simple pricing. No surprises.
            </h2>
            <p className="text-lg mb-6" style={{ color: '#64748B' }}>
              No per-user fees. No annual lock-in. Cancel anytime.
            </p>
            <div className="inline-flex p-1 rounded-full mb-4" style={{ background: '#E2E8F0' }}>
              {(['weekly', 'monthly'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className="px-6 py-2 rounded-full text-sm font-bold capitalize transition-all"
                  style={{
                    background: billing === b ? '#1E293B' : 'transparent',
                    color: billing === b ? 'white' : '#64748B',
                  }}>
                  {b}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400">
              {region === 'india' ? '🇮🇳 India pricing detected' : '🌍 Global pricing detected'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'CRM Starter', emoji: '🚀', price: prices.crm, color: '#8B5CF6', features: ['CRM + AI lead scoring', 'Sales Quotations', 'Support tickets', 'CSV import any format', 'CSV export'] },
              { name: 'ERP Basic', emoji: '⚡', price: prices.erp, color: '#F472B6', popular: true, features: ['Everything in CRM', 'Universal tax invoicing', 'Recurring invoices', 'Inventory + QR codes', 'BI Dashboard charts', 'WhatsApp invoicing'] },
              { name: 'Business', emoji: '🏢', price: prices.business, color: '#34D399', features: ['Everything in ERP Basic', 'HR & Payroll', 'Projects Kanban', 'Recruiting tracker', 'Advanced analytics'] },
              { name: 'Complete ERP', emoji: '👑', price: prices.complete, color: '#FBBF24', features: ['Everything in Business', 'AI Business Intelligence', 'Live data AI analysis', 'Floating AI assistant', 'Priority support', 'All future features'] },
            ].map(plan => (
              <div key={plan.name}
                className="rounded-2xl p-5 flex flex-col relative"
                style={{
                  background: plan.popular ? '#8B5CF6' : 'white',
                  border: '2px solid #1E293B',
                  boxShadow: plan.popular ? '6px 6px 0px #FBBF24' : '4px 4px 0px #E2E8F0',
                  transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap"
                    style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className="text-2xl mb-2">{plan.emoji}</div>
                <h3 className="font-black text-base mb-1"
                  style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-black"
                    style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                    {plan.price}
                  </span>
                  <span className="text-xs ml-1"
                    style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                    /{billing === 'weekly' ? 'week' : 'month'}
                  </span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs"
                      style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                      <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: plan.popular ? 'white' : '#34D399' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className="block w-full py-2.5 rounded-full text-sm font-bold text-center transition-opacity hover:opacity-90"
                  style={{
                    background: plan.popular ? 'white' : '#1E293B',
                    color: plan.popular ? '#8B5CF6' : 'white',
                    border: '2px solid #1E293B',
                  }}>
                  Start Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="px-6 py-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-black mb-8" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Built on infrastructure trusted by Fortune 500 companies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '▲ Vercel', desc: 'Global edge network. 99.99% uptime. Same infrastructure as Fortune 500.' },
              { name: '⚡ Supabase', desc: 'Enterprise authentication. Row-level security. Open-source Firebase alternative.' },
              { name: '🤖 Groq AI', desc: 'Fastest AI inference in the world. Real-time business intelligence from live data.' },
            ].map(i => (
              <div key={i.name} className="p-5 rounded-2xl"
                style={{ background: 'white', border: '2px solid #E2E8F0' }}>
                <p className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{i.name}</p>
                <p className="text-sm" style={{ color: '#64748B' }}>{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ border: '2px solid #E2E8F0', background: 'white' }}>
                <button className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-bold text-sm pr-4" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                    : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="pt-4 text-sm" style={{ color: '#64748B' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center" style={{ background: '#1E293B' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
            Your business data.<br />
            <span style={{ color: '#8B5CF6' }}>Your way. Always.</span>
          </h2>
          <p className="mb-8 text-lg" style={{ color: '#94A3B8' }}>
            Start your trial. Import your data. Running in 5 minutes. Cancel anytime.
          </p>
          <Link href="/signup"
            className="candy-btn px-12 py-5 text-xl inline-flex items-center gap-3">
            Start Trial <ArrowRight size={22} />
          </Link>
          <p className="mt-4 text-xs" style={{ color: '#475569' }}>
            No credit card required · No field mapping · No data loss
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12" style={{ background: '#0F172A', borderTop: '2px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black"
                  style={{ background: '#8B5CF6' }}>S</div>
                <span className="font-black text-white" style={{ fontFamily: 'Outfit' }}>Samyojak</span>
              </div>
              <p className="text-xs" style={{ color: '#475569' }}>
                The ERP that adapts to you. Not the other way around.
              </p>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Product</p>
              {[['Features', '/features'], ['Pricing', '/pricing'], ['Referral Program', '/referral']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 hover:text-violet-400 transition-colors" style={{ color: '#475569' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Company</p>
              {[['About Us', '/about'], ['Contact', '/contact'], ['Support', '/contact']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 hover:text-violet-400 transition-colors" style={{ color: '#475569' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Legal</p>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 hover:text-violet-400 transition-colors" style={{ color: '#475569' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: '#334155' }}>
              © 2025 Samyojak. All rights reserved. MSME Registered India.
            </p>
            <p className="text-xs" style={{ color: '#334155' }}>🌍 Made for the world</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
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
        .candy-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #1E293B;
        }
      `}</style>
    </div>
  )
}
