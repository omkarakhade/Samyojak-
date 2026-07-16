'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, LayoutDashboard, Users, FileText, Boxes,
  Contact, FolderKanban, Receipt, BarChart3, Bot,
  Settings, Search, Bell, HelpCircle, ChevronDown,
  ArrowRight, ShieldCheck, Zap, RefreshCcw, Gauge,
  Building2, Check, Menu, X, FileCheck, UserPlus,
  TrendingUp, Globe, ChevronUp, Brain
} from 'lucide-react'

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
    key: 'starter', name: 'CRM Starter', emoji: '🚀',
    color: '#8B5CF6', bg: '#EDE9FE',
    features: ['CRM + AI lead scoring', 'Sales Quotations', 'Support tickets', 'CSV import any format', 'Export to CSV'],
  },
  {
    key: 'basic', name: 'ERP Basic', emoji: '⚡',
    color: '#F472B6', bg: '#FCE7F3', popular: true,
    features: ['Everything in Starter', 'Universal Tax Invoicing', 'Recurring Invoices', 'Inventory + QR codes', 'BI Dashboard Charts', 'WhatsApp Invoicing'],
  },
  {
    key: 'business', name: 'Business', emoji: '🏢',
    color: '#34D399', bg: '#D1FAE5',
    features: ['Everything in ERP Basic', 'HR & Payroll', 'Project Kanban', 'Recruiting Tracker', 'Advanced Analytics'],
  },
  {
    key: 'complete', name: 'Complete ERP', emoji: '👑',
    color: '#FBBF24', bg: '#FEF3C7',
    features: ['Everything in Business', 'AI Business Intelligence', 'Live data AI analysis', 'Priority support', 'All future features'],
  },
]

const MODULES = [
  { icon: Contact,      label: 'CRM',              desc: 'AI lead scoring, pipeline, follow-ups',        color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: FileCheck,    label: 'Quotations',        desc: 'Build quotes, PDF export, convert to invoice', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Receipt,      label: 'Invoices',          desc: 'GST/VAT/HST for 15+ countries',               color: '#FBBF24', bg: '#FEF3C7' },
  { icon: Boxes,        label: 'Inventory',         desc: 'Stock tracking + free auto QR codes',          color: '#34D399', bg: '#D1FAE5' },
  { icon: Users,        label: 'HR & Payroll',      desc: 'Team, salaries, departments, leave',           color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: UserPlus,     label: 'Recruiting',        desc: 'Applied → Screened → Interview → Hired',       color: '#F472B6', bg: '#FCE7F3' },
  { icon: FolderKanban, label: 'Projects',          desc: 'Kanban: Planning → In Progress → Done',        color: '#FBBF24', bg: '#FEF3C7' },
  { icon: BarChart3,    label: 'BI Dashboard',      desc: 'Live recharts across all modules',             color: '#34D399', bg: '#D1FAE5' },
  { icon: Bot,          label: 'AI Assistant',      desc: 'Reads your live data, gives real answers',     color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: TrendingUp,   label: 'Reports',           desc: 'GST reports, revenue analytics, exports',      color: '#F472B6', bg: '#FCE7F3' },
  { icon: Globe,        label: 'Universal Import',  desc: 'Any CSV, any software, zero field mapping',    color: '#FBBF24', bg: '#FEF3C7' },
  { icon: RefreshCcw,   label: 'Recurring Bills',   desc: 'Auto-invoice weekly, monthly, yearly',         color: '#34D399', bg: '#D1FAE5' },
]

const COMPARISON = [
  { feature: 'Setup time',               samyojak: '5 minutes',        others: '2-8 weeks'        },
  { feature: 'CSV field mapping',        samyojak: 'Zero required',     others: 'Manual every time' },
  { feature: 'Columns skipped',          samyojak: 'Zero — 100% kept',  others: '30-60% skipped'   },
  { feature: 'AI business intelligence', samyojak: 'Built in, live',    others: 'Paid add-on'      },
  { feature: 'Weekly plans',             samyojak: 'Yes — from $4.99',  others: 'Annual lock-in'   },
  { feature: 'Tax systems',              samyojak: '15+ countries',     others: '3-5 countries'    },
  { feature: 'WhatsApp invoicing',       samyojak: 'Built in',          others: 'Not available'    },
  { feature: 'Recruiting tracker',       samyojak: 'Built in',          others: 'Separate module'  },
  { feature: 'BI Dashboard',             samyojak: 'Built in, free',    others: 'Enterprise only'  },
  { feature: 'Cancel anytime',           samyojak: 'Yes — weekly plans', others: 'Annual contracts' },
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
  '🚀 Adaptive ERP', '🤖 AI Intelligence', '📋 Sales Quotations',
  '📊 BI Dashboard', '🔄 Recurring Invoices', '🧑‍💼 Recruiting',
  '🌍 15+ Tax Systems', '📦 Free QR Codes', '⚡ 5-Min Setup',
  '📥 Import Any CSV', '💳 Weekly Plans', '🔒 Enterprise Security',
]

