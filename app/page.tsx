'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, LayoutDashboard, Users, FileText, Boxes,
  Contact, FolderKanban, Receipt, BarChart3, Bot,
  Settings, Search, Bell, HelpCircle, ChevronDown,
  ArrowRight, CalendarDays, ShieldCheck, Zap,
  RefreshCcw, Gauge, Building2, Check, Menu, X,
  FileCheck, UserPlus, TrendingUp, Brain, Globe,
  ChevronUp
} from 'lucide-react'

const VALID_TOKENS = ['samyojak2025', 'demo-investor', 'demo-client', 'product-hunt']

function detectRegion() {
  if (typeof window === 'undefined') return 'global'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'india'
  if (
    tz.includes('America') || tz.includes('Europe') ||
    tz.includes('Australia') || tz.includes('Pacific')
  ) return 'western'
  return 'global'
}

const PRICING: Record<string, Record<string, Record<string, string>>> = {
  india: {
    weekly:  { starter: '₹450',   basic: '₹900',   business: '₹1,500', complete: '₹1,999' },
    monthly: { starter: '₹1,500', basic: '₹2,999', business: '₹4,999', complete: '₹6,999' },
  },
  global: {
    weekly:  { starter: '$6.99',  basic: '$13.99', business: '$22.99', complete: '$29.99' },
    monthly: { starter: '$21',    basic: '$41',    business: '$69',    complete: '$89'    },
  },
  western: {
    weekly:  { starter: '$9.99',  basic: '$19.99', business: '$29.99', complete: '$39.99' },
    monthly: { starter: '$29',    basic: '$59',    business: '$89',    complete: '$119'   },
  },
}

const PLANS = [
  {
    key: 'starter',
    name: 'CRM Starter',
    emoji: '🚀',
    color: 'from-violet-500 to-violet-700',
    features: ['CRM + AI lead scoring', 'Sales Quotations', 'Support tickets', 'CSV import any format', 'Export to CSV'],
  },
  {
    key: 'basic',
    name: 'ERP Basic',
    emoji: '⚡',
    color: 'from-emerald-500 to-emerald-700',
    popular: true,
    features: ['Everything in Starter', 'Universal Tax Invoicing', 'Recurring Invoices', 'Inventory + QR codes', 'BI Dashboard Charts', 'WhatsApp Invoicing'],
  },
  {
    key: 'business',
    name: 'Business',
    emoji: '🏢',
    color: 'from-blue-500 to-blue-700',
    features: ['Everything in ERP Basic', 'HR & Payroll', 'Project Kanban', 'Recruiting Tracker', 'Advanced Analytics'],
  },
  {
    key: 'complete',
    name: 'Complete ERP',
    emoji: '👑',
    color: 'from-amber-500 to-amber-700',
    features: ['Everything in Business', 'AI Business Intelligence', 'Live data AI analysis', 'Priority support', 'All future features'],
  },
]

const MODULES = [
  { icon: Contact,       label: 'CRM',           desc: 'AI lead scoring, pipeline, follow-ups',         color: 'from-violet-500 to-violet-600' },
  { icon: FileCheck,     label: 'Quotations',     desc: 'Build quotes, PDF export, convert to invoice',  color: 'from-emerald-500 to-emerald-600' },
  { icon: Receipt,       label: 'Invoices',       desc: 'GST/VAT/HST for 15+ countries, WhatsApp send', color: 'from-pink-500 to-pink-600' },
  { icon: Boxes,         label: 'Inventory',      desc: 'Stock tracking + free auto QR codes',           color: 'from-amber-500 to-amber-600' },
  { icon: Users,         label: 'HR & Payroll',   desc: 'Team, salaries, departments, leave',            color: 'from-blue-500 to-blue-600' },
  { icon: UserPlus,      label: 'Recruiting',     desc: 'Applied → Screened → Interview → Hired',        color: 'from-indigo-500 to-indigo-600' },
  { icon: FolderKanban,  label: 'Projects',       desc: 'Kanban: Planning → In Progress → Done',         color: 'from-teal-500 to-teal-600' },
  { icon: BarChart3,     label: 'BI Dashboard',   desc: 'Live recharts across all modules',              color: 'from-rose-500 to-rose-600' },
  { icon: Bot,           label: 'AI Assistant',   desc: 'Reads your live data, gives real answers',      color: 'from-violet-600 to-indigo-600' },
  { icon: TrendingUp,    label: 'Reports',        desc: 'GST reports, revenue analytics, exports',       color: 'from-cyan-500 to-cyan-600' },
  { icon: Globe,         label: 'Universal Import', desc: 'Any CSV, any software, zero field mapping',   color: 'from-slate-600 to-slate-700' },
  { icon: RefreshCcw,    label: 'Recurring Bills', desc: 'Auto-invoice weekly, monthly, yearly',         color: 'from-orange-500 to-orange-600' },
]

