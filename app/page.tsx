'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, Brain, Users, FileText, Package, UserCheck,
  FolderOpen, BarChart3, Globe, Zap, ChevronDown, ChevronUp,
  Building2, Stethoscope, ShoppingBag, Factory,
  GraduationCap, Truck, Code, UtensilsCrossed, Menu, X,
  Scissors, Home, Briefcase, Car, Dumbbell, Camera,
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
  { icon: Scissors, name: 'Salons & Spas', desc: 'Appointments, staff, inventory, billing', color: '#8B5CF6' },
  { icon: Home, name: 'Real Estate', desc: 'Property leads, client management, invoicing', color: '#F472B6' },
  { icon: Briefcase, name: 'Legal & Accounting', desc: 'Client cases, billing, document tracking', color: '#34D399' },
  { icon: Car, name: 'Automotive Services', desc: 'Service records, inventory, customer follow-ups', color: '#FBBF24' },
  { icon: Dumbbell, name: 'Gyms & Fitness', desc: 'Member management, billing, staff scheduling', color: '#8B5CF6' },
  { icon: Camera, name: 'Event & Media', desc: 'Client bookings, project tracking, invoicing', color: '#F472B6' },
]

const FAQS = [
  { q: 'Does Samyojak work for my type of business?', a: 'Yes. Samyojak adapts to your business — not the other way around. Whether you run a clinic, retail shop, agency, school, salon, or manufacturing unit, Samyojak works with your existing data format.' },
  { q: 'Can I import my data from any existing ERP or spreadsheet?', a: 'Yes. Upload any CSV file from any ERP system. Samyojak reads your column names as-is and stores everything without forcing you to rename or restructure your data.' },
  { q: 'Does it support GST, VAT, and other taxes?', a: 'Yes. Universal tax engine supports GST for India, VAT for UK, Germany, UAE, HST for Canada, Sales Tax for US, and 10+ more countries. Switch between them per invoice.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Weekly plans expire at the end of the week if you turn off auto-pay. No cancellation fees. No lock-in ever.' },
  { q: 'Do you charge per user?', a: 'No. All plans are flat-rate. One price for your whole team regardless of how many people use it.' },
  { q: 'Does the AI actually read my real data?', a: 'Yes. The AI assistant on the Complete plan reads your live leads, invoices, inventory, HR, and projects in real time before every response. It knows your actual numbers.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit. Authentication is handled by Supabase — enterprise grade security. Your data is stored securely and never shared.' },
]

function detectRegion() {
  if (typeof window === 'undefined') return 'global'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'india'
  if (tz.includes('America') || tz.includes('Europe') || tz.includes('Australia')) return 'western'
  return 'global'
}

// Full pricing matrix — every plan tier × every billing cycle × every region
type BillingCycle = 'weekly' | 'monthly' | 'yearly'
type Region = 'india' | 'global' | 'western'

const PRICING_MATRIX: Record<Region, Record<BillingCycle, { starter: string; basic: string; business: string; complete: string }>> = {
  india: {
    weekly:  { starter: '$4.99', basic: '$9.99',  business: '$14.99', complete: '$19.99' },
    monthly: { starter: '$15',   basic: '$29',    business: '$45',    complete: '$59'    },
    yearly:  { starter: '$144',  basic: '$279',   business: '$432',   complete: '$566'   },
  },
  global: {
    weekly:  { starter: '$6.99', basic: '$12.99', business: '$18.99', complete: '$24.99' },
    monthly: { starter: '$21',   basic: '$39',    business: '$59',    complete: '$79'    },
    yearly:  { starter: '$199',  basic: '$374',   business: '$566',   complete: '$758'   },
  },
  western: {
    weekly:  { starter: '$9.99', basic: '$17.99', business: '$26.99', complete: '$34.99' },
    monthly: { starter: '$29',   basic: '$54',    business: '$81',    complete: '$109'   },
    yearly:  { starter: '$279',  basic: '$518',   business: '$778',   complete: '$1,046' },
  },
}