export default function HomePage() {
  const [menuOpen, setMenuOpen]  = useState(false)
  const [billing,  setBilling]   = useState<'weekly' | 'monthly'>('weekly')
  const [region,   setRegion]    = useState<'india' | 'global' | 'western'>('global')
  const [openFaq,  setOpenFaq]   = useState<number | null>(null)
  const [mounted,  setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    setRegion(detectRegion() as any)
  }, [])

  const prices = PRICING[region][billing]

  return (
    <div style={{ background: '#FFFDF5', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1E293B' }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 px-6 py-4"
        style={{ background: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '2px solid #E2E8F0' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B', fontFamily: 'Outfit, sans-serif' }}>
              S
            </div>
            <div>
              <div className="font-black text-xl leading-tight" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                Samyojak
              </div>
              <div className="text-[11px]" style={{ color: '#64748B' }}>ERP That Adapts To You</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium" style={{ color: '#64748B' }}>
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-violet-600 transition-colors">{l}</Link>
            ))}
          </nav>

          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 text-sm font-semibold rounded-full transition-all"
              style={{ border: '2px solid #E2E8F0', color: '#1E293B' }}>
              Sign In
            </Link>
            <Link href="/signup"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-black text-white rounded-full transition-all hover:-translate-y-0.5"
              style={{
                background: '#8B5CF6', border: '2px solid #1E293B',
                boxShadow: '4px 4px 0px #1E293B', fontFamily: 'Outfit, sans-serif',
              }}>
              Start Trial <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-lg"
            style={{ border: '2px solid #E2E8F0' }}
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden mt-4 pb-4 pt-4 space-y-3 max-w-6xl mx-auto"
            style={{ borderTop: '1px solid #E2E8F0' }}>
            {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium py-1" style={{ color: '#64748B' }}>
                {l}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login"
                className="flex-1 text-center py-2.5 text-sm font-semibold rounded-full"
                style={{ border: '2px solid #E2E8F0', color: '#1E293B' }}>
                Sign In
              </Link>
              <Link href="/signup"
                className="flex-1 text-center py-2.5 text-sm font-black text-white rounded-full"
                style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
                Start Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Colour blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'rgba(139,92,246,0.12)', filter: 'blur(60px)' }} />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(244,114,182,0.10)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(251,191,36,0.10)', filter: 'blur(50px)' }} />

        {/* ──── THIS IS THE KEY FIX ────
             lg:flex-row ensures text is LEFT, dashboard is RIGHT on desktop.
             flex-col-reverse on mobile puts dashboard ABOVE text on mobile
             (common pattern). On desktop it is always left → right. ──── */}
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24
          flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── LEFT — Text content ── */}
          <div className={`flex-1 min-w-0 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-black"
              style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered · Adaptive · Smart
            </div>

            <h1 className="font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B', fontSize: 'clamp(36px, 5vw, 58px)' }}>
              The ERP
              <br />
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                That Adapts To You
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#64748B' }}>
              Import your data from anywhere. No templates. No forced formats.
              No data loss. Samyojak{' '}
              <strong style={{ color: '#1E293B' }}>adapts to your business</strong>
              {' '}— not the other way around.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/signup"
                className="group flex items-center justify-center gap-2 px-7 py-4 text-base font-black text-white rounded-full transition-all hover:-translate-y-0.5 active:translate-y-0.5"
                style={{
                  background: '#8B5CF6', border: '2px solid #1E293B',
                  boxShadow: '4px 4px 0px #1E293B', fontFamily: 'Outfit, sans-serif',
                }}>
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact"
                className="flex items-center justify-center gap-2 px-7 py-4 text-base font-bold rounded-full transition-all hover:-translate-y-0.5"
                style={{ border: '2px solid #1E293B', color: '#1E293B', background: 'transparent' }}>
                Book a Demo
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium" style={{ color: '#64748B' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" style={{ color: '#34D399' }} />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" style={{ color: '#FBBF24' }} />
                Setup in 5 Minutes
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" style={{ color: '#8B5CF6' }} />
                Made in India 🇮🇳
              </div>
            </div>
          </div>

          {/* ── RIGHT — Dashboard mockup ── */}
          {/* order-first on mobile pushes it above text.
              lg:order-last keeps it on the RIGHT on desktop. */}
          <div className="flex-1 min-w-0 w-full order-first lg:order-last"
            style={{ perspective: '1800px' }}>
            <div className="relative">
              {/* Glow behind mockup */}
              <div className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(244,114,182,0.15))', filter: 'blur(24px)' }} />

              {/* The actual dashboard card */}
              <div className="relative rounded-2xl overflow-hidden"
                style={{
                  border: '2px solid #1E293B',
                  boxShadow: '8px 8px 0px #1E293B',
                  transform: 'rotateY(-4deg) rotateX(2deg)',
                  transition: 'transform 0.5s ease',
                }}>

                {/* Inner flex: sidebar + main */}
                <div className="flex" style={{ background: '#F8FAFC' }}>

                  {/* Sidebar */}
                  <div className="hidden sm:flex w-44 shrink-0 flex-col px-3 py-4"
                    style={{ background: '#0F172A' }}>
                    <div className="flex items-center gap-2 px-2 mb-5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
                        style={{ background: '#8B5CF6', fontFamily: 'Outfit, sans-serif' }}>S</div>
                      <span className="font-black text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Samyojak</span>
                    </div>

                    <nav className="flex flex-1 flex-col gap-0.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard',   active: true  },
                        { icon: Contact,         label: 'CRM'                        },
                        { icon: FileCheck,       label: 'Quotations'                 },
                        { icon: Receipt,         label: 'Invoices'                   },
                        { icon: Boxes,           label: 'Inventory'                  },
                        { icon: Users,           label: 'HR & Payroll'               },
                        { icon: UserPlus,        label: 'Recruiting'                 },
                        { icon: FolderKanban,    label: 'Projects'                   },
                        { icon: BarChart3,       label: 'BI Dashboard'               },
                        { icon: Bot,             label: 'AI Assistant'               },
                        { icon: Settings,        label: 'Settings'                   },
                      ].map(({ icon: Icon, label, active }) => (
                        <div key={label}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                          style={{
                            background: active ? '#8B5CF6' : 'transparent',
                            color: active ? 'white' : '#94A3B8',
                          }}>
                          <Icon className="h-3 w-3 flex-shrink-0" />
                          {label}
                        </div>
                      ))}
                    </nav>

                    <div className="mt-3 rounded-xl p-3 text-white"
                      style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
                      <div className="text-[10px] opacity-70">Current Plan</div>
                      <div className="font-black text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Business</div>
                      <div className="mt-2 rounded-lg py-1.5 text-center text-[11px] font-semibold"
                        style={{ background: 'rgba(255,255,255,0.15)' }}>
                        Upgrade Plan
                      </div>
                    </div>
                  </div>

                  {/* Main panel */}
                  <div className="flex-1 p-4" style={{ background: '#F8FAFC' }}>
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-bold text-sm" style={{ color: '#1E293B' }}>Welcome back, Omkar 👋</div>
                        <div className="text-[11px]" style={{ color: '#64748B' }}>Here&apos;s your business today</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2" style={{ color: '#94A3B8' }}>
                        <Search className="h-3.5 w-3.5" />
                        <Bell className="h-3.5 w-3.5" />
                        <div className="w-6 h-6 rounded-full"
                          style={{ background: 'linear-gradient(135deg, #8B5CF6, #F472B6)' }} />
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { label: 'Leads',    value: '248',   change: '+12%', color: '#8B5CF6', bg: '#EDE9FE' },
                        { label: 'Invoices', value: '189',   change: '+8%',  color: '#F472B6', bg: '#FCE7F3' },
                        { label: 'Products', value: '91',    change: '+5%',  color: '#FBBF24', bg: '#FEF3C7' },
                        { label: 'Revenue',  value: '₹4.6L', change: '+15%', color: '#34D399', bg: '#D1FAE5' },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl p-3"
                          style={{ background: 'white', border: '1.5px solid #E2E8F0', boxShadow: '3px 3px 0px #E2E8F0' }}>
                          <div className="w-5 h-5 rounded-lg mb-1.5" style={{ background: s.bg, border: `1.5px solid ${s.color}` }} />
                          <div className="text-[10px] font-semibold" style={{ color: '#64748B' }}>{s.label}</div>
                          <div className="font-black text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>{s.value}</div>
                          <div className="text-[10px] font-bold" style={{ color: '#34D399' }}>↑ {s.change}</div>
                        </div>
                      ))}
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Bar chart */}
                      <div className="rounded-xl p-3"
                        style={{ background: 'white', border: '1.5px solid #E2E8F0', boxShadow: '3px 3px 0px #E2E8F0' }}>
                        <div className="text-[11px] font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                          Revenue
                        </div>
                        <div className="flex items-end gap-1 h-12">
                          {[30, 45, 40, 55, 50, 70, 85].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t-sm"
                              style={{ height: `${h}%`, background: i === 6 ? '#8B5CF6' : '#EDE9FE' }} />
                          ))}
                        </div>
                      </div>
                      {/* Pipeline */}
                      <div className="rounded-xl p-3"
                        style={{ background: 'white', border: '1.5px solid #E2E8F0', boxShadow: '3px 3px 0px #E2E8F0' }}>
                        <div className="text-[11px] font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                          Pipeline
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { w: '90%', c: '#8B5CF6' },
                            { w: '70%', c: '#F472B6' },
                            { w: '50%', c: '#FBBF24' },
                            { w: '30%', c: '#34D399' },
                          ].map((row, i) => (
                            <div key={i} className="h-2.5 rounded-full" style={{ background: '#F1F5F9' }}>
                              <div className="h-2.5 rounded-full transition-all" style={{ width: row.w, background: row.c }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating accent chips */}
              <div className="absolute -left-5 top-8 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #1E293B' }}>
                <Gauge className="h-4 w-4" style={{ color: '#34D399' }} />
                <span className="text-xs font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                  99.9% Uptime
                </span>
              </div>

              <div className="absolute -bottom-4 -right-3 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #1E293B' }}>
                <RefreshCcw className="h-4 w-4" style={{ color: '#8B5CF6' }} />
                <span className="text-xs font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                  Zero Data Loss
                </span>
              </div>

              {/* Decorative shapes */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full hidden sm:block"
                style={{ background: '#FBBF24', border: '2px solid #1E293B' }} />
              <div className="absolute -bottom-6 left-8 w-8 h-8 rounded-full hidden sm:block"
                style={{ background: '#F472B6', border: '2px solid #1E293B' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-4"
        style={{ background: '#8B5CF6', borderTop: '2px solid #1E293B', borderBottom: '2px solid #1E293B' }}>
        <div className="flex gap-8 whitespace-nowrap"
          style={{ animation: 'marquee 28s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-white font-black text-sm flex-shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* ── 12 MODULES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-black"
            style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
            <Sparkles className="h-3.5 w-3.5" /> 12 Modules — One Platform
          </div>
          <h2 className="font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B', fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Everything your business needs
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#64748B' }}>
            From CRM to AI — every tool in one workspace. No switching tabs. No disconnected tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map(m => (
            <div key={m.label}
              className="group rounded-2xl p-6 transition-all duration-300 cursor-pointer"
              style={{
                background: 'white',
                border: '2px solid #1E293B',
                boxShadow: '6px 6px 0px #E2E8F0',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translate(-3px, -3px)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '9px 9px 0px #E2E8F0'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translate(0, 0)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px #E2E8F0'
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                <m.icon className="h-5 w-5" style={{ color: m.color }} />
              </div>
              <h3 className="font-black text-base mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                {m.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADAPTIVE IMPORT — dark section ── */}
      <section className="py-20" style={{ background: '#1E293B' }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-black"
            style={{ background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.4)', color: '#C4B5FD' }}>
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
              <div key={s} className="rounded-xl py-3 px-4 text-sm font-semibold"
                style={{ border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1' }}>
                {s}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: RefreshCcw,  title: 'Zero Field Mapping', desc: 'Upload exactly as-is. No column renaming ever.', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
              { icon: ShieldCheck, title: 'Zero Data Loss',      desc: 'Every row. Every column. 100% preserved.',       color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
              { icon: Zap,         title: 'Instant Ready',       desc: 'Import complete. Your ERP is live in 2 minutes.', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-5 text-left"
                style={{ border: '2px solid rgba(255,255,255,0.1)', background: f.bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: `2px solid ${f.color}` }}>
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
          <h2 className="font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B', fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Samyojak vs Legacy ERP
          </h2>
          <p style={{ color: '#64748B' }}>Why growing businesses are switching</p>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ border: '2px solid #1E293B', boxShadow: '6px 6px 0px #E2E8F0' }}>
          <div className="grid grid-cols-3" style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
            <div className="p-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Feature</div>
            <div className="p-4 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-black text-white"
                style={{ background: '#8B5CF6', border: '2px solid #1E293B' }}>
                Samyojak
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#F1F5F9', color: '#64748B', border: '2px solid #E2E8F0' }}>
                Legacy ERP A/B
              </span>
            </div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className="grid grid-cols-3 transition-colors hover:bg-violet-50/30"
              style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <div className="p-4 text-sm font-medium" style={{ color: '#64748B' }}>{row.feature}</div>
              <div className="p-4 text-center text-sm font-bold" style={{ color: '#34D399' }}>✅ {row.samyojak}</div>
              <div className="p-4 text-center text-sm" style={{ color: '#94A3B8' }}>❌ {row.others}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20" style={{ background: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B', fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Simple pricing. No surprises.
            </h2>
            <p className="mb-6" style={{ color: '#64748B' }}>No per-user fees. No annual lock-in. Cancel anytime.</p>

            {/* Billing toggle */}
            <div className="inline-flex p-1 rounded-full mb-4"
              style={{ background: '#E2E8F0' }}>
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

            <div className="text-xs" style={{ color: '#94A3B8' }}>
              {region === 'india' ? '🇮🇳 India pricing detected' :
               region === 'western' ? '🌎 Western pricing detected' :
               '🌍 Global pricing detected'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PLANS.map(plan => (
              <div key={plan.key}
                className="rounded-2xl p-6 flex flex-col relative"
                style={{
                  background: plan.popular ? plan.color : 'white',
                  border: '2px solid #1E293B',
                  boxShadow: plan.popular ? `6px 6px 0px ${plan.color}66` : '6px 6px 0px #E2E8F0',
                  transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap"
                    style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className="text-2xl mb-2">{plan.emoji}</div>
                <h3 className="font-black text-base mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif', color: plan.popular ? 'white' : '#1E293B' }}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="font-black text-3xl"
                    style={{ fontFamily: 'Outfit, sans-serif', color: plan.popular ? 'white' : '#1E293B' }}>
                    {prices[plan.key]}
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
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                        style={{ color: plan.popular ? 'white' : '#34D399' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/signup"
                  className="block w-full py-3 rounded-full text-sm font-black text-center transition-all hover:opacity-90"
                  style={{
                    background: plan.popular ? 'white' : '#1E293B',
                    color: plan.popular ? plan.color : 'white',
                    border: '2px solid #1E293B',
                  }}>
                  Start Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="font-black text-center mb-10"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B', fontSize: 'clamp(28px, 4vw, 40px)' }}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid #E2E8F0', background: 'white' }}>
              <button className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-bold text-sm pr-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
                  {faq.q}
                </span>
                {openFaq === i
                  ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                  : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: '#94A3B8' }} />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid #F1F5F9' }}>
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
          <h2 className="font-black text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(32px, 5vw, 48px)' }}>
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
            <Link href="/signup"
              className="group flex items-center gap-2 px-8 py-4 text-base font-black text-white rounded-full transition-all hover:-translate-y-0.5"
              style={{
                background: '#8B5CF6', border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '4px 4px 0px rgba(139,92,246,0.5)', fontFamily: 'Outfit, sans-serif',
              }}>
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/contact"
              className="flex items-center gap-2 px-8 py-4 text-base font-bold rounded-full transition-all hover:bg-white/10"
              style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
              Talk to Us
            </Link>
          </div>
          <p className="text-xs mt-6" style={{ color: '#475569' }}>
            No credit card required · No field mapping · No data loss
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ background: '#0F172A', borderTop: '2px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                  style={{ background: '#8B5CF6', fontFamily: 'Outfit, sans-serif' }}>S</div>
                <span className="font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Samyojak</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                The ERP that adapts to you. Not the other way around.
              </p>
              <p className="text-xs mt-3" style={{ color: '#334155' }}>MSME Registered · Pune, India 🇮🇳</p>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Product</p>
              {[['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 transition-colors hover:text-violet-400" style={{ color: '#475569' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Company</p>
              {[['About Us', '/about'], ['Contact', '/contact'], ['Support', '/support']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 transition-colors hover:text-violet-400" style={{ color: '#475569' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Legal</p>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-xs mb-2 transition-colors hover:text-violet-400" style={{ color: '#475569' }}>{l}</Link>
              ))}
              <div className="mt-4">
                <p className="text-xs mb-1" style={{ color: '#475569' }}>Support email</p>
                <a href="mailto:hello.samyojak@gmail.com"
                  className="text-xs transition-colors hover:text-violet-300"
                  style={{ color: '#8B5CF6' }}>
                  hello.samyojak@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs" style={{ color: '#334155' }}>
              © 2025 Samyojak. All rights reserved. MSME Registered India.
            </p>
            <p className="text-xs" style={{ color: '#334155' }}>🌍 Built for the world · Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ── */}
      <style jsx global>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>

    </div>
  )
}