const COMPARISON = [
  { feature: 'Setup time',              samyojak: '5 minutes',         others: '2-8 weeks'         },
  { feature: 'CSV field mapping',       samyojak: 'Zero required',     others: 'Manual every time'  },
  { feature: 'Columns skipped',         samyojak: 'Zero — 100% kept',  others: '30-60% skipped'    },
  { feature: 'AI business intelligence', samyojak: 'Built in, live',   others: 'Paid add-on'       },
  { feature: 'Weekly plans',            samyojak: 'Yes — from $4.99',  others: 'Annual lock-in'    },
  { feature: 'Tax systems',             samyojak: '15+ countries',     others: '3-5 countries'     },
  { feature: 'WhatsApp invoicing',      samyojak: 'Built in',          others: 'Not available'     },
  { feature: 'Recruiting tracker',      samyojak: 'Built in',          others: 'Separate HR module' },
  { feature: 'BI Dashboard',            samyojak: 'Built in, free',    others: 'Enterprise only'   },
  { feature: 'Cancel anytime',          samyojak: 'Yes — weekly plans', others: 'Annual contracts' },
]

const FAQS = [
  {
    q: 'Do I need to rename my columns before importing?',
    a: 'Never. Samyojak accepts any CSV from any software — Zoho, Salesforce, HubSpot, Tally, Busy, SAP, Oracle, Excel. Every column is preserved exactly as-is. Zero field mapping. Zero data loss.',
  },
  {
    q: 'How long does setup take?',
    a: 'Under 5 minutes. Sign up, import your CSV or add your first record, and your ERP is running. No configuration, no consultants, no training sessions.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Weekly plans expire at the end of the week. Monthly plans at the end of the month. No cancellation fees ever. No lock-in.',
  },
  {
    q: 'What countries and tax systems are supported?',
    a: 'India (GST 0/5/12/18/28%), UK (VAT), USA (Sales Tax), Canada (HST/GST), Australia (GST), Germany (VAT), France (VAT), UAE (VAT), Saudi Arabia (VAT), Singapore (GST), New Zealand (GST), Malaysia (SST), Japan (CT), South Africa (VAT), and custom tax for others.',
  },
  {
    q: 'What does AI Business Intelligence actually do?',
    a: 'It reads your live CRM, invoice, inventory, HR, and project data and gives specific actionable answers — like "which leads are overdue for follow-up", "how much revenue was collected this month", "which products are low on stock". Real answers from your real data.',
  },
  {
    q: 'Do you charge per user?',
    a: 'No. All plans are flat-rate for your whole team regardless of how many people use it.',
  },
]