const REGION_NOTES: Record<Region, string> = {
  india: 'India pricing',
  global: 'Global pricing',
  western: 'Western pricing',
}

const PERIOD_LABEL: Record<BillingCycle, string> = {
  weekly: 'wk',
  monthly: 'mo',
  yearly: 'yr',
}

const BONUS_LABEL: Record<BillingCycle, { label: string; hasTrial: boolean }> = {
  weekly: { label: '+1 week free', hasTrial: false },
  monthly: { label: '14-day free trial', hasTrial: true },
  yearly: { label: '14-day free trial', hasTrial: true },
}

interface PlanDefinition {
  key: 'starter' | 'basic' | 'business' | 'complete'
  name: string
  emoji: string
  popular: boolean
  features: string[]
  locked: string[]
}

const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    key: 'starter',
    name: 'CRM Starter',
    emoji: '🚀',
    popular: false,
    features: ['CRM with AI lead scoring', 'Contact management', 'Follow-up reminders', 'Import & Export CSV', 'Support tickets', 'Mobile-friendly'],
    locked: ['Invoices', 'Inventory', 'HR', 'Projects', 'AI Assistant'],
  },
  {
    key: 'basic',
    name: 'ERP Basic',
    emoji: '⚡',
    popular: true,
    features: ['Everything in CRM Starter', 'Universal tax invoicing', 'Inventory + free QR codes', 'WhatsApp invoice sending', 'GST Reports'],
    locked: ['HR & Payroll', 'Projects', 'AI Assistant'],
  },
  {
    key: 'business',
    name: 'Business',
    emoji: '🏢',
    popular: false,
    features: ['Everything in ERP Basic', 'HR & Payroll management', 'Project management Kanban', 'Team management', 'Advanced reports'],
    locked: ['AI Assistant'],
  },
  {
    key: 'complete',
    name: 'Complete ERP',
    emoji: '👑',
    popular: false,
    features: ['Everything in Business', 'AI Business Intelligence', 'AI reads your live data', 'Priority support', 'White label available', 'All future features'],
    locked: [],
  },
]

