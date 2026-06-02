'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Check, ArrowRight, Star, Zap, Shield, Users, BarChart3, Package, FileText, UserCheck, FolderOpen, Menu, X } from 'lucide-react'

const prices = {
  weekly: ['$4.99', '$9.99', '$16.99', '$21.99'],
  monthly: ['$15', '$35', '$60', '$79'],
  yearly: ['$144', '$336', '$576', '$759'],
}

const bonuses = {
  weekly: '+1 week free',
  monthly: '+1 month free',
  yearly: '+2 months free',
}

const plans = ['CRM Starter', 'ERP Basic', 'Business', 'Complete']

const planFeatures = [
  ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'],
  ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'],
  ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'],
  ['Everything', 'AI features', 'Unlimited users', 'API access'],
]

const planColors = ['#8B5CF6', '#F472B6', '#FBBF24', '#34D399']

const features = [
  { icon: Users, title: 'Smart CRM', desc: 'AI-powered lead scoring, pipeline tracking, and automated follow-ups.', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: FileText, title: 'GST Invoicing', desc: 'Create compliant invoices with auto tax calculation and WhatsApp sending.', color: '#F472B6', bg: '#FCE7F3' },
  { icon: Package, title: 'Inventory + QR', desc: 'Track products with free auto-generated QR codes. Scan with any phone.', color: '#FBBF24', bg: '#FEF3C7' },
  { icon: UserCheck, title: 'HR & Payroll', desc: 'Manage employees, attendance, leaves, and payroll in one place.', color: '#34D399', bg: '#D1FAE5' },
  { icon: FolderOpen, title: 'Projects', desc: 'Kanban board with tasks, deadlines, and progress tracking.', color: '#8B5CF6', bg: '#EDE9FE' },
  { icon: BarChart3, title: 'Tax Reports', desc: 'Auto GSTR-1 format reports with PDF and CSV export.', color: '#F472B6', bg: '#FCE7F3' },
]

const marqueeItems = ['CRM', 'Invoicing', 'Inventory', 'HR', 'Projects', 'Tax Reports', 'QR Codes', 'WhatsApp', 'AI Scoring', 'Dark Mode', 'Mobile First']

const faqItems = [
  {
    q: 'What is Samyojak?',
    a: 'Samyojak is an all-in-one ERP software for modern businesses. It includes CRM, GST invoicing, inventory with free QR codes, HR management, project tracking, and tax reports — all in one beautiful workspace.',
  },
  {
    q: 'How much does Samyojak cost?',
    a: 'Plans start at $4.99 per week. Every plan includes a bonus period — weekly gets +1 week free, monthly gets +1 month free, yearly gets +2-3 months free. Pay once, get more.',
  },
  {
    q: 'Does Samyojak support GST, VAT, and other taxes?',
    a: 'Yes! Samyojak has a universal tax engine supporting GST (India, Australia, Singapore), VAT (UK, Germany, UAE), HST (Canada), Sales Tax (US), Consumption Tax (Japan), and more.',
  },
  {
    q: 'Does it work on mobile phones?',
    a: 'Yes. Samyojak is mobile-first and works on any phone or tablet. It has a dedicated bottom navigation bar on mobile for easy access to all modules.',
  },
  {
    q: 'What makes Samyojak different from other ERP software?',
    a: 'Flat pricing not per-user, setup in minutes not weeks, free QR codes for inventory, WhatsApp invoice sending, AI lead scoring, and weekly payment plans — features legacy ERP platforms simply do not offer.',
  },
  {
    q: 'Can I export my data from Samyojak?',
    a: 'Yes. Every module has CSV export built in. Your data always belongs to you and you can download it anytime with one click.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Samyojak uses Supabase with row-level security, HTTPS everywhere, login rate limiting, auto session timeout, and encrypted data at rest. Your business data is always protected.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'You need to select a plan to access the dashboard. Every plan comes with a bonus period so you get more time than you pay for.',
  },
]

