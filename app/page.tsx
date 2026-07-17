'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, LayoutDashboard, Users, FileText, Boxes,
  Contact, FolderKanban, Receipt, BarChart3, Bot,
  Settings, Search, Bell, ChevronDown, ArrowRight,
  ShieldCheck, Zap, RefreshCcw, Gauge, Building2, Check,
  Menu, X, FileCheck, UserPlus, TrendingUp, Globe, ChevronUp,
} from 'lucide-react'

function detectRegion() {
  if (typeof window === 'undefined') return 'global'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'india'
  if (tz.includes('America') || tz.includes('Europe') || tz.includes('Australia') || tz.includes('Pacific')) return 'western'
  return 'global'
}

const PRICING: Record<string, Record<string, Record<string, string>>> = {
  india:   { weekly: { starter: '₹450', basic: '₹900', business: '₹1,500', complete: '₹1,999' }, monthly: { starter: '₹1,500', basic: '₹2,999', business: '₹4,999', complete: '₹6,999' } },
  global:  { weekly: { starter: '$6.99', basic: '$13.99', business: '$22.99', complete: '$29.99' }, monthly: { starter: '$21', basic: '$41', business: '$69', complete: '$89' } },
  western: { weekly: { starter: '$9.99', basic: '$19.99', business: '$29.99', complete: '$39.99' }, monthly: { starter: '$29', basic: '$59', business: '$89', complete: '$119' } },
}

const PLANS = [
  { key: 'starter', name: 'CRM Starter', emoji: '🚀', color: '#8B5CF6', features: ['CRM + AI lead scoring', 'Sales Quotations', 'Support tickets', 'CSV import any format', 'Export to CSV'] },
  { key: 'basic', name: 'ERP Basic', emoji: '⚡', color: '#F472B6', popular: true, features: ['Everything in Starter', 'Universal Tax Invoicing', 'Recurring Invoices', 'Inventory + QR codes', 'BI Dashboard Charts', 'WhatsApp Invoicing'] },
  { key: 'business', name: 'Business', emoji: '🏢', color: '#34D399', features: ['Everything in ERP Basic', 'HR & Payroll', 'Project Kanban', 'Recruiting Tracker', 'Advanced Analytics'] },
  { key: 'complete', name: 'Complete ERP', emoji: '👑', color: '#FBBF24', features: ['Everything in Business', 'AI Business Intelligence', 'Live data AI analysis', 'Priority support', 'All future features'] },
]

const MODULES = [
  { icon: Contact, label: 'CRM', desc: 'AI lead scoring, pipeline, follow-ups', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: FileCheck, label: 'Quotations', desc: 'Build quotes, PDF export, convert to invoice', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Receipt, label: 'Invoices', desc: 'GST/VAT/HST for 15+ countries', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: Boxes, label: 'Inventory', desc: 'Stock tracking + free auto QR codes', color: '#34D399', bg: '#D1FAE5' },
  { icon: Users, label: 'HR & Payroll', desc: 'Team, salaries, departments, leave', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: UserPlus, label: 'Recruiting', desc: 'Applied → Screened → Interview → Hired', color: '#F472B6', bg: '#FCE7F3' },
  { icon: FolderKanban, label: 'Projects', desc: 'Kanban: Planning → In Progress → Done', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: BarChart3, label: 'BI Dashboard', desc: 'Live recharts across all modules', color: '#34D399', bg: '#D1FAE5' },
  { icon: Bot, label: 'AI Assistant', desc: 'Reads your live data, gives real answers', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: TrendingUp, label: 'Reports', desc: 'GST reports, revenue analytics, exports', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Globe, label: 'Universal Import', desc: 'Any CSV, any software, zero field mapping', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: RefreshCcw, label: 'Recurring Bills', desc: 'Auto-invoice weekly, monthly, yearly', color: '#34D399', bg: '#D1FAE5' },
]

