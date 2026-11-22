'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { detectRegion, planPrices, type Region } from '@/lib/products'
import {
  ArrowRight, Check, Brain, Users, FileText, Package, UserCheck,
  FolderOpen, BarChart3, Globe, Zap, ChevronDown, ChevronUp,
  Building2, Stethoscope, ShoppingBag, Factory,
  GraduationCap, Truck, Code, UtensilsCrossed, Menu, X,
  Scissors, HomeIcon, Briefcase, Car, Dumbbell, Camera,
  Wallet, ShieldCheck, MessageCircle, Upload,
} from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'A chat that does the work', desc: 'Ask who has not paid, add a lead, mark an invoice paid. You see a preview and approve every change.', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: Upload, title: 'Bring any spreadsheet', desc: 'Excel, CSV or PDF imported with your own column names. Preview first, nothing saves until you say so.', color: '#F472B6', bg: '#FCE7F3' },
  { icon: FileText, title: 'Universal Tax Invoicing', desc: 'GST, VAT, HST, Sales Tax — 15+ countries in one click', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: Wallet, title: 'Expenses, bills and profit', desc: 'Record what you spend, track bills to pay, and ask for profit by month.', color: '#34D399', bg: '#D1FAE5' },
  { icon: Users, title: 'CRM', desc: 'Leads, follow-ups and pipeline in one list, with the next step on every lead', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: Package, title: 'Inventory + Free QR Codes', desc: 'Stock tracking with auto-generated QR codes, low stock alerts', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Truck, title: 'Vendors and purchase orders', desc: 'Keep your suppliers and the orders you place with them, with expected dates', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: UserCheck, title: 'HR and recruiting', desc: 'Employees, salary records, leave balance, and candidates by stage', color: '#34D399', bg: '#D1FAE5' },
  { icon: FolderOpen, title: 'Projects', desc: 'Client projects with status and deadlines', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: BarChart3, title: 'Reports and tax summaries', desc: 'Monthly revenue charts and tax collected, for GST, VAT or sales tax', color: '#F472B6', bg: '#FCE7F3' },
  { icon: MessageCircle, title: 'Payment reminders on WhatsApp', desc: 'Overdue invoices come with a ready message. One tap opens it in WhatsApp.', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: ShieldCheck, title: 'Activity log and undo', desc: 'See everything the assistant added or changed, who approved it, and undo it.', color: '#34D399', bg: '#D1FAE5' },
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
  { icon: HomeIcon, name: 'Real Estate', desc: 'Property leads, client management, invoicing', color: '#F472B6' },
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
  { q: 'Do you charge per user?', a: 'No per-user fees. Each plan is one flat price for your business.' },
  { q: 'Does the AI actually read my real data?', a: 'Yes. The assistant reads your live records for the modules in your plan, and the numbers in its answers are calculated from your data, not guessed. When it wants to add or change something, it shows a preview and waits for your approval, and you can undo it.' },
  { q: 'Can the assistant change my data without asking?', a: 'No. It shows what it is about to add or change and waits for you to confirm. Every confirmed change goes into an activity log, and you can undo it from the chat.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit. Authentication is handled by Supabase — enterprise grade security. Your data is stored securely and never shared.' },
]