export default function Home() {
  const [billing, setBilling] = useState<BillingCycle>('weekly')
  const [region, setRegion] = useState<Region>('global')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    setRegion(detectRegion() as Region)
    setMounted(true)
  }, [])

  const currentPrices = PRICING_MATRIX[region][billing]
  const currentBonus = BONUS_LABEL[billing]
  const currentPeriod = PERIOD_LABEL[billing]

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 px-6 py-4"
        style={{ background: 'rgba(255,253,245,0.97)', backdropFilter: 'blur(12px)', borderBottom: '2px solid #E2E8F0' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              S
            </div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium hover:text-violet-600 transition-colors"
                style={{ color: '#64748B' }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="outline-btn px-4 py-2 text-sm hidden md:block">Sign In</Link>
            <Link href="/signup" className="candy-btn px-4 py-2 text-sm hidden md:block">Start Trial</Link>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              style={{ border: '2px solid #E2E8F0' }}>
              {mobileMenu ? <X size={20} style={{ color: '#1E293B' }} /> : <Menu size={20} style={{ color: '#1E293B' }} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden mt-3 pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-4 px-2">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setMobileMenu(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-violet-50 transition-colors"
                  style={{ color: '#1E293B' }}>
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link href="/login" onClick={() => setMobileMenu(false)}
                  className="flex-1 text-center py-3 rounded-xl text-sm font-bold border-2"
                  style={{ border: '2px solid #1E293B', color: '#1E293B' }}>
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileMenu(false)}
                  className="candy-btn flex-1 text-center py-3 text-sm">
                  Start Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative px-6 py-20 md:py-24 overflow-hidden"
        style={{ background: '#FFFDF5' }}>

        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #8B5CF620 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #EDE9FE 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FCE7F3 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="text-center lg:text-left">
              <div
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'white', border: '2px solid #8B5CF6', color: '#8B5CF6', boxShadow: '3px 3px 0px #8B5CF6', transitionDelay: '100ms' }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                AI-Powered · Universal · Adaptive ERP
              </div>

              <h1
                className={`font-black leading-tight mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ fontFamily: 'Outfit', fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', color: '#1E293B', transitionDelay: '200ms' }}>
                Skip the Setup Hell.
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #F472B6 50%, #FBBF24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Samyojak Doesn't Make You Suffer First.
                </span>
              </h1>

              <p
                className={`text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ color: '#64748B', lineHeight: 1.6, transitionDelay: '300ms' }}>
                No weeks lost reformatting data. No setup that feels like a second job.
                Your business, running — the way it should have worked from day one.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '400ms' }}>
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-3 px-9 py-5 rounded-full font-black text-lg transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.35), 4px 4px 0px #1E293B',
                    fontFamily: 'Outfit',
                  }}>
                  Start Trial <ArrowRight size={22} />
                </Link>
              </div>

              <div
                className={`flex flex-wrap gap-3 justify-center lg:justify-start transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '500ms' }}>
                {[
                  { label: 'Weekly plans from $4.99', color: '#8B5CF6', bg: '#EDE9FE' },
                  { label: '14-day trial on Monthly & Yearly', color: '#34D399', bg: '#D1FAE5' },
                  { label: 'Cancel anytime', color: '#F472B6', bg: '#FCE7F3' },
                ].map(t => (
                  <span key={t.label}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: t.bg, color: t.color, border: `1.5px solid ${t.color}30` }}>
                    ✦ {t.label}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`relative transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: '600ms' }}>

              <div className="rounded-2xl overflow-hidden"
                style={{
                  border: '2px solid #E2E8F0',
                  boxShadow: '0 32px 80px rgba(139,92,246,0.12), 0 8px 24px rgba(0,0,0,0.08), 8px 8px 0px #8B5CF620',
                }}>

                <div className="flex items-center gap-2 px-4 py-3"
                  style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mx-4 px-4 py-1.5 rounded-full text-xs text-center"
                    style={{ background: 'white', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
                    samyojak.vercel.app/dashboard
                  </div>
                </div>

                <div className="flex" style={{ background: '#FAFBFF' }}>

                  <div className="hidden sm:flex flex-col w-40 shrink-0 p-3" style={{ background: '#0F172A' }}>
                    <div className="flex items-center gap-2 px-2 mb-4">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-xs"
                        style={{ background: '#8B5CF6' }}>S</div>
                      <span className="text-white font-black text-xs" style={{ fontFamily: 'Outfit' }}>Samyojak</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { label: 'Dashboard', active: true },
                        { label: 'CRM' },
                        { label: 'Invoices' },
                        { label: 'Inventory' },
                        { label: 'HR' },
                        { label: 'Projects' },
                        { label: 'AI Assistant' },
                      ].map(item => (
                        <div key={item.label}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: item.active ? '#8B5CF6' : 'transparent',
                            color: item.active ? 'white' : '#94A3B8',
                          }}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-black text-sm" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                          Good morning, Omkar 👋
                        </p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>Wednesday, June 18, 2026</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black"
                        style={{ background: '#EDE9FE', color: '#8B5CF6' }}>Complete ERP</span>
                    </div>

                    <div className="p-4 rounded-xl mb-4"
                      style={{ background: '#0F172A', border: '1.5px solid rgba(139,92,246,0.4)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#8B5CF6' }}>
                          <Brain size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#C4B5FD' }}>Samyojak AI</span>
                        <div className="ml-auto flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-xs text-green-400">Live</span>
                        </div>
                      </div>
                      <p className="text-xs text-left leading-relaxed" style={{ color: '#8B5CF6' }}>
                        💡 You have 8 hot leads this week. 3 invoices overdue — follow up today to protect cash flow.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Leads', value: '48', color: '#8B5CF6', bg: '#EDE9FE' },
                        { label: 'Invoices', value: '23', color: '#F472B6', bg: '#FCE7F3' },
                        { label: 'Products', value: '156', color: '#FBBF24', bg: '#FEF3C7' },
                        { label: 'Team', value: '12', color: '#34D399', bg: '#D1FAE5' },
                      ].map(s => (
                        <div key={s.label} className="p-3 rounded-xl"
                          style={{ background: 'white', border: `1.5px solid ${s.color}30`, boxShadow: '2px 2px 0px #E2E8F0' }}>
                          <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>{s.label}</p>
                          <p className="text-xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{s.value}</p>
                          <div className="w-full h-1 rounded-full mt-2" style={{ background: s.bg }}>
                            <div className="h-1 rounded-full w-3/4" style={{ background: s.color }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E2E8F0', background: 'white' }}>
                      <div className="grid grid-cols-4 px-4 py-2 border-b" style={{ borderColor: '#F1F5F9', background: '#F8FAFC' }}>
                        {['Name', 'Status', 'Value', 'Score'].map(h => (
                          <span key={h} className="text-xs font-bold uppercase" style={{ color: '#94A3B8' }}>{h}</span>
                        ))}
                      </div>
                      {[
                        { name: 'Rahul Sharma', status: 'Contacted', statusColor: '#FBBF24', statusBg: '#FEF3C7', value: '₹85K', score: '92', scoreColor: '#34D399' },
                        { name: 'Priya Mehta', status: 'Converted', statusColor: '#34D399', statusBg: '#D1FAE5', value: '₹45K', score: '88', scoreColor: '#34D399' },
                      ].map(row => (
                        <div key={row.name} className="grid grid-cols-4 px-4 py-2.5 border-b last:border-0" style={{ borderColor: '#F8FAFC' }}>
                          <span className="text-xs font-semibold truncate" style={{ color: '#1E293B' }}>{row.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit"
                            style={{ background: row.statusBg, color: row.statusColor }}>
                            {row.status}
                          </span>
                          <span className="text-xs font-medium" style={{ color: '#64748B' }}>{row.value}</span>
                          <span className="text-xs font-black" style={{ color: row.scoreColor }}>{row.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-8 right-8 h-8 rounded-full pointer-events-none"
                style={{ background: 'rgba(139,92,246,0.1)', filter: 'blur(16px)' }} />
            </div>
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

      {/* ADAPTIVE ERP VISION — Expanded: 14 business types */}
      <section className="px-6 py-24" style={{ background: '#0F172A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1.5px solid rgba(139,92,246,0.5)', color: '#C4B5FD' }}>
              <Zap size={14} /> Universal Adaptive ERP
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white" style={{ fontFamily: 'Outfit' }}>
              One ERP for{' '}
              <span style={{ color: '#8B5CF6' }}>14+ types of businesses</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
              Traditional ERP forces you to adapt to their structure. Samyojak flips this entirely — your data adapts, not you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="p-8 rounded-2xl" style={{ background: '#1E293B', border: '2px solid #334155' }}>
              <div className="text-3xl mb-4">😩</div>
              <h3 className="text-xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>Legacy ERP Software</h3>
              <ul className="space-y-3">
                {['Forces you to rename all your columns', 'Weeks or months of setup and configuration', 'Expensive consultants to migrate data', 'Your team has to unlearn everything', 'Rigid structure that does not fit your workflow'].map(p => (
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
                {['Import any CSV — columns stay exactly as yours', 'No setup that feels like a second job', 'AI adapts to your business automatically', 'Data migration in one upload — no consultants', 'Familiar structure — zero learning curve'].map(p => (
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
              We are building the world's first truly universal ERP — one that intelligently generates the right structure, fields, and workflows for any business automatically. All without configuration.
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
            <p className="text-lg" style={{ color: '#64748B' }}>Eight powerful modules unified in one workspace</p>
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

      {/* PRICING — NOW ACTUALLY REACTIVE TO billing STATE */}
      <section id="pricing" className="px-6 py-24" style={{ background: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Simple pricing. Big value.</h2>
            <p className="text-lg mb-6" style={{ color: '#64748B' }}>No annual lock-in. No per-user fees. Cancel anytime.</p>

            {/* Billing toggle — now correctly wired */}
            <div className="inline-flex p-1 rounded-full" style={{ background: '#E2E8F0' }}>
              {(['weekly', 'monthly', 'yearly'] as BillingCycle[]).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBilling(b)}
                  className="px-5 py-2 rounded-full text-sm font-bold capitalize transition-all cursor-pointer"
                  style={{
                    background: billing === b ? '#1E293B' : 'transparent',
                    color: billing === b ? 'white' : '#64748B',
                  }}
                >
                  {b}{b === 'yearly' && <span style={{ color: '#FBBF24' }}> -20%</span>}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                {REGION_NOTES[region]} — detected automatically 🌍
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLAN_DEFINITIONS.map(plan => (
              <div key={plan.key} className="relative p-6 rounded-2xl"
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

                {/* Price — now correctly pulled from PRICING_MATRIX[region][billing] */}
                <div className="mb-3">
                  <span className="text-4xl font-black"
                    style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                    {currentPrices[plan.key]}
                  </span>
                  <span className="text-sm ml-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                    /{currentPeriod}
                  </span>
                </div>

                {/* Bonus/trial badge — now correctly switches with billing */}
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{
                    background: currentBonus.hasTrial
                      ? (plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5')
                      : (plan.popular ? 'rgba(255,255,255,0.2)' : '#EDE9FE'),
                    color: currentBonus.hasTrial
                      ? (plan.popular ? 'white' : '#065F46')
                      : (plan.popular ? 'white' : '#5B21B6'),
                  }}>
                  {currentBonus.hasTrial ? '✨ ' : '🎁 '}{currentBonus.label}
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
                <Link href="/signup"
                  className="block w-full py-3 rounded-full text-sm font-bold text-center hover:opacity-90 transition-opacity"
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
                  ['Setup time', 'Minutes, not months', '2–4 weeks', '1–3 months'],
                  ['Import any CSV format', '✅ Yes', '❌ Strict format only', '❌ Strict format only'],
                  ['Weekly billing option', '✅ Yes', '❌ No', '❌ No'],
                  ['Free QR codes', '✅ Included', '❌ Paid add-on', '❌ Not available'],
                  ['WhatsApp invoicing', '✅ Built-in', '❌ No', '❌ No'],
                  ['AI on live data', '✅ Real-time', '⚠️ Basic', '❌ No'],
                  ['India & global pricing', '✅ Geo-optimized', '⚠️ USD only', '⚠️ USD only'],
                  ['Universal tax 15+ countries', '✅ One click', '⚠️ Complex setup', '⚠️ Per-country'],
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
            {['▲ Vercel · Hosting', '⚡ Supabase · Auth', '🤖 Groq AI · Intelligence', '📊 Airtable · Data', '💳 Dodo · Payments'].map(item => (
              <div key={item} className="text-center">
                <p className="font-black text-gray-900 text-sm" style={{ fontFamily: 'Outfit' }}>
                  {item.split(' · ')[0]}
                </p>
                <p className="text-xs text-gray-400">{item.split(' · ')[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="px-6 py-24 text-center" style={{ background: '#1E293B' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6 float">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
            Stop suffering through setup.
            <br />
            <span style={{ color: '#8B5CF6' }}>Start running your business.</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: '#94A3B8' }}>
            Join businesses globally. No setup hell. Cancel anytime.
          </p>
          <Link href="/signup" className="candy-btn px-12 py-5 text-xl inline-flex items-center gap-2">
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
          <div className="flex items-center justify-between border-t pt-8 flex-wrap gap-4" style={{ borderColor: '#1E293B' }}>
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