const COMPARISON = [
  { feature: 'Setup time', samyojak: '5 minutes', others: '2-8 weeks' },
  { feature: 'CSV field mapping', samyojak: 'Zero required', others: 'Manual every time' },
  { feature: 'Columns skipped', samyojak: 'Zero — 100% kept', others: '30-60% skipped' },
  { feature: 'AI business intelligence', samyojak: 'Built in, live', others: 'Paid add-on' },
  { feature: 'Weekly plans', samyojak: 'Yes — from $4.99', others: 'Annual lock-in' },
  { feature: 'Tax systems', samyojak: '15+ countries', others: '3-5 countries' },
  { feature: 'WhatsApp invoicing', samyojak: 'Built in', others: 'Not available' },
  { feature: 'Recruiting tracker', samyojak: 'Built in', others: 'Separate module' },
  { feature: 'BI Dashboard', samyojak: 'Built in, free', others: 'Enterprise only' },
  { feature: 'Cancel anytime', samyojak: 'Yes — weekly plans', others: 'Annual contracts' },
]

const FAQS = [
  { q: 'Do I need to rename my columns before importing?', a: 'Never. Samyojak accepts any CSV from any software — Zoho, Salesforce, HubSpot, Tally, Busy, SAP, Oracle, Excel. Every column is preserved exactly as-is. Zero field mapping. Zero data loss.' },
  { q: 'How long does setup take?', a: 'Under 5 minutes. Sign up, import your CSV or add your first record, and your ERP is running. No configuration, no consultants, no training sessions.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Weekly plans expire at the end of the week. Monthly plans at the end of the month. No cancellation fees ever. No lock-in.' },
  { q: 'What countries and tax systems are supported?', a: 'India (GST), UK (VAT), USA (Sales Tax), Canada (HST/GST), Australia (GST), Germany (VAT), France (VAT), UAE (VAT), Saudi Arabia (VAT), Singapore (GST), New Zealand (GST), Malaysia (SST), Japan (CT), South Africa (VAT), and custom tax.' },
  { q: 'What does AI Business Intelligence actually do?', a: 'It reads your live CRM, invoice, inventory, HR, and project data and gives specific actionable answers — like which leads are overdue, how much revenue was collected, which products are low on stock. Real answers from your real data.' },
  { q: 'Do you charge per user?', a: 'No. All plans are flat-rate for your whole team regardless of how many people use it.' },
]