type BillingCycle = 'weekly' | 'monthly' | 'yearly'


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
  weekly: { label: '14-day free trial', hasTrial: true },
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
    locked: ['Invoices', 'Inventory', 'HR', 'Projects'],
  },
  {
    key: 'basic',
    name: 'ERP Basic',
    emoji: '⚡',
    popular: true,
    features: ['Everything in CRM Starter', 'Universal tax invoicing', 'Inventory + free QR codes', 'WhatsApp invoice sending', 'GST Reports'],
    locked: ['HR & Payroll', 'Projects'],
  },
  {
    key: 'business',
    name: 'Business',
    emoji: '🏢',
    popular: false,
    features: ['Everything in ERP Basic', 'HR & Payroll management', 'Project management Kanban', 'Team management', 'Advanced reports'],
    locked: [],
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
    setRegion(detectRegion())
    setMounted(true)
  }, [])

  const pp = planPrices(region, billing)
  const currentPrices = { starter: pp['CRM Starter'], basic: pp['ERP Basic'], business: pp['Business'], complete: pp['Complete'] }
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
                AI assistant · Any spreadsheet · Any country
              </div>

              <h1
                className={`font-black leading-tight mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ fontFamily: 'Outfit', fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', color: '#1E293B', transitionDelay: '200ms' }}>
                Ask your business.
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #F472B6 50%, #FBBF24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Samyojak Does the Work.
                </span>
              </h1>

              <p
                className={`text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ color: '#64748B', lineHeight: 1.6, transitionDelay: '300ms' }}>
                Bring your spreadsheets as they are. Ask questions in plain words, add records by
                typing them, and approve every change before it happens. Undo anything.
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
                  { label: `Weekly plans from ${planPrices(region, 'weekly')['CRM Starter']}`, color: '#8B5CF6', bg: '#EDE9FE' },
                  { label: '14-day free trial on every plan', color: '#34D399', bg: '#D1FAE5' },
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
                    www.samyojak-erp.com/ai
                  </div>
                </div>

                <div className="p-5 space-y-3" style={{ background: '#FAFBFF' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Example conversation</p>

                  <div className="flex justify-end">
                    <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: '#8B5CF6', color: 'white' }}>Who has not paid me?</div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
                    <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: '#8B5CF6' }}>Unpaid invoices</p>
                    <div className="space-y-1.5">
                      {[
                        { c: 'Sharma Traders', a: '45,000', d: 'Due 12 Nov' },
                        { c: 'Brightline Studio', a: '18,500', d: 'Due 20 Nov' },
                      ].map(r => (
                        <div key={r.c} className="grid grid-cols-3 text-xs" style={{ color: '#1E293B' }}>
                          <span className="font-semibold truncate">{r.c}</span>
                          <span>{r.a}</span>
                          <span style={{ color: '#64748B' }}>{r.d}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-2 font-bold" style={{ color: '#1E293B' }}>2 unpaid · 63,500</p>
                  </div>

                  <div className="flex justify-end">
                    <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: '#8B5CF6', color: 'white' }}>Paid rent 20k today</div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: '#0F172A', border: '1.5px solid rgba(139,92,246,0.4)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#8B5CF6' }}>
                        <Brain size={12} className="text-white" />
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#C4B5FD' }}>Samyojak</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#C4B5FD' }}>
                      I am ready to add 1 record to Expenses: Rent, 20,000, Paid. Please review and confirm.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#34D399', color: '#064E3B' }}>Confirm</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #334155' }}>Cancel</span>
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
            ['Ask in plain words', 'Approve every change', 'Undo anything', 'Import Excel, CSV or PDF', 'CRM', 'Invoicing', 'Expenses and profit', 'Purchase orders', 'Inventory + QR', 'HR and recruiting', 'Universal tax'].map(f => (
              <span key={`${i}-${f}`} className="text-white/70 text-sm font-medium px-4">⚡ {f}</span>
            ))
          )}
        </div>
      </div>

      {/* ADAPTIVE ERP VISION */}
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
                {['Import any CSV — columns stay exactly as yours', 'Set up from a spreadsheet, not a long project', 'The assistant works with your own column names', 'Bring your data in with one upload', 'Ask in plain words, like a chat'].map(p => (
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
              We are building a business system you talk to. It reads the data you already have, answers in plain words, does the repetitive admin, and always asks before it changes anything. Setup should take minutes, not months.
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
            <p className="text-lg" style={{ color: '#64748B' }}>Everything in one workspace, run from a chat</p>
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
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Simple pricing. Big value.</h2>
            <p className="text-lg mb-6" style={{ color: '#64748B' }}>No annual lock-in. No per-user fees. Cancel anytime.</p>

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

                <div className="mb-3">
                  <span className="text-4xl font-black"
                    style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                    {currentPrices[plan.key]}
                  </span>
                  <span className="text-sm ml-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                    /{currentPeriod}
                  </span>
                </div>

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
                  <th className="p-4 text-center text-sm font-bold text-white/60">Typical traditional ERP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Getting started', 'Upload a spreadsheet and ask', 'Often a setup project'],
                  ['Import your own file', '✅ Excel, CSV, PDF', 'Often a fixed template'],
                  ['Weekly billing option', '✅ Yes', 'Usually monthly or yearly'],
                  ['Free QR codes', '✅ Included', 'Varies'],
                  ['WhatsApp invoicing', '✅ Send with one tap', 'Varies'],
                  ['Ask questions in chat', '✅ On supported plans', 'Varies'],
                  ['India & global pricing', '✅ Priced by region', 'Varies'],
                  ['Tax for many countries', '✅ One tax system', 'Often set up per country'],
                  ['Starting price', `${planPrices(region, 'weekly')['CRM Starter']}/week`, 'Often per user, per month'],
                ].map(([feature, us, a]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-700">{feature}</td>
                    <td className="p-4 text-center text-sm font-bold" style={{ color: '#8B5CF6' }}>{us}</td>
                    <td className="p-4 text-center text-sm text-gray-500">{a}</td>
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
            Built on trusted cloud services
          </p>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            {['▲ Vercel · Hosting', '⚡ Supabase · Auth', '🤖 Groq AI · Intelligence', '📊 Cloud · Data', '💳 Dodo · Payments'].map(item => (
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
