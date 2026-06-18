'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, Brain, Users, FileText, Package, UserCheck,
  FolderOpen, BarChart3, Globe, Zap, ChevronDown, ChevronUp,
  Building2, Stethoscope, ShoppingBag, Factory,
  GraduationCap, Truck, Code, UtensilsCrossed,
} from 'lucide-react'

const FEATURES = [
  { icon: Users, title: 'AI-Powered CRM', desc: 'Smart lead scoring, follow-up reminders, pipeline tracking', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: FileText, title: 'Universal Tax Invoicing', desc: 'GST, VAT, HST, Sales Tax — 15+ countries in one click', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Package, title: 'Inventory + Free QR Codes', desc: 'Stock tracking with auto-generated QR codes, low stock alerts', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: UserCheck, title: 'HR & Payroll', desc: 'Employee management, salary tracking, leave balance', color: '#34D399', bg: '#D1FAE5' },
  { icon: FolderOpen, title: 'Project Management', desc: 'Kanban board, deadlines, progress tracking, client projects', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: BarChart3, title: 'Tax Reports', desc: 'GSTR-1 format, monthly summaries, revenue analytics', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Brain, title: 'AI Business Intelligence', desc: 'Ask AI anything about your business. Get real answers from your live data.', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: Globe, title: 'WhatsApp Invoicing', desc: 'Send invoices directly via WhatsApp with one click', color: '#34D399', bg: '#D1FAE5' },
]

const BUSINESS_TYPES = [
  { icon: ShoppingBag, name: 'Retail & Trading', desc: 'Inventory, invoicing, customer tracking', color: '#8B5CF6' },
  { icon: Factory, name: 'Manufacturing', desc: 'Production, stock, supplier management', color: '#F472B6' },
  { icon: Stethoscope, name: 'Healthcare & Clinics', desc: 'Patients, appointments, billing', color: '#34D399' },
  { icon: GraduationCap, name: 'Schools & Training', desc: 'Students, fees, staff management', color: '#FBBF24' },
  { icon: Building2, name: 'Agencies & Consultants', desc: 'Clients, projects, invoices, team', color: '#8B5CF6' },
  { icon: Truck, name: 'Logistics & Delivery', desc: 'Fleet, shipments, tracking, billing', color: '#F472B6' },
  { icon: UtensilsCrossed, name: 'Restaurants & Food', desc: 'Orders, inventory, staff, billing', color: '#34D399' },
  { icon: Code, name: 'SaaS & Tech', desc: 'Leads, subscriptions, projects, team', color: '#FBBF24' },
]

const FAQS = [
  { q: 'Does Samyojak work for my type of business?', a: 'Yes. Samyojak adapts to your business — not the other way around. Whether you run a clinic, retail shop, agency, school, or manufacturing unit, Samyojak works with your existing data format.' },
  { q: 'Can I import my data from any existing ERP or spreadsheet?', a: 'Yes. Upload any CSV file from any ERP system. Samyojak reads your column names as-is and stores everything without forcing you to rename or restructure your data.' },
  { q: 'Does it support GST, VAT, and other taxes?', a: 'Yes. Universal tax engine supports GST for India, VAT for UK, Germany, UAE, HST for Canada, Sales Tax for US, and 10+ more countries. Switch between them per invoice.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Weekly plans expire at the end of the week if you turn off auto-pay. No cancellation fees. No lock-in ever.' },
  { q: 'Do you charge per user?', a: 'No. All plans are flat-rate. One price for your whole team regardless of how many people use it.' },
  { q: 'Does the AI actually read my real data?', a: 'Yes. The AI assistant on the Complete plan reads your live leads, invoices, inventory, HR, and projects in real time before every response. It knows your actual numbers.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit. Authentication is handled by Supabase — enterprise grade security. Your data is stored in Airtable and never shared.' },
]

function detectRegion() {
  if (typeof window === 'undefined') return 'global'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'india'
  if (tz.includes('America') || tz.includes('Europe') || tz.includes('Australia')) return 'western'
  return 'global'
}

const PRICING: Record<string, { weekly: string; monthly: string; yearly: string; note: string }> = {
  india: { weekly: '$4.99', monthly: '$15', yearly: '$144', note: 'India pricing' },
  global: { weekly: '$6.99', monthly: '$21', yearly: '$199', note: 'Global pricing' },
  western: { weekly: '$9.99', monthly: '$29', yearly: '$279', note: 'Western pricing' },
}