export default function Home() {
  const [billing, setBilling] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF5' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: '#FFFDF5', borderBottom: '2px solid #E2E8F0' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              S
            </div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'About', href: '/about' },
              { label: 'Services', href: '/services' },
              { label: 'Contact', href: '/contact' },
            ].map(item => (
              <Link key={item.label} href={item.href} className="font-semibold text-sm hover:text-violet-600 transition-colors" style={{ fontFamily: 'Plus Jakarta Sans', color: '#1E293B' }}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="outline-btn px-5 py-2 text-sm">Sign in</Link>
            <Link href="/signup" className="candy-btn px-5 py-2 text-sm flex items-center gap-2">
              Start Trial <ArrowRight size={16} />
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #1E293B' }}>
            {['Features', 'Pricing', 'About', 'Services', 'Contact'].map(item => (
              <Link
                key={item}
                href={item === 'Features' ? '#features' : item === 'Pricing' ? '#pricing' : `/${item.toLowerCase()}`}
                className="block py-3 font-semibold border-b last:border-0"
                style={{ color: '#1E293B', borderColor: '#E2E8F0' }}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex gap-3 mt-4">
              <Link href="/login" className="outline-btn px-4 py-2 text-sm flex-1 text-center">Sign in</Link>
              <Link href="/signup" className="candy-btn px-4 py-2 text-sm flex-1 text-center">Start Trial</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 overflow-hidden relative">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20 float" style={{ background: '#FBBF24' }}></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full opacity-30" style={{ background: '#34D399' }}></div>
        <div className="absolute top-40 left-1/4 w-16 h-16 rotate-45 opacity-20" style={{ background: '#F472B6' }}></div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
                <Star size={14} fill="#8B5CF6" /> Now live · Built for modern businesses
              </div>

              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                One System.<br />
                <span className="relative inline-block">
                  <span style={{ color: '#8B5CF6' }}>Every</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 Q50 2 100 8 Q150 14 198 8" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
                {' '}Operation.
              </h1>

              <p className="text-lg mb-8 leading-relaxed" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
                The all-in-one ERP for modern businesses globally. CRM, Invoicing, Inventory, HR, and Projects — all in one place. Simpler, faster, and more affordable than legacy ERP platforms.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link href="/signup" className="candy-btn px-8 py-4 text-lg flex items-center justify-center gap-3">
                  Start Trial
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'white' }}>
                    <ArrowRight size={16} style={{ color: '#8B5CF6' }} />
                  </div>
                </Link>
                <Link href="/about" className="outline-btn px-8 py-4 text-lg text-center">
                  Learn More
                </Link>
              </div>

              <p className="text-sm" style={{ color: '#94A3B8' }}>
                🎁 Pay for a week · Get an extra week on us
              </p>
            </div>

            <div className="flex-1 relative">
              <div className="dot-bg rounded-3xl p-6 relative" style={{ border: '2px solid #E2E8F0' }}>
                <div className="bg-white rounded-2xl p-6" style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#F472B6' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ background: '#FBBF24' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ background: '#34D399' }}></div>
                    <span className="text-xs ml-2 font-semibold" style={{ color: '#64748B' }}>Samyojak · Live</span>
                    <span className="ml-auto text-xs font-bold" style={{ color: '#34D399' }}>● Online</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Leads', value: '1,284', change: '+12%', color: '#8B5CF6', bg: '#EDE9FE' },
                      { label: 'Revenue', value: '₹48.2K', change: '+24%', color: '#34D399', bg: '#D1FAE5' },
                      { label: 'Open Invoices', value: '37', change: '-3%', color: '#F472B6', bg: '#FCE7F3' },
                      { label: 'Projects', value: '12', change: '+2', color: '#FBBF24', bg: '#FEF3C7' },
                    ].map(item => (
                      <div key={item.label} className="p-4 rounded-xl" style={{ background: item.bg, border: `2px solid ${item.color}` }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>{item.label}</p>
                        <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{item.value}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: item.color }}>{item.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 px-3 py-2 rounded-full font-bold text-sm wiggle" style={{ background: '#FBBF24', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B', fontFamily: 'Outfit' }}>
                🚀 Free QR Codes!
              </div>
              <div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-full font-bold text-sm" style={{ background: '#34D399', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B', fontFamily: 'Outfit' }}>
                ✅ GST Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-4 overflow-hidden" style={{ background: '#1E293B', borderTop: '2px solid #1E293B', borderBottom: '2px solid #1E293B' }}>
        <div className="flex gap-8 marquee-track whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-3 font-bold text-sm px-2" style={{ color: 'white', fontFamily: 'Outfit' }}>
              <span style={{ color: ['#F472B6', '#FBBF24', '#34D399', '#8B5CF6'][i % 4] }}>◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold" style={{ background: '#FCE7F3', border: '2px solid #F472B6', color: '#F472B6' }}>
              <Zap size={14} /> Six Powerful Modules
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Everything your business runs on
            </h2>
            <p className="text-lg" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
              Zero context-switching. One source of truth. Built for businesses globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="sticker-card p-6 relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 wiggle" style={{ background: f.bg, border: `2px solid ${f.color}` }}>
                  <f.icon size={22} strokeWidth={2.5} style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>{f.desc}</p>
                <div className="absolute top-4 right-4 text-2xl">{['🎯', '📄', '📦', '👔', '🎯', '📊'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SAMYOJAK */}
      <section className="py-24 px-6" style={{ background: '#1E293B' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: 'white' }}>
              Why businesses choose Samyojak
            </h2>
            <p style={{ color: '#94A3B8' }}>
              Built from scratch to be simpler and smarter than traditional ERP platforms
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #334155' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#0F172A' }}>
                  <th className="p-4 text-left text-sm font-bold" style={{ color: '#94A3B8', fontFamily: 'Outfit' }}>Feature</th>
                  <th className="p-4 text-center text-sm font-bold" style={{ color: '#8B5CF6', fontFamily: 'Outfit' }}>Samyojak ✨</th>
                  <th className="p-4 text-center text-sm font-bold" style={{ color: '#64748B', fontFamily: 'Outfit' }}>Legacy ERP</th>
                  <th className="p-4 text-center text-sm font-bold" style={{ color: '#64748B', fontFamily: 'Outfit' }}>Complex CRM</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Flat pricing — not per user', true, false, false],
                  ['Setup in minutes not weeks', true, false, false],
                  ['Free QR codes built-in', true, false, false],
                  ['GST and VAT ready', true, false, false],
                  ['Weekly payment plans', true, false, false],
                  ['WhatsApp invoice sending', true, false, false],
                  ['AI lead scoring built-in', true, false, false],
                  ['Mobile-first design', true, false, false],
                ].map(([feature, s, z, o], idx) => (
                  <tr key={String(feature)} style={{ borderTop: '1px solid #1E293B', background: idx % 2 === 0 ? '#0F172A' : '#1E293B' }}>
                    <td className="p-4 text-sm font-medium" style={{ color: '#CBD5E1', fontFamily: 'Plus Jakarta Sans' }}>{String(feature)}</td>
                    <td className="p-4 text-center">
                      {s ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold" style={{ background: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                    <td className="p-4 text-center">
                      {z ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold" style={{ background: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                    <td className="p-4 text-center">
                      {o ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold" style={{ background: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: '#8B5CF6' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#F472B6' }}></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold" style={{ background: '#FEF3C7', border: '2px solid #FBBF24', color: '#92400E' }}>
              <Star size={14} fill="#FBBF24" /> Simple Transparent Pricing
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Pay once. Get more.
            </h2>
            <p className="text-lg mb-2" style={{ color: '#64748B' }}>Every plan comes with a bonus period — on us.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              {(['weekly', 'monthly', 'yearly'] as const).map(b => (
                <span key={b} className="text-sm font-semibold px-4 py-2 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>
                  {b === 'weekly' ? '🎁 Weekly → +1 week free' : b === 'monthly' ? '🎁 Monthly → +1 month free' : '🎁 Yearly → +2 months free'}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="flex p-1 rounded-full" style={{ background: '#F1F5F9', border: '2px solid #E2E8F0' }}>
              {(['weekly', 'monthly', 'yearly'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-6 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300"
                  style={{
                    background: billing === b ? '#1E293B' : 'transparent',
                    color: billing === b ? 'white' : '#64748B',
                    fontFamily: 'Outfit',
                  }}
                >
                  {b}
                  {b === 'yearly' && <span className="ml-1 text-xs" style={{ color: '#FBBF24' }}>-20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {plans.map((plan, i) => (
              <div
                key={plan}
                className={`relative p-6 rounded-2xl ${i === 2 ? 'md:-mt-4 md:mb-4' : ''}`}
                style={{
                  background: i === 2 ? '#8B5CF6' : 'white',
                  border: '2px solid #1E293B',
                  boxShadow: i === 2 ? '8px 8px 0px #FBBF24' : '6px 6px 0px #E2E8F0',
                  transform: i === 2 ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {i === 2 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black rotate-2 whitespace-nowrap" style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B', fontFamily: 'Outfit' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: i === 2 ? 'rgba(255,255,255,0.2)' : planColors[i] + '20', border: `2px solid ${i === 2 ? 'rgba(255,255,255,0.4)' : planColors[i]}` }}>
                  <span className="text-lg">{['🌱', '⚡', '🚀', '💎'][i]}</span>
                </div>

                <h3 className="font-black text-lg mb-1" style={{ fontFamily: 'Outfit', color: i === 2 ? 'white' : '#1E293B' }}>{plan}</h3>

                <div className="mb-2">
                  <span className="text-4xl font-black" style={{ fontFamily: 'Outfit', color: i === 2 ? 'white' : '#1E293B' }}>
                    {prices[billing][i]}
                  </span>
                  <span className="text-sm ml-1" style={{ color: i === 2 ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>
                    /{billing === 'weekly' ? 'wk' : billing === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block" style={{ background: i === 2 ? 'rgba(255,255,255,0.2)' : '#D1FAE5', color: i === 2 ? 'white' : '#065F46' }}>
                  🎁 {bonuses[billing]}
                </div>

                <ul className="space-y-2 mb-6">
                  {planFeatures[i].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: i === 2 ? 'rgba(255,255,255,0.9)' : '#475569', fontFamily: 'Plus Jakarta Sans' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ background: i === 2 ? 'rgba(255,255,255,0.2)' : '#D1FAE5', color: i === 2 ? 'white' : '#065F46' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="block text-center py-3 rounded-full font-bold text-sm transition-all duration-300"
                  style={{
                    background: i === 2 ? 'white' : '#1E293B',
                    color: i === 2 ? '#8B5CF6' : 'white',
                    border: '2px solid #1E293B',
                    fontFamily: 'Outfit',
                    boxShadow: '3px 3px 0px ' + (i === 2 ? 'rgba(0,0,0,0.2)' : '#8B5CF6'),
                  }}
                >
                  Start Trial →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold" style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
              ❓ FAQ
            </div>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-lg" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
              Everything you need to know about Samyojak
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl overflow-hidden"
                style={{ border: '2px solid #E2E8F0', background: 'white', boxShadow: '4px 4px 0px #E2E8F0' }}
              >
                <summary
                  className="flex items-center justify-between p-6 cursor-pointer font-bold list-none gap-4"
                  style={{ fontFamily: 'Outfit', color: '#1E293B' }}
                >
                  <span>{item.q}</span>
                  <span
                    className="text-2xl flex-shrink-0 transition-transform duration-300 group-open:rotate-45"
                    style={{ color: '#8B5CF6' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-6 text-sm leading-relaxed"
                  style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans', borderTop: '2px solid #F1F5F9' }}
                >
                  <p className="pt-4">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background: '#8B5CF6' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6 float">🚀</div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
            Ready to coordinate everything?
          </h2>
          <p className="text-lg mb-8 text-white/80" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Join 500+ growing businesses using Samyojak to run their operations smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2" style={{ background: 'white', color: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #1E293B', fontFamily: 'Outfit' }}>
              Start Trial <ArrowRight size={20} />
            </Link>
            <Link href="/contact" className="px-8 py-4 rounded-full font-bold text-lg text-center" style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6" style={{ background: '#0F172A', borderTop: '2px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: '#8B5CF6', border: '2px solid #334155' }}>S</div>
                <span className="font-black text-xl text-white" style={{ fontFamily: 'Outfit' }}>Samyojak</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
                Coordinate Everything. Run Anything. The all-in-one ERP built for modern businesses worldwide.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'CRM', 'Invoicing', 'Inventory'] },
              { title: 'Company', links: ['About', 'Services', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide" style={{ fontFamily: 'Outfit' }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link
                        href={
                          link === 'Privacy Policy' ? '/privacy' :
                          link === 'Terms of Service' ? '/terms' :
                          link === 'Features' ? '#features' :
                          link === 'Pricing' ? '#pricing' :
                          `/${link.toLowerCase().replace(' ', '-')}`
                        }
                        className="text-sm hover:text-violet-400 transition-colors"
                        style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid #1E293B' }}>
            <p className="text-sm" style={{ color: '#475569', fontFamily: 'Plus Jakarta Sans' }}>© 2026 Samyojak. All rights reserved.</p>
            <p className="text-sm" style={{ color: '#475569' }}>Made with ❤️ for businesses everywhere 🌍</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
