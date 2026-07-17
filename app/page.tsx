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
  { key: 'starter', name: 'CRM Starter', emoji: '🚀', gradient: 'from-violet-500 to-violet-600', features: ['CRM + AI lead scoring', 'Sales Quotations', 'Support tickets', 'CSV import any format', 'Export to CSV'] },
  { key: 'basic', name: 'ERP Basic', emoji: '⚡', gradient: 'from-pink-500 to-pink-600', popular: true, features: ['Everything in Starter', 'Universal Tax Invoicing', 'Recurring Invoices', 'Inventory + QR codes', 'BI Dashboard Charts', 'WhatsApp Invoicing'] },
  { key: 'business', name: 'Business', emoji: '🏢', gradient: 'from-emerald-500 to-emerald-600', features: ['Everything in ERP Basic', 'HR & Payroll', 'Project Kanban', 'Recruiting Tracker', 'Advanced Analytics'] },
  { key: 'complete', name: 'Complete ERP', emoji: '👑', gradient: 'from-amber-500 to-amber-600', features: ['Everything in Business', 'AI Business Intelligence', 'Live data AI analysis', 'Priority support', 'All future features'] },
]

const MODULES = [
  { icon: Contact, label: 'CRM', desc: 'AI lead scoring, pipeline, follow-ups', gradient: 'from-violet-500 to-violet-600' },
  { icon: FileCheck, label: 'Quotations', desc: 'Build quotes, PDF export, convert to invoice', gradient: 'from-pink-500 to-pink-600' },
  { icon: Receipt, label: 'Invoices', desc: 'GST/VAT/HST for 15+ countries', gradient: 'from-amber-500 to-amber-600' },
  { icon: Boxes, label: 'Inventory', desc: 'Stock tracking + free auto QR codes', gradient: 'from-emerald-500 to-emerald-600' },
  { icon: Users, label: 'HR & Payroll', desc: 'Team, salaries, departments, leave', gradient: 'from-violet-500 to-violet-600' },
  { icon: UserPlus, label: 'Recruiting', desc: 'Applied → Screened → Interview → Hired', gradient: 'from-pink-500 to-pink-600' },
  { icon: FolderKanban, label: 'Projects', desc: 'Kanban: Planning → In Progress → Done', gradient: 'from-amber-500 to-amber-600' },
  { icon: BarChart3, label: 'BI Dashboard', desc: 'Live recharts across all modules', gradient: 'from-emerald-500 to-emerald-600' },
  { icon: Bot, label: 'AI Assistant', desc: 'Reads your live data, gives real answers', gradient: 'from-violet-500 to-violet-600' },
  { icon: TrendingUp, label: 'Reports', desc: 'GST reports, revenue analytics, exports', gradient: 'from-pink-500 to-pink-600' },
  { icon: Globe, label: 'Universal Import', desc: 'Any CSV, any software, zero field mapping', gradient: 'from-amber-500 to-amber-600' },
  { icon: RefreshCcw, label: 'Recurring Bills', desc: 'Auto-invoice weekly, monthly, yearly', gradient: 'from-emerald-500 to-emerald-600' },
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
    <div className="bg-[#F7F7FB] text-slate-900 [font-family:'Plus_Jakarta_Sans',sans-serif]">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_4px_14px_-2px_rgba(139,92,246,0.55)]">
              <span className="text-lg font-bold text-white [font-family:'Outfit',sans-serif]">S</span>
            </div>
            <div className="leading-tight">
              <div className="text-[17px] font-bold tracking-tight [font-family:'Outfit',sans-serif]">Samyojak</div>
              <div className="text-[11px] text-slate-500">ERP That Adapts To You</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[14.5px] font-semibold text-slate-600 lg:flex">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h} className="transition-colors hover:text-violet-700">{l}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="rounded-lg border border-slate-200 px-4 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Sign In
            </Link>
            <Link href="/signup" className="group flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(124,58,237,0.6)] transition hover:shadow-[0_8px_20px_-4px_rgba(124,58,237,0.75)]">
              Start Trial
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button className="rounded-lg border border-slate-200 p-2 lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto max-w-6xl space-y-3 border-t border-slate-200 px-6 pb-4 pt-4 lg:hidden">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMenuOpen(false)} className="block text-[14.5px] font-semibold text-slate-700">{l}</Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-[14px] font-semibold text-slate-700">
                Sign In
              </Link>
              <Link href="/signup" className="flex-1 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 py-2.5 text-center text-[14px] font-semibold text-white">
                Start Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-violet-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-pink-200/30 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-20">
          {/* Left */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-[13px] font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered · Adaptive · Smart
            </div>

            <h1 className="text-[38px] font-extrabold leading-[1.1] tracking-tight text-slate-900 [font-family:'Outfit',sans-serif] sm:text-[52px]">
              The ERP
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                That Adapts To You
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-[16.5px] leading-relaxed text-slate-600 lg:mx-0">
              Import your data from anywhere. No templates. No forced formats.
              No data loss. Samyojak{' '}
              <span className="font-semibold text-slate-800">adapts to your business</span>{' '}
              — not the other way around.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row lg:justify-start">
              <Link href="/signup" className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-6px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-6px_rgba(124,58,237,0.65)]">
                Start Trial
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-[15px] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
                Book a Demo
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13.5px] font-medium text-slate-600 lg:justify-start">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> No Credit Card Required</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Setup in 5 Minutes</div>
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-violet-500" /> Made in India 🇮🇳</div>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="relative mx-auto w-full max-w-xl [perspective:1800px] lg:mx-0">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-br from-violet-400/20 to-pink-300/10 blur-2xl" />

            <div
              className="relative rounded-2xl border border-slate-200/70 bg-white shadow-[0_30px_60px_-20px_rgba(76,29,149,0.35),0_10px_24px_-8px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out hover:[transform:rotateY(0deg)_rotateX(0deg)]"
              style={{ transform: 'rotateY(-6deg) rotateX(3deg)' }}
            >
              <div className="flex overflow-hidden rounded-2xl">
                {/* Sidebar */}
                <div className="hidden w-[180px] shrink-0 flex-col bg-[#0F1225] px-3 py-4 sm:flex">
                  <div className="mb-5 flex items-center gap-2 px-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
                      <span className="text-[13px] font-bold text-white">S</span>
                    </div>
                    <span className="text-[13px] font-bold text-white [font-family:'Outfit',sans-serif]">Samyojak</span>
                  </div>

                  <nav className="flex flex-1 flex-col gap-0.5 text-[11.5px] font-medium text-slate-400">
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
                      <div
                        key={label}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                          active ? 'bg-violet-600 text-white shadow-[0_4px_12px_-2px_rgba(124,58,237,0.6)]' : 'hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </div>
                    ))}
                  </nav>

                  <div className="mt-3 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 p-3 text-white">
                    <div className="text-[10.5px] opacity-80">Current Plan</div>
                    <div className="text-[13px] font-bold">Business</div>
                  </div>
                </div>

                {/* Main */}
                <div className="flex-1 bg-slate-50 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">Welcome back, Omkar 👋</div>
                      <div className="text-[11.5px] text-slate-500">Here&apos;s your business today</div>
                    </div>
                    <div className="hidden items-center gap-2.5 text-slate-400 sm:flex">
                      <Search className="h-4 w-4" />
                      <Bell className="h-4 w-4" />
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-pink-500" />
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Leads', value: '248', change: '+12%', gradient: 'from-violet-500 to-violet-600' },
                      { label: 'Invoices', value: '189', change: '+8%', gradient: 'from-pink-500 to-pink-600' },
                      { label: 'Products', value: '91', change: '+5%', gradient: 'from-amber-500 to-amber-600' },
                      { label: 'Revenue', value: '₹4.6L', change: '+15%', gradient: 'from-emerald-500 to-emerald-600' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
                        <div className={`mb-2 h-6 w-6 rounded-lg bg-gradient-to-br ${s.gradient}`} />
                        <div className="text-[10.5px] text-slate-500">{s.label}</div>
                        <div className="text-[15px] font-bold text-slate-900 [font-family:'Outfit',sans-serif]">{s.value}</div>
                        <div className="text-[10px] font-semibold text-emerald-600">↑ {s.change}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
                    <div className="mb-3 text-[12.5px] font-bold text-slate-800">Revenue Trend</div>
                    <div className="flex h-16 items-end gap-1.5">
                      {[30, 45, 40, 55, 50, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-200 to-violet-500" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* floating chips */}
            <div className="absolute -left-6 top-10 hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_16px_30px_-10px_rgba(0,0,0,0.25)] sm:block">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-500" />
                <span className="text-[12px] font-bold text-slate-800">99.9% Uptime</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-4 hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_16px_30px_-10px_rgba(0,0,0,0.25)] sm:block">
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-violet-500" />
                <span className="text-[12px] font-bold text-slate-800">Zero Data Loss</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden border-y border-slate-200/70 bg-gradient-to-r from-violet-50 via-pink-50 to-violet-50 py-3.5">
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex-shrink-0 text-[13px] font-semibold text-violet-700">{item}</span>
          ))}
        </div>
      </div>

      {/* ── 12 MODULES ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-[13px] font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" /> 12 Modules — One Platform
          </div>
          <h2 className="mb-3 text-[30px] font-extrabold [font-family:'Outfit',sans-serif] sm:text-[38px]">
            Everything your business needs
          </h2>
          <p className="mx-auto max-w-xl text-[15.5px] text-slate-600">
            From CRM to AI — every tool in one workspace. No switching tabs. No disconnected tools.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.label}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_32px_-12px_rgba(76,29,149,0.25)]"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.gradient} shadow-[0_6px_14px_-4px_rgba(0,0,0,0.35)] transition group-hover:scale-105`}>
                <m.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-bold text-slate-900 [font-family:'Outfit',sans-serif]">{m.label}</h3>
              <p className="text-[14px] leading-relaxed text-slate-600">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADAPTIVE IMPORT — dark section ── */}
      <section className="bg-[#0F1225] py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white">
            <RefreshCcw className="h-3.5 w-3.5" /> The Feature That Changes Everything
          </div>
          <h2 className="mb-4 text-[30px] font-extrabold text-white [font-family:'Outfit',sans-serif] sm:text-[38px]">
            Upload any CSV. Get all your data.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-[15.5px] leading-relaxed text-slate-400">
            Every other ERP says: rename your columns first. Match our exact field names.
            Or your import will fail. We say: upload whatever you have. We understand it.
          </p>

          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {['🟠 Zoho CRM', '☁️ Salesforce', '🟡 HubSpot', '📊 Tally', '📋 Busy', '🟣 Odoo', '📗 Excel', '📊 Google Sheets'].map((s) => (
              <div key={s} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13.5px] font-semibold text-white">
                {s}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: RefreshCcw, title: 'Zero Field Mapping', desc: 'Upload exactly as-is. No column renaming ever.', color: 'text-violet-400' },
              { icon: ShieldCheck, title: 'Zero Data Loss', desc: 'Every row. Every column. 100% preserved.', color: 'text-emerald-400' },
              { icon: Zap, title: 'Instant Ready', desc: 'Import complete. Your ERP is live in 2 minutes.', color: 'text-amber-400' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <p className="mb-1 font-bold text-white [font-family:'Outfit',sans-serif]">{f.title}</p>
                <p className="text-[13.5px] text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-[30px] font-extrabold [font-family:'Outfit',sans-serif] sm:text-[38px]">
            Samyojak vs Legacy ERP
          </h2>
          <p className="text-slate-600">Why growing businesses are switching</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50">
            <div className="p-4 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Feature</div>
            <div className="p-4 text-center">
              <span className="rounded-full bg-gradient-to-b from-violet-500 to-violet-700 px-3 py-1 text-[11.5px] font-bold text-white">Samyojak</span>
            </div>
            <div className="p-4 text-center">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-[11.5px] font-semibold text-slate-600">Legacy ERP A/B</span>
            </div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 ${i < COMPARISON.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div className="p-4 text-[13.5px] font-semibold text-slate-700">{row.feature}</div>
              <div className="p-4 text-center text-[13.5px] font-bold text-emerald-600">✓ {row.samyojak}</div>
              <div className="p-4 text-center text-[13.5px] text-slate-400">✕ {row.others}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-[30px] font-extrabold [font-family:'Outfit',sans-serif] sm:text-[38px]">
              Simple pricing. No surprises.
            </h2>
            <p className="mb-6 text-slate-600">No per-user fees. No annual lock-in. Cancel anytime.</p>

            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              {(['weekly', 'monthly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`rounded-full px-6 py-2 text-[13.5px] font-bold capitalize transition-all ${
                    billing === b ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="text-[12.5px] font-semibold text-slate-400">
              {region === 'india' ? '🇮🇳 India pricing detected' : region === 'western' ? '🌎 Western pricing detected' : '🌍 Global pricing detected'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_32px_-12px_rgba(76,29,149,0.25)] ${
                  plan.popular ? 'border-violet-300 ring-2 ring-violet-200' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-b from-violet-500 to-violet-700 px-3 py-1 text-[11px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(124,58,237,0.6)]">
                    ⭐ POPULAR
                  </div>
                )}
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-lg shadow-[0_6px_14px_-4px_rgba(0,0,0,0.3)]`}>
                  {plan.emoji}
                </div>
                <h3 className="mb-1 text-[16px] font-bold text-slate-900 [font-family:'Outfit',sans-serif]">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-[30px] font-extrabold text-slate-900 [font-family:'Outfit',sans-serif]">{prices[plan.key]}</span>
                  <span className="ml-1 text-[12px] text-slate-400">/{billing === 'weekly' ? 'week' : 'month'}</span>
                </div>
                <ul className="mb-5 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px] font-medium text-slate-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full rounded-xl py-3 text-center text-[14px] font-bold transition hover:-translate-y-0.5 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-violet-500 to-violet-700 text-white shadow-[0_10px_20px_-6px_rgba(124,58,237,0.55)]'
                      : 'border border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Start Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-10 text-center text-[30px] font-extrabold [font-family:'Outfit',sans-serif] sm:text-[38px]">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]">
              <button className="flex w-full items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="pr-4 text-[14.5px] font-bold text-slate-900 [font-family:'Outfit',sans-serif]">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-violet-600" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />}
              </button>
              {openFaq === i && (
                <div className="border-t border-slate-100 px-5 pb-5">
                  <p className="pt-4 text-[14px] leading-relaxed text-slate-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0F1225] px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-[32px] font-extrabold text-white [font-family:'Outfit',sans-serif] sm:text-[42px]">
            Your business data.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Your way. Always.
            </span>
          </h2>
          <p className="mb-8 text-[16px] text-slate-400">
            Start your trial. Import your data. Running in 5 minutes. Cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="group flex items-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_-6px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5">
              Start Trial <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/contact" className="flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-[15px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/5">
              Talk to Us
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] text-slate-500">No credit card required · No field mapping · No data loss</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-[#0B0E1F] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
                  <span className="text-[13px] font-bold text-white">S</span>
                </div>
                <span className="font-bold text-white [font-family:'Outfit',sans-serif]">Samyojak</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-slate-400">The ERP that adapts to you. Not the other way around.</p>
              <p className="mt-3 text-[12px] text-slate-500">MSME Registered · Pune, India 🇮🇳</p>
            </div>
            <div>
              <p className="mb-3 text-[13.5px] font-bold text-white [font-family:'Outfit',sans-serif]">Product</p>
              {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about']].map(([l, h]) => (
                <Link key={h} href={h} className="mb-2 block text-[12.5px] text-slate-400 transition-colors hover:text-violet-400">{l}</Link>
              ))}
            </div>
            <div>
              <p className="mb-3 text-[13.5px] font-bold text-white [font-family:'Outfit',sans-serif]">Company</p>
              {[['About Us', '/about'], ['Contact', '/contact'], ['Support', '/support']].map(([l, h]) => (
                <Link key={h} href={h} className="mb-2 block text-[12.5px] text-slate-400 transition-colors hover:text-violet-400">{l}</Link>
              ))}
            </div>
            <div>
              <p className="mb-3 text-[13.5px] font-bold text-white [font-family:'Outfit',sans-serif]">Legal</p>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
                <Link key={h} href={h} className="mb-2 block text-[12.5px] text-slate-400 transition-colors hover:text-violet-400">{l}</Link>
              ))}
              <div className="mt-4">
                <p className="mb-1 text-[12px] text-slate-500">Support email</p>
                <a href="mailto:hello.samyojak@gmail.com" className="text-[12.5px] text-violet-400 transition-colors hover:text-violet-300">
                  hello.samyojak@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <p className="text-[12px] text-slate-500">© 2025 Samyojak. All rights reserved. MSME Registered India.</p>
            <p className="text-[12px] text-slate-500">🌍 Built for the world · Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

    </div>
  )
            }