export default function Home() {
  const [billing, setBilling] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  const [region, setRegion] = useState<'india' | 'global' | 'western'>('global')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setRegion(detectRegion() as any)
    setMounted(true)
  }, [])

  const price = PRICING[region]

  const PLANS = [
    {
      name: 'CRM Starter', emoji: '🚀', price: price.weekly, period: 'wk', bonus: '+1 week free', popular: false,
      features: ['CRM with AI lead scoring', 'Contact management', 'Follow-up reminders', 'Import & Export CSV', 'Support tickets', 'Mobile-friendly'],
      locked: ['Invoices', 'Inventory', 'HR', 'Projects', 'AI Assistant'],
    },
    {
      name: 'ERP Basic', emoji: '⚡', price: price.monthly, period: 'mo', bonus: '+1 week free', popular: true,
      features: ['Everything in CRM Starter', 'Universal tax invoicing', 'Inventory + free QR codes', 'WhatsApp invoice sending', 'GST Reports'],
      locked: ['HR & Payroll', 'Projects', 'AI Assistant'],
    },
    {
      name: 'Business', emoji: '🏢', price: price.monthly, period: 'mo', bonus: '+1 month free', popular: false,
      features: ['Everything in ERP Basic', 'HR & Payroll management', 'Project management Kanban', 'Team management', 'Advanced reports'],
      locked: ['AI Assistant'],
    },
    {
      name: 'Complete ERP', emoji: '👑', price: price.yearly, period: 'yr', bonus: '+3 months free', popular: false,
      features: ['Everything in Business', 'AI Business Intelligence', 'AI reads your live data', 'Priority support', 'White label available', 'All future features'],
      locked: [],
    },
  ]

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
            <Link href="/features" className="text-sm font-medium hover:text-violet-600 transition-colors" style={{ color: '#64748B' }}>Features</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-violet-600 transition-colors" style={{ color: '#64748B' }}>Pricing</Link>
            <Link href="/about" className="text-sm font-medium hover:text-violet-600 transition-colors" style={{ color: '#64748B' }}>About</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-violet-600 transition-colors" style={{ color: '#64748B' }}>Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="outline-btn px-4 py-2 text-sm hidden md:block">Sign In</Link>
            {/* START TRIAL — no "Start Free" or "No card needed" */}
            <Link href="/signup" className="candy-btn px-4 py-2 text-sm">Start Trial</Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO — STUNNING PROFESSIONAL WITH ANIMATIONS
          ═══════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-28 overflow-hidden" style={{ background: '#0A0E1A' }}>

        {/* Animated background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Eyebrow badge */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 text-sm font-semibold transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1.5px solid rgba(139,92,246,0.5)',
              color: '#C4B5FD',
              transitionDelay: '100ms',
            }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            AI-Powered · Universal · Adaptive ERP
          </div>

          {/* Main headline */}
          <h1
            className={`font-black leading-none mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{
              fontFamily: 'Outfit',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              transitionDelay: '200ms',
            }}>
            <span style={{ color: 'white' }}>The ERP that </span>
            <span style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #F472B6 50%, #FBBF24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              adapts to you
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ color: '#94A3B8', lineHeight: 1.6, transitionDelay: '300ms' }}>
            One platform for CRM, invoicing, inventory, HR, projects, and AI intelligence.
            Works for every business. Ready in 5 minutes.
          </p>

          {/* CTA — Start Trial only, no Demo */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-14 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '400ms' }}>
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full font-black text-lg transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: 'white',
                boxShadow: '0 0 40px rgba(139,92,246,0.4)',
                fontFamily: 'Outfit',
              }}>
              Start Trial <ArrowRight size={22} />
            </Link>
          </div>

          {/* Trust signals */}
          <div
            className={`flex flex-wrap gap-6 justify-center text-sm transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            style={{ color: '#475569', transitionDelay: '500ms' }}>
            {[
              '✦ Weekly plans from $4.99',
              '✦ Cancel anytime',
              '✦ Works for any business',
              '✦ Powered by Vercel',
            ].map(f => <span key={f}>{f}</span>)}
          </div>

          {/* Floating module cards — decorative */}
          <div
            className={`mt-16 relative transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '600ms' }}>

            {/* Dashboard preview — decorative UI showcase */}
            <div className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid rgba(139,92,246,0.3)', boxShadow: '0 0 80px rgba(139,92,246,0.15)' }}>

              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FBBF24' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ background: '#34D399' }}></div>
                </div>
                <div className="flex-1 mx-4 px-4 py-1 rounded-full text-xs text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>
                  samyojak.vercel.app/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6" style={{ background: '#0F172A' }}>

                {/* Top stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Leads', value: '48', color: '#8B5CF6', bg: '#EDE9FE' },
                    { label: 'Invoices', value: '23', color: '#F472B6', bg: '#FCE7F3' },
                    { label: 'Products', value: '156', color: '#FBBF24', bg: '#FEF3C7' },
                    { label: 'Projects', value: '12', color: '#34D399', bg: '#D1FAE5' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl"
                      style={{ background: '#1E293B', border: `1px solid ${s.color}30` }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center mb-2"
                        style={{ background: s.color + '20' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                      </div>
                      <p className="text-xs" style={{ color: '#64748B' }}>{s.label}</p>
                      <p className="text-lg font-black text-white" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* AI Card preview */}
                <div className="p-4 rounded-xl mb-4" style={{ background: '#1E293B', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#8B5CF6' }}>
                      <Brain size={10} className="text-white" />
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#C4B5FD' }}>Samyojak AI</span>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-green-400">Live</span>
                    </div>
                  </div>
                  <p className="text-xs text-left" style={{ color: '#8B5CF6' }}>
                    💡 You have 8 hot leads this week. Al-Rashid Trading is your biggest opportunity at ₹3,00,000. Follow up today.
                  </p>
                </div>

                {/* Mini table preview */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="grid grid-cols-4 px-4 py-2"
                    style={{ background: '#1a2740', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Name', 'Status', 'Value', 'Score'].map(h => (
                      <span key={h} className="text-xs font-semibold uppercase" style={{ color: '#475569' }}>{h}</span>
                    ))}
                  </div>
                  {[
                    { name: 'Rahul Sharma', status: 'Contacted', value: '₹85K', score: '92', scoreColor: '#34D399' },
                    { name: 'James Wilson', status: 'New', value: '$1,800', score: '74', scoreColor: '#FBBF24' },
                    { name: 'Priya Mehta', status: 'Converted', value: '₹45K', score: '88', scoreColor: '#34D399' },
                  ].map(row => (
                    <div key={row.name} className="grid grid-cols-4 px-4 py-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="text-xs text-white font-medium truncate">{row.name}</span>
                      <span className="text-xs" style={{ color: '#64748B' }}>{row.status}</span>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>{row.value}</span>
                      <span className="text-xs font-bold" style={{ color: row.scoreColor }}>{row.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gradient fade at bottom of dashboard preview */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(transparent, #0A0E1A)' }} />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden py-4" style={{ background: '#1E293B' }}>
        <div className="flex gap-8 marquee-track whitespace-nowrap">
          {[...Array(3)].map((_, i) =>
            ['CRM', 'Invoicing', 'Inventory + QR', 'HR & Payroll', 'Projects', 'AI Assistant', 'GST Reports', 'WhatsApp Send', 'Universal Tax', 'Import Any CSV'].map(f => (
              <span key={`${i}-${f}`} className="text-white/70 text-sm font-medium px-4">⚡ {f}</span>
            ))
          )}
        </div>
      </div>

      {/* UNIVERSAL ERP VISION */}
      <section className="px-6 py-24" style={{ background: '#0F172A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1.5px solid rgba(139,92,246,0.5)', color: '#C4B5FD' }}>
              <Zap size={14} /> Universal Adaptive ERP
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white" style={{ fontFamily: 'Outfit' }}>
              One ERP for{' '}
              <span style={{ color: '#8B5CF6' }}>every business on the planet</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
              Traditional ERP forces you to adapt to their structure. Samyojak flips this — our AI understands your business type and organizes your data the way you already think about it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="p-8 rounded-2xl" style={{ background: '#1E293B', border: '2px solid #334155' }}>
              <div className="text-3xl mb-4">😩</div>
              <h3 className="text-xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>Legacy ERP Software</h3>
              <ul className="space-y-3">
                {['Forces you to rename all your columns', 'Weeks or months of setup and configuration', 'Separate modules built for specific industries', 'Expensive consultants required to migrate data', 'Your team has to unlearn and relearn everything', 'Rigid structure that does not fit your workflow'].map(p => (
                  <li key={p} className="flex items-start gap-3 text-sm" style={{ color: '#94A3B8' }}>
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-2xl"
              style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid #8B5CF6', boxShadow: '8px 8px 0px rgba(139,92,246,0.3)' }}>
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>Samyojak Adaptive ERP</h3>
              <ul className="space-y-3">
                {['Import any CSV — your column names stay exactly as-is', 'Ready in 5 minutes from the moment you sign up', 'AI adapts to your business type automatically', 'Data migration in one upload — no consultants needed', 'Familiar structure — zero learning curve for your team', 'Flexible fields that match how you already work'].map(p => (
                  <li key={p} className="flex items-start gap-3 text-sm" style={{ color: '#C4B5FD' }}>
                    <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-black text-white text-center mb-8" style={{ fontFamily: 'Outfit' }}>
            Works for every type of business
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {BUSINESS_TYPES.map(biz => (
              <div key={biz.name} className="p-5 rounded-2xl text-center hover:scale-105 transition-transform"
                style={{ background: '#1E293B', border: `2px solid ${biz.color}40` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: biz.color + '20', border: `1.5px solid ${biz.color}` }}>
                  <biz.icon size={22} style={{ color: biz.color }} />
                </div>
                <p className="font-black text-white text-sm mb-1" style={{ fontFamily: 'Outfit' }}>{biz.name}</p>
                <p className="text-xs" style={{ color: '#64748B' }}>{biz.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-2xl text-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '2px solid rgba(139,92,246,0.3)' }}>
            <Brain size={40} className="mx-auto mb-4" style={{ color: '#8B5CF6' }} />
            <h3 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>Our Vision</h3>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: '#C4B5FD' }}>
              We are building the world's first truly universal ERP — one that intelligently generates the right structure, fields, and workflows for any business automatically. A school gets student management. A hospital gets patient records. A manufacturer gets production tracking. All without configuration.
            </p>
            <p className="mt-4 text-sm font-bold" style={{ color: '#8B5CF6' }}>
              The ERP that adapts to you. Not the other way around.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Everything your business needs
            </h2>
            <p className="text-lg" style={{ color: '#64748B' }}>Six powerful modules unified in one workspace</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title}
                className="p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1"
                style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg, border: `2px solid ${f.color}` }}>
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <h3 className="font-black text-base mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{f.title}</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24" style={{ background: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Simple pricing. Big value.
            </h2>
            <p className="text-lg mb-6" style={{ color: '#64748B' }}>No annual lock-in. No per-user fees. Cancel anytime.</p>
            <div className="inline-flex p-1 rounded-full" style={{ background: '#E2E8F0' }}>
              {(['weekly', 'monthly', 'yearly'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className="px-5 py-2 rounded-full text-sm font-bold capitalize transition-all"
                  style={{ background: billing === b ? '#1E293B' : 'transparent', color: billing === b ? 'white' : '#64748B' }}>
                  {b}{b === 'yearly' && <span style={{ color: '#FBBF24' }}> -20%</span>}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                {price.note} — detected automatically 🌍
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name} className="relative p-6 rounded-2xl"
                style={{
                  background: plan.popular ? '#8B5CF6' : 'white',
                  border: '2px solid #1E293B',
                  boxShadow: plan.popular ? '8px 8px 0px #FBBF24' : '6px 6px 0px #E2E8F0',
                  transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap"
                    style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className="text-3xl mb-3">{plan.emoji}</div>
                <h3 className="font-black text-lg mb-2"
                  style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                  {plan.name}
                </h3>
                <div className="mb-3">
                  <span className="text-4xl font-black"
                    style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm ml-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                    /{plan.period}
                  </span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{ background: plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5', color: plan.popular ? 'white' : '#065F46' }}>
                  🎁 {plan.bonus}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs"
                      style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: plan.popular ? 'white' : '#34D399' }} />
                      {f}
                    </li>
                  ))}
                  {plan.locked.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs opacity-40"
                      style={{ color: plan.popular ? 'white' : '#94A3B8' }}>
                      <span className="flex-shrink-0">🔒</span>{f}
                    </li>
                  ))}
                </ul>
                {/* START TRIAL — not Start Free */}
                <Link href="/signup"
                  className="block w-full py-3 rounded-full text-sm font-bold text-center transition-all hover:opacity-90"
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

      {/* COMPARISON */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Why businesses choose Samyojak
            </h2>
            <p style={{ color: '#64748B' }}>See how we compare to legacy ERP platforms</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #1E293B' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#1E293B' }}>
                  <th className="p-4 text-left text-sm font-bold text-white">Feature</th>
                  <th className="p-4 text-center text-sm font-bold" style={{ color: '#8B5CF6' }}>Samyojak</th>
                  <th className="p-4 text-center text-sm font-bold text-white/60">Legacy ERP A</th>
                  <th className="p-4 text-center text-sm font-bold text-white/60">Legacy ERP B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Setup time', '5 minutes', '2-4 weeks', '1-3 months'],
                  ['Import any CSV format', '✅ Yes', '❌ Strict format only', '❌ Strict format only'],
                  ['Weekly billing option', '✅ Yes', '❌ No', '❌ No'],
                  ['Free QR codes', '✅ Included free', '❌ Paid add-on', '❌ Not available'],
                  ['WhatsApp invoicing', '✅ Built-in', '❌ No', '❌ No'],
                  ['AI on live data', '✅ Real-time insights', '⚠️ Basic analytics', '❌ Not available'],
                  ['India & global pricing', '✅ Geo-optimized', '⚠️ USD only', '⚠️ USD only'],
                  ['Universal tax (15+ countries)', '✅ One click', '⚠️ Complex setup', '⚠️ Per-country config'],
                  ['Starting price', '$4.99/week', '$14+/month/user', '$10+/month/user'],
                ].map(([feature, us, a, b]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-700">{feature}</td>
                    <td className="p-4 text-center text-sm font-bold" style={{ color: '#8B5CF6' }}>{us}</td>
                    <td className="p-4 text-center text-sm text-gray-500">{a}</td>
                    <td className="p-4 text-center text-sm text-gray-500">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="px-6 py-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-wide mb-8" style={{ color: '#94A3B8' }}>
            Built on enterprise-grade infrastructure
          </p>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            {[
              { name: '▲ Vercel', desc: 'Hosting & Edge Network' },
              { name: '⚡ Supabase', desc: 'Auth & Security' },
              { name: '🤖 Groq AI', desc: 'AI Intelligence' },
              { name: '📊 Airtable', desc: 'Data Backend' },
              { name: '💳 Dodo Payments', desc: 'Global Payments' },
            ].map(item => (
              <div key={item.name} className="text-center">
                <p className="font-black text-gray-900 text-sm" style={{ fontFamily: 'Outfit' }}>{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — Free trial question REMOVED */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
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

      {/* CTA — No demo button */}
      <section className="px-6 py-24 text-center" style={{ background: '#1E293B' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6 float">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
            Your business deserves an ERP
            <br />
            <span style={{ color: '#8B5CF6' }}>that understands it</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: '#94A3B8' }}>
            Join businesses globally who chose simplicity over complexity.
            Set up in 5 minutes. Cancel anytime.
          </p>
          <Link href="/signup"
            className="candy-btn px-12 py-5 text-xl inline-flex items-center gap-2">
            Start Trial <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12" style={{ background: '#0A1628', borderTop: '2px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                  style={{ background: '#8B5CF6' }}>S</div>
                <span className="font-black text-white" style={{ fontFamily: 'Outfit' }}>Samyojak</span>
              </div>
              <p className="text-xs mb-3" style={{ color: '#64748B' }}>
                The universal ERP that adapts to your business. Not the other way around.
              </p>
              {/* MADE FOR THE WORLD */}
              <p className="text-xs font-medium" style={{ color: '#475569' }}>🌍 Made for the world</p>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Product</p>
              <Link href="/features" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Features</Link>
              <Link href="/pricing" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Pricing</Link>
              <Link href="/referral" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Referral Program</Link>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Company</p>
              <Link href="/about" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>About Us</Link>
              <Link href="/contact" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Contact</Link>
              <Link href="/support" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Support</Link>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Legal</p>
              <Link href="/privacy" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Privacy Policy</Link>
              <Link href="/terms" className="block text-xs mb-2 hover:text-white transition-colors" style={{ color: '#64748B' }}>Terms of Service</Link>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-8 flex-wrap gap-4"
            style={{ borderColor: '#1E293B' }}>
            <p className="text-xs" style={{ color: '#334155' }}>© 2026 Samyojak. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#334155' }}>Powered by</span>
              <span className="text-xs font-black text-white">▲ Vercel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