export default function HomePage() {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [billing,   setBilling]   = useState<'weekly' | 'monthly'>('weekly')
  const [region,    setRegion]    = useState<'india' | 'global' | 'western'>('global')
  const [openFaq,   setOpenFaq]   = useState<number | null>(null)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    setRegion(detectRegion() as any)
  }, [])

  const prices = PRICING[region][billing]

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_4px_14px_-2px_rgba(139,92,246,0.55)]">
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>S</span>
            </div>
            <div className="leading-tight">
              <div className="text-[17px] font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Samyojak
              </div>
              <div className="text-[11px] text-slate-500">ERP That Adapts To You</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-[14.5px] font-medium text-slate-600 lg:flex">
            {[
              { label: 'Features',  href: '/features' },
              { label: 'Pricing',   href: '/pricing'  },
              { label: 'About',     href: '/about'    },
              { label: 'Contact',   href: '/contact'  },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="transition-colors hover:text-violet-700">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login"
              className="rounded-lg border border-slate-200 px-4 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Login
            </Link>
            <Link href="/signup"
              className="group flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(124,58,237,0.6)] transition hover:shadow-[0_8px_20px_-4px_rgba(124,58,237,0.75)]">
              Get Started Free
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} className="text-slate-700" /> : <Menu size={22} className="text-slate-700" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            {[
              { label: 'Features', href: '/features' },
              { label: 'Pricing',  href: '/pricing'  },
              { label: 'About',    href: '/about'    },
              { label: 'Contact',  href: '/contact'  },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-1">
                {label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login"
                className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Login
              </Link>
              <Link href="/signup"
                className="flex-1 text-center rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 py-2 text-sm font-semibold text-white">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(139,92,246,0.15) 1px,transparent 1px)', backgroundSize: '26px 26px' }}
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-20">
          {/* Left */}
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-[13px] font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered · Adaptive · Smart
            </div>

            <h1 className="text-[44px] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-[56px]"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
              The ERP
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                That Adapts To You
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-slate-600">
              Import your data from anywhere. No templates. No forced formats.
              No data loss. Samyojak{' '}
              <span className="font-semibold text-slate-800">adapts to your business</span>
              {' '}— not the other way around.
            </p>

            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Link href="/signup"
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-6px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-6px_rgba(124,58,237,0.65)]">
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/contact"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
                <CalendarDays className="h-4 w-4" />
                Book a Demo
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Setup in 5 Minutes
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-violet-500" />
                Made in India 🇮🇳
              </div>
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="relative [perspective:1800px]">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-br from-violet-400/20 to-indigo-300/10 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200/70 bg-white shadow-[0_30px_60px_-20px_rgba(76,29,149,0.35),0_10px_24px_-8px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out hover:[transform:rotateY(0deg)_rotateX(0deg)]"
              style={{ transform: 'rotateY(-6deg) rotateX(3deg)' }}>
              <div className="flex overflow-hidden rounded-2xl">
                {/* Sidebar */}
                <div className="hidden w-[190px] shrink-0 flex-col bg-[#0F1225] px-3 py-4 sm:flex">
                  <div className="mb-5 flex items-center gap-2 px-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
                      <span className="text-[13px] font-bold text-white">S</span>
                    </div>
                    <span className="text-[13.5px] font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Samyojak
                    </span>
                  </div>
                  <nav className="flex flex-1 flex-col gap-0.5 text-[12.5px] font-medium text-slate-400">
                    {[
                      { icon: LayoutDashboard, label: 'Dashboard', active: true },
                      { icon: Contact,         label: 'CRM'                     },
                      { icon: FileCheck,       label: 'Quotations'              },
                      { icon: Receipt,         label: 'Invoices'                },
                      { icon: Boxes,           label: 'Inventory'               },
                      { icon: Users,           label: 'HR & Payroll'            },
                      { icon: UserPlus,        label: 'Recruiting'              },
                      { icon: FolderKanban,    label: 'Projects'                },
                      { icon: BarChart3,       label: 'BI Dashboard'            },
                      { icon: Bot,             label: 'AI Assistant'            },
                      { icon: Settings,        label: 'Settings'                },
                    ].map(({ icon: Icon, label, active }) => (
                      <div key={label}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${active ? 'bg-violet-600 text-white shadow-[0_4px_12px_-2px_rgba(124,58,237,0.6)]' : 'hover:bg-white/5'}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                    ))}
                  </nav>
                  <div className="mt-3 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 p-3 text-white">
                    <div className="text-[10.5px] opacity-80">Current Plan</div>
                    <div className="text-[13px] font-bold">Business</div>
                    <div className="mt-2 rounded-md bg-white/15 py-1.5 text-center text-[11px] font-semibold">Upgrade Plan</div>
                  </div>
                </div>

                {/* Main panel */}
                <div className="flex-1 bg-slate-50 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">Welcome back, Omkar 👋</div>
                      <div className="text-[11.5px] text-slate-500">Here&apos;s what&apos;s happening with your business today.</div>
                    </div>
                    <div className="hidden items-center gap-2.5 text-slate-400 sm:flex">
                      <Search className="h-4 w-4" />
                      <Bell className="h-4 w-4" />
                      <HelpCircle className="h-4 w-4" />
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-violet-600" />
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Total Leads',    value: '248',      change: '+12%', color: 'from-violet-500 to-violet-600' },
                      { label: 'Invoices',       value: '189',      change: '+8%',  color: 'from-emerald-500 to-emerald-600' },
                      { label: 'Products',       value: '91',       change: '+5%',  color: 'from-amber-500 to-amber-600' },
                      { label: 'Revenue',        value: '₹4.6L',   change: '+15%', color: 'from-blue-500 to-blue-600' },
                    ].map(s => (
                      <div key={s.label}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]">
                        <div className={`mb-2 h-6 w-6 rounded-lg bg-gradient-to-br ${s.color}`} />
                        <div className="text-[10.5px] text-slate-500">{s.label}</div>
                        <div className="text-[15px] font-bold text-slate-900">{s.value}</div>
                        <div className="text-[10px] font-semibold text-emerald-600">↑ {s.change} this week</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12.5px] font-bold text-slate-800">Revenue Overview</span>
                        <span className="text-[10.5px] text-slate-400">This Month</span>
                      </div>
                      <div className="flex h-16 items-end gap-1.5">
                        {[30, 45, 40, 55, 50, 70, 85].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-200 to-violet-500"
                            style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 text-[12.5px] font-bold text-slate-800">Sales Pipeline</div>
                      <div className="space-y-1.5">
                        {[
                          { w: '90%', c: 'bg-violet-500' },
                          { w: '70%', c: 'bg-indigo-400' },
                          { w: '50%', c: 'bg-blue-400'   },
                          { w: '30%', c: 'bg-amber-400'  },
                        ].map((row, i) => (
                          <div key={i} className="h-3.5 rounded-full bg-slate-100">
                            <div className={`h-3.5 rounded-full ${row.c}`} style={{ width: row.w }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips */}
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

      {/* ── TRUST STRIP ── */}
      <section className="border-y border-slate-200/70 bg-white/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 text-[13.5px] font-semibold text-slate-600">
          <span className="text-slate-400">Trusted by growing businesses</span>
          {[
            { icon: RefreshCcw,   label: 'Zero Data Loss'      },
            { icon: Zap,          label: 'Adaptive Import'     },
            { icon: Bot,          label: 'AI Assistant'        },
            { icon: Building2,    label: 'Made in India 🇮🇳'  },
            { icon: ShieldCheck,  label: 'Bank-Grade Security' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-violet-500" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── 12 MODULES GRID ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-[13px] font-semibold text-violet-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            12 Modules — One Platform
          </div>
          <h2 className="text-[36px] font-extrabold text-slate-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Everything your business needs
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            From CRM to AI — every tool in one workspace. No switching tabs. No disconnected tools.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(m => (
            <div key={m.label}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_32px_-12px_rgba(76,29,149,0.25)]">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} shadow-[0_6px_14px_-4px_rgba(0,0,0,0.35)] transition group-hover:scale-105`}>
                <m.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {m.label}
              </h3>
              <p className="text-[14px] leading-relaxed text-slate-600">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADAPTIVE IMPORT HIGHLIGHT ── */}
      <section className="bg-[#0F1225] py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-3.5 py-1.5 text-[13px] font-semibold text-violet-400 mb-6">
            <RefreshCcw className="h-3.5 w-3.5" />
            The Feature That Changes Everything
          </div>
          <h2 className="text-[36px] font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Upload any CSV. Get all your data.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-[16px] leading-relaxed">
            Every other ERP says: rename your columns first. Match our exact field names.
            Or your import will fail. We say: upload whatever you have. We understand it.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              '🟠 Zoho CRM', '☁️ Salesforce', '🟡 HubSpot',
              '📊 Tally', '📋 Busy', '🟣 Odoo',
              '📗 Excel', '📊 Google Sheets',
            ].map(s => (
              <div key={s} className="rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-semibold text-slate-300">
                {s}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: RefreshCcw,  title: 'Zero Field Mapping',   desc: 'Upload exactly as-is. No column renaming ever.' },
              { icon: ShieldCheck, title: 'Zero Data Loss',        desc: 'Every row. Every column. 100% preserved.' },
              { icon: Zap,         title: 'Instant Ready',         desc: 'Import complete. Your ERP is live in 2 minutes.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                <div className="w-9 h-9 rounded-xl bg-violet-600/30 flex items-center justify-center mb-3">
                  <f.icon className="h-4 w-4 text-violet-400" />
                </div>
                <p className="font-bold text-white mb-1">{f.title}</p>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[36px] font-extrabold text-slate-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Samyojak vs Legacy ERP
          </h2>
          <p className="text-slate-600">Why growing businesses are switching</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
            <div className="p-4 text-xs font-bold uppercase text-slate-400">Feature</div>
            <div className="p-4 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r from-violet-500 to-violet-700">
                Samyojak
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-slate-500 bg-slate-200">
                Legacy ERP A/B
              </span>
            </div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
              <div className="p-4 text-sm text-slate-600 font-medium">{row.feature}</div>
              <div className="p-4 text-center text-sm font-bold text-emerald-600">✅ {row.samyojak}</div>
              <div className="p-4 text-center text-sm text-slate-400">❌ {row.others}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-[36px] font-extrabold text-slate-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Simple pricing. No surprises.
            </h2>
            <p className="text-slate-600 mb-6">No per-user fees. No annual lock-in. Cancel anytime.</p>

            <div className="inline-flex p-1 rounded-full bg-slate-200 mb-4">
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

            <div className="text-xs text-slate-400">
              {region === 'india' ? '🇮🇳 India pricing detected' :
               region === 'western' ? '🌎 Western pricing detected' :
               '🌍 Global pricing detected'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map(plan => (
              <div key={plan.key}
                className={`relative rounded-2xl p-6 flex flex-col border-2 transition-all ${plan.popular ? 'border-violet-500 bg-white shadow-[0_20px_40px_-12px_rgba(124,58,237,0.35)]' : 'border-slate-200 bg-white shadow-sm'}`}
                style={{ transform: plan.popular ? 'scale(1.03)' : 'scale(1)' }}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_12px_-2px_rgba(124,58,237,0.5)]">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className="text-2xl mb-2">{plan.emoji}</div>
                <h3 className="font-black text-base text-slate-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {prices[plan.key]}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/{billing === 'weekly' ? 'week' : 'month'}</span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className={`block w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all hover:opacity-90 ${plan.popular ? 'bg-gradient-to-b from-violet-500 to-violet-700 text-white shadow-[0_6px_16px_-4px_rgba(124,58,237,0.5)]' : 'bg-slate-900 text-white'}`}>
                  Start Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-[36px] font-extrabold text-slate-900 text-center mb-10" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-bold text-sm text-slate-900 pr-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {faq.q}
                </span>
                {openFaq === i
                  ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <p className="pt-4 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0F1225] py-20 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-[40px] font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your business data.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Your way. Always.
            </span>
          </h2>
          <p className="text-slate-400 mb-8 text-[16px]">
            Start your trial. Import your data. Running in 5 minutes. Cancel anytime.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-8 py-4 text-[15px] font-semibold text-white shadow-[0_10px_24px_-6px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5">
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/contact"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white transition hover:bg-white/10">
              Talk to Us
            </Link>
          </div>
          <p className="text-slate-600 text-xs mt-6">
            No credit card required · No field mapping · No data loss
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080D1A] border-t border-white/5 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700">
                  <span className="font-black text-white text-sm">S</span>
                </div>
                <span className="font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Samyojak</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The ERP that adapts to you. Not the other way around.
              </p>
              <p className="text-xs text-slate-600 mt-3">MSME Registered · Pune, India 🇮🇳</p>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Product</p>
              {[
                ['Features',  '/features'],
                ['Pricing',   '/pricing' ],
                ['About',     '/about'   ],
              ].map(([l, h]) => (
                <Link key={h} href={h}
                  className="block text-xs text-slate-500 mb-2 hover:text-violet-400 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Company</p>
              {[
                ['About Us',  '/about'  ],
                ['Contact',   '/contact'],
                ['Support',   '/support'],
              ].map(([l, h]) => (
                <Link key={h} href={h}
                  className="block text-xs text-slate-500 mb-2 hover:text-violet-400 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Legal</p>
              {[
                ['Privacy Policy',   '/privacy'],
                ['Terms of Service', '/terms'  ],
              ].map(([l, h]) => (
                <Link key={h} href={h}
                  className="block text-xs text-slate-500 mb-2 hover:text-violet-400 transition-colors">
                  {l}
                </Link>
              ))}
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-1">Support</p>
                <a href="mailto:hello.samyojak@gmail.com"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  hello.samyojak@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © 2025 Samyojak. All rights reserved. MSME Registered India.
            </p>
            <p className="text-xs text-slate-600">🌍 Built for the world · Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

    </div>
  )
  }