const MARQUEE_ITEMS = [
  '🚀 Adaptive ERP', '🤖 AI Intelligence', '📋 Sales Quotations', '📊 BI Dashboard',
  '🔄 Recurring Invoices', '🧑‍💼 Recruiting', '🌍 15+ Tax Systems', '📦 Free QR Codes',
  '⚡ 5-Min Setup', '📥 Import Any CSV', '💳 Weekly Plans', '🔒 Enterprise Security',
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [billing, setBilling] = useState<'weekly' | 'monthly'>('weekly')
  const [region, setRegion] = useState<'india' | 'global' | 'western'>('global')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    setRegion(detectRegion() as any)
  }, [])

  const prices = PRICING[region][billing]

  return (
    <div style={{ background: '#FFFDF5', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1E293B' }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 px-6 py-4"
        style={{ background: 'rgba(255,253,245,0.97)', backdropFilter: 'blur(10px)', borderBottom: '2px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B', fontFamily: 'Outfit, sans-serif' }}>
              S
            </div>
            <div>
              <div className="font-black text-xl leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Samyojak</div>
              <div className="text-[11px]" style={{ color: '#64748B' }}>ERP That Adapts To You</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-violet-600 transition-colors">{l}</Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-black rounded-full"
              style={{ border: '2px solid #1E293B', background: 'white' }}>
              Sign In
            </Link>
            <Link href="/signup" className="candy-btn px-5 py-2 text-sm">
              Start Trial <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button className="lg:hidden p-2 rounded-lg" style={{ border: '2px solid #1E293B', background: 'white' }}
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-4 pb-4 pt-4 space-y-3 max-w-6xl mx-auto" style={{ borderTop: '2px solid #E2E8F0' }}>
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMenuOpen(false)} className="block text-sm font-bold py-1">{l}</Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-black rounded-full" style={{ border: '2px solid #1E293B' }}>
                Sign In
              </Link>
              <Link href="/signup" className="candy-btn flex-1 justify-center py-2.5 text-sm">
                Start Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #8B5CF6 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', opacity: 0.12 }} />

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14">

          {/* LEFT — text */}
          <div className="flex-1 min-w-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-black"
              style={{ background: '#FEF3C7', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: '#8B5CF6' }} />
              AI-Powered · Adaptive · Smart
            </div>

            <h1 className="font-black leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(34px, 5vw, 56px)' }}>
              The ERP
              <br />
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                That Adapts To You
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0" style={{ color: '#475569' }}>
              Import your data from anywhere. No templates. No forced formats. No data loss.
              Samyojak <strong style={{ color: '#1E293B' }}>adapts to your business</strong> — not the other way around.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center lg:justify-start">
              <Link href="/signup" className="candy-btn justify-center px-7 py-4 text-base">
                Start Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="secondary-btn justify-center px-7 py-4 text-base">
                Book a Demo
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold justify-center lg:justify-start" style={{ color: '#475569' }}>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: '#34D399' }} /> No Credit Card Required</div>
              <div className="flex items-center gap-1.5"><Zap className="h-4 w-4" style={{ color: '#FBBF24' }} /> Setup in 5 Minutes</div>
              <div className="flex items-center gap-1.5"><Building2 className="h-4 w-4" style={{ color: '#8B5CF6' }} /> Made in India 🇮🇳</div>
            </div>
          </div>

          {/* RIGHT — dashboard mockup */}
          <div className="flex-1 min-w-0 w-full max-w-xl">
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid #1E293B', boxShadow: '10px 10px 0px #1E293B', background: '#F8FAFC' }}>
              <div className="flex">
                {/* Sidebar */}
                <div className="hidden sm:flex w-40 shrink-0 flex-col px-3 py-4" style={{ background: '#0F172A' }}>
                  <div className="flex items-center gap-2 px-2 mb-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: '#8B5CF6' }}>S</div>
                    <span className="font-black text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Samyojak</span>
                  </div>
                  <nav className="flex flex-1 flex-col gap-0.5 text-[11px] font-medium" style={{ color: '#94A3B8' }}>
                    {[
                      { icon: LayoutDashboard, label: 'Dashboard', active: true },
                      { icon: Contact, label: 'CRM' },
                      { icon: FileCheck, label: 'Quotations' },
                      { icon: Receipt, label: 'Invoices' },
                      { icon: Boxes, label: 'Inventory' },
                      { icon: Users, label: 'HR' },
                      { icon: UserPlus, label: 'Recruiting' },
                      { icon: FolderKanban, label: 'Projects' },
                      { icon: BarChart3, label: 'BI Dashboard' },
                      { icon: Bot, label: 'AI Assistant' },
                    ].map(({ icon: Icon, label, active }) => (
                      <div key={label} className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                        style={{ background: active ? '#8B5CF6' : 'transparent', color: active ? 'white' : '#94A3B8' }}>
                        <Icon className="h-3 w-3 flex-shrink-0" /> {label}
                      </div>
                    ))}
                  </nav>
                  <div className="mt-3 rounded-xl p-2.5 text-white" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
                    <div className="text-[9px] opacity-70">Current Plan</div>
                    <div className="font-black text-xs" style={{ fontFamily: 'Outfit, sans-serif' }}>Business</div>
                  </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-sm">Welcome back, Omkar 👋</div>
                      <div className="text-[10px]" style={{ color: '#64748B' }}>Here&apos;s your business today</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2" style={{ color: '#94A3B8' }}>
                      <Search className="h-3.5 w-3.5" />
                      <Bell className="h-3.5 w-3.5" />
                      <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Leads', value: '248', change: '+12%', color: '#8B5CF6', bg: '#EDE9FE' },
                      { label: 'Invoices', value: '189', change: '+8%', color: '#F472B6', bg: '#FCE7F3' },
                      { label: 'Products', value: '91', change: '+5%', color: '#FBBF24', bg: '#FEF3C7' },
                      { label: 'Revenue', value: '₹4.6L', change: '+15%', color: '#34D399', bg: '#D1FAE5' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-2.5" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '2px 2px 0px #1E293B' }}>
                        <div className="w-4 h-4 rounded-md mb-1" style={{ background: s.bg, border: `1.5px solid ${s.color}` }} />
                        <div className="text-[9px] font-semibold" style={{ color: '#64748B' }}>{s.label}</div>
                        <div className="font-black text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                        <div className="text-[9px] font-bold" style={{ color: '#34D399' }}>↑ {s.change}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-3" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '2px 2px 0px #1E293B' }}>
                    <div className="text-[10px] font-bold mb-2">Revenue Trend</div>
                    <div className="flex items-end gap-1 h-10">
                      {[30, 45, 40, 55, 50, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 6 ? '#8B5CF6' : '#EDE9FE' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips — safe static position, no overlap issues */}
            <div className="flex gap-3 mt-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
                <Gauge className="h-3.5 w-3.5" style={{ color: '#34D399' }} />
                <span className="text-xs font-black">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
                <RefreshCcw className="h-3.5 w-3.5" style={{ color: '#8B5CF6' }} />
                <span className="text-xs font-black">Zero Data Loss</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-4" style={{ background: '#8B5CF6', borderTop: '2px solid #1E293B', borderBottom: '2px solid #1E293B' }}>
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-white font-black text-sm flex-shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ── 12 MODULES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-black"
            style={{ background: '#EDE9FE', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#8B5CF6' }} /> 12 Modules — One Platform
          </div>
          <h2 className="font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Everything your business needs
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#64748B' }}>
            From CRM to AI — every tool in one workspace. No switching tabs. No disconnected tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map(m => (
            <div key={m.label} className="card-hover rounded-xl p-6"
              style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #1E293B' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                <m.icon className="h-5 w-5" style={{ color: m.color }} />
              </div>
              <h3 className="font-black text-base mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADAPTIVE IMPORT — dark section ── */}
      <section className="py-20" style={{ background: '#1E293B' }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-black"
            style={{ background: '#8B5CF6', border: '2px solid white', color: 'white' }}>
            <RefreshCcw className="h-3.5 w-3.5" /> The Feature That Changes Everything
          </div>
          <h2 className="font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Upload any CSV. Get all your data.
          </h2>
          <p className="text-base leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
            Every other ERP says: rename your columns first. Match our exact field names.
            Or your import will fail. We say: upload whatever you have. We understand it.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {['🟠 Zoho CRM', '☁️ Salesforce', '🟡 HubSpot', '📊 Tally', '📋 Busy', '🟣 Odoo', '📗 Excel', '📊 Google Sheets'].map(s => (
              <div key={s} className="rounded-xl py-3 px-4 text-sm font-bold"
                style={{ border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                {s}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: RefreshCcw, title: 'Zero Field Mapping', desc: 'Upload exactly as-is. No column renaming ever.', color: '#8B5CF6' },
              { icon: ShieldCheck, title: 'Zero Data Loss', desc: 'Every row. Every column. 100% preserved.', color: '#34D399' },
              { icon: Zap, title: 'Instant Ready', desc: 'Import complete. Your ERP is live in 2 minutes.', color: '#FBBF24' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-5 text-left" style={{ border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'white' }}>
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <p className="font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Samyojak vs Legacy ERP
          </h2>
          <p style={{ color: '#64748B' }}>Why growing businesses are switching</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #1E293B' }}>
          <div className="grid grid-cols-3" style={{ background: '#F8FAFC', borderBottom: '2px solid #1E293B' }}>
            <div className="p-4 text-xs font-black uppercase tracking-wide" style={{ color: '#94A3B8' }}>Feature</div>
            <div className="p-4 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: '#8B5CF6' }}>Samyojak</span>
            </div>
            <div className="p-4 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#F1F5F9', color: '#64748B' }}>Legacy ERP A/B</span>
            </div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className="grid grid-cols-3" style={{ borderBottom: i < COMPARISON.length - 1 ? '2px solid #F1F5F9' : 'none' }}>
              <div className="p-4 text-sm font-bold" style={{ color: '#475569' }}>{row.feature}</div>
              <div className="p-4 text-center text-sm font-black" style={{ color: '#34D399' }}>✅ {row.samyojak}</div>
              <div className="p-4 text-center text-sm" style={{ color: '#94A3B8' }}>❌ {row.others}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20" style={{ background: '#F1F5F9' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Simple pricing. No surprises.
            </h2>
            <p className="mb-6" style={{ color: '#64748B' }}>No per-user fees. No annual lock-in. Cancel anytime.</p>

            <div className="inline-flex p-1 rounded-full mb-4" style={{ background: 'white', border: '2px solid #1E293B' }}>
              {(['weekly', 'monthly'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className="px-6 py-2 rounded-full text-sm font-black capitalize transition-all"
                  style={{ background: billing === b ? '#1E293B' : 'transparent', color: billing === b ? 'white' : '#64748B' }}>
                  {b}
                </button>
              ))}
            </div>
            <div className="text-xs font-bold" style={{ color: '#94A3B8' }}>
              {region === 'india' ? '🇮🇳 India pricing detected' : region === 'western' ? '🌎 Western pricing detected' : '🌍 Global pricing detected'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-3">
            {PLANS.map(plan => (
              <div key={plan.key} className="rounded-2xl p-6 flex flex-col relative"
                style={{
                  background: plan.popular ? plan.color : 'white',
                  border: '2px solid #1E293B',
                  boxShadow: '6px 6px 0px #1E293B',
                }}>
                {plan.popular && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-black"
                    style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B' }}>
                    ⭐ POPULAR
                  </div>
                )}
                <div className="text-2xl mb-2">{plan.emoji}</div>
                <h3 className="font-black text-base mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: plan.popular ? 'white' : '#1E293B' }}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="font-black text-3xl" style={{ fontFamily: 'Outfit, sans-serif', color: plan.popular ? 'white' : '#1E293B' }}>
                    {prices[plan.key]}
                  </span>
                  <span className="text-xs ml-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                    /{billing === 'weekly' ? 'week' : 'month'}
                  </span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs font-medium" style={{ color: plan.popular ? 'rgba(255,255,255,0.95)' : '#475569' }}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: plan.popular ? 'white' : '#34D399' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full py-3 rounded-full text-sm font-black text-center"
                  style={{ background: plan.popular ? 'white' : '#1E293B', color: plan.popular ? plan.color : 'white', border: '2px solid #1E293B' }}>
                  Start Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="font-black text-center mb-10" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)' }}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '2px solid #1E293B', background: 'white' }}>
              <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-black text-sm pr-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{faq.q}</span>
                {openFaq === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: '#8B5CF6' }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: '#94A3B8' }} />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5" style={{ borderTop: '2px solid #F1F5F9' }}>
                  <p className="pt-4 text-sm leading-relaxed" style={{ color: '#64748B' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ background: '#1E293B' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(30px, 5vw, 46px)' }}>
            Your business data.
            <br />
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your way. Always.
            </span>
          </h2>
          <p className="text-lg mb-8" style={{ color: '#94A3B8' }}>
            Start your trial. Import your data. Running in 5 minutes. Cancel anytime.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup" className="candy-btn px-8 py-4 text-base">
              Start Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="flex items-center gap-2 px-8 py-4 text-base font-black rounded-full"
              style={{ border: '2px solid white', color: 'white' }}>
              Talk to Us
            </Link>
          </div>
          <p className="text-xs mt-6" style={{ color: '#94A3B8' }}>No credit card required · No field mapping · No data loss</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ background: '#0F172A', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: '#8B5CF6' }}>S</div>
                <span className="font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Samyojak</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>The ERP that adapts to you. Not the other way around.</p>
              <p className="text-xs mt-3" style={{ color: '#475569' }}>MSME Registered · Pune, India 🇮🇳</p>
            </div>
            <div>
              <p className="font-black text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Product</p>
              {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 hover:text-violet-400 transition-colors" style={{ color: '#64748B' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-black text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Company</p>
              {[['About Us', '/about'], ['Contact', '/contact'], ['Support', '/support']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 hover:text-violet-400 transition-colors" style={{ color: '#64748B' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-black text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Legal</p>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 hover:text-violet-400 transition-colors" style={{ color: '#64748B' }}>{l}</Link>
              ))}
              <div className="mt-4">
                <p className="text-xs mb-1" style={{ color: '#64748B' }}>Support email</p>
                <a href="mailto:hello.samyojak@gmail.com" className="text-xs hover:text-violet-300 transition-colors" style={{ color: '#8B5CF6' }}>
                  hello.samyojak@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs" style={{ color: '#475569' }}>© 2025 Samyojak. All rights reserved. MSME Registered India.</p>
            <p className="text-xs" style={{ color: '#475569' }}>🌍 Built for the world · Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

    </div>
  )
   }
