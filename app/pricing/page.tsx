'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react'

function detectRegion() {
  if (typeof window === 'undefined') return 'global'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'india'
  if (tz.includes('America') || tz.includes('Europe') || tz.includes('Australia')) return 'western'
  return 'global'
}

const REGION_PRICES: Record<string, Record<string, Record<string, string>>> = {
  india: {
    weekly: { crm: '$4.99', erp: '$9.99', business: '$16.99', complete: '$21.99' },
    monthly: { crm: '$15', erp: '$29', business: '$49', complete: '$69' },
    yearly: { crm: '$144', erp: '$279', business: '$469', complete: '$659' },
  },
  global: {
    weekly: { crm: '$6.99', erp: '$13.99', business: '$22.99', complete: '$29.99' },
    monthly: { crm: '$21', erp: '$41', business: '$69', complete: '$89' },
    yearly: { crm: '$199', erp: '$399', business: '$659', complete: '$849' },
  },
  western: {
    weekly: { crm: '$9.99', erp: '$19.99', business: '$29.99', complete: '$39.99' },
    monthly: { crm: '$29', erp: '$59', business: '$89', complete: '$119' },
    yearly: { crm: '$279', erp: '$569', business: '$849', complete: '$1,139' },
  },
}

const REGION_LABELS: Record<string, string> = {
  india: '🇮🇳 India pricing detected',
  global: '🌍 Global pricing detected',
  western: '🌎 Western pricing detected',
}

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes. Weekly plans expire at the end of the week if you turn off auto-pay. Monthly and yearly plans expire at the end of the period. No cancellation fees ever.' },
  { q: 'What happens when I upgrade?', a: 'You immediately get access to all features in the new plan. The difference is prorated to your billing cycle.' },
  { q: 'Is there a free trial?', a: 'Yes. Visit the demo page for a complete full-access demo with no credit card required.' },
  { q: 'How does geo-based pricing work?', a: 'We detect your timezone to determine your region and apply the appropriate pricing. India users get India pricing, Western users get Western pricing, others get Global pricing.' },
  { q: 'Do you charge per user?', a: 'No. All plans are flat-rate. One price for your whole team regardless of how many people use it.' },
  { q: 'What payment methods are accepted?', a: 'Cards (Visa, Mastercard), UPI for India, and other local payment methods via Dodo Payments.' },
]

export default function Pricing() {
  const [billing, setBilling] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  const [region, setRegion] = useState<'india' | 'global' | 'western'>('global')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => { setRegion(detectRegion() as any) }, [])

  const prices = REGION_PRICES[region][billing]

  const PLANS = [
    {
      name: 'CRM Starter', emoji: '🚀', price: prices.crm, color: '#8B5CF6', popular: false,
      desc: 'Perfect for solo founders and small sales teams',
      features: ['CRM with AI lead scoring', 'Contact & lead management', 'Follow-up date reminders', 'Import any CSV format', 'Export to CSV', 'Support ticket system', 'Mobile-friendly interface'],
      locked: ['Invoices & Tax', 'Inventory & QR codes', 'HR & Payroll', 'Projects & Kanban', 'AI Assistant'],
    },
    {
      name: 'ERP Basic', emoji: '⚡', price: prices.erp, color: '#F472B6', popular: true,
      desc: 'For growing businesses that need full operations management',
      features: ['Everything in CRM Starter', 'Universal tax invoicing (15+ countries)', 'Inventory management', 'Free auto QR codes for products', 'WhatsApp invoice sending', 'GST / VAT / HST tax reports', 'Low stock alerts'],
      locked: ['HR & Payroll', 'Projects & Kanban', 'AI Assistant'],
    },
    {
      name: 'Business', emoji: '🏢', price: prices.business, color: '#34D399', popular: false,
      desc: 'For established businesses managing teams and multiple clients',
      features: ['Everything in ERP Basic', 'HR & Payroll management', 'Project management with Kanban', 'Team management', 'Advanced analytics', 'Multi-department tracking'],
      locked: ['AI Business Intelligence'],
    },
    {
      name: 'Complete ERP', emoji: '👑', price: prices.complete, color: '#FBBF24', popular: false,
      desc: 'The complete platform for scaling businesses that want AI-powered insights',
      features: ['Everything in Business', 'AI Business Intelligence — reads your live data', 'Real-time AI analysis of leads, invoices, inventory', 'Floating AI assistant on every page', 'Priority support', 'White label program access', 'All future features included'],
      locked: [],
    },
  ]

  const period = billing === 'weekly' ? '/week' : billing === 'monthly' ? '/month' : '/year'
  const bonus = billing === 'weekly' ? '+1 week free' : billing === 'monthly' ? '+1 month free' : '+3 months free'

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
            <Link href="/features" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Features</Link>
            <Link href="/pricing" className="text-sm font-medium" style={{ color: '#8B5CF6' }}>Pricing</Link>
            <Link href="/about" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>About</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Contact</Link>
          </div>
          <Link href="/signup" className="candy-btn px-4 py-2 text-sm">Start Free</Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Simple pricing.
            <br />
            <span style={{ color: '#8B5CF6' }}>No surprises.</span>
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            No per-user fees. No annual lock-in. Cancel anytime. Every plan includes bonus time.
          </p>

          {/* Region badge */}
          <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
            {REGION_LABELS[region]} — auto-detected from your timezone
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-full" style={{ background: '#E2E8F0' }}>
              {(['weekly', 'monthly', 'yearly'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className="px-6 py-2 rounded-full text-sm font-bold capitalize transition-all"
                  style={{
                    background: billing === b ? '#1E293B' : 'transparent',
                    color: billing === b ? 'white' : '#64748B',
                  }}>
                  {b}{b === 'yearly' && <span style={{ color: billing === b ? '#FBBF24' : '#FBBF24' }}> -20%</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name}
                className="relative rounded-2xl p-6 flex flex-col"
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
                <h3 className="font-black text-xl mb-1"
                  style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                  {plan.name}
                </h3>
                <p className="text-xs mb-4" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#64748B' }}>
                  {plan.desc}
                </p>

                <div className="mb-2">
                  <span className="text-4xl font-black"
                    style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm ml-1"
                    style={{ color: plan.popular ? 'rgba(255,255,255,0.6)' : '#94A3B8' }}>
                    {period}
                  </span>
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5"
                  style={{ background: plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5', color: plan.popular ? 'white' : '#065F46' }}>
                  🎁 {bonus}
                </div>

                <ul className="space-y-2 mb-4 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs"
                      style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : '#475569' }}>
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: plan.popular ? 'white' : '#34D399' }} />
                      {f}
                    </li>
                  ))}
                  {plan.locked.length > 0 && (
                    <li className="pt-2 border-t" style={{ borderColor: plan.popular ? 'rgba(255,255,255,0.2)' : '#F1F5F9' }}>
                      <p className="text-xs mb-2" style={{ color: plan.popular ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>
                        🔒 Locked in this plan:
                      </p>
                      {plan.locked.map(f => (
                        <p key={f} className="text-xs mb-1 opacity-50"
                          style={{ color: plan.popular ? 'white' : '#94A3B8' }}>
                          • {f}
                        </p>
                      ))}
                    </li>
                  )}
                </ul>

                <Link href="/signup"
                  className="block w-full py-3 rounded-full text-sm font-bold text-center mt-auto hover:opacity-90 transition-opacity"
                  style={{
                    background: plan.popular ? 'white' : '#1E293B',
                    color: plan.popular ? '#8B5CF6' : 'white',
                    border: '2px solid #1E293B',
                  }}>
                  Get Started Free
                </Link>
              </div>
            ))}
          </div>

          {/* All plans include */}
          <div className="mt-12 p-8 rounded-2xl text-center"
            style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #F1F5F9' }}>
            <h3 className="font-black text-lg mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Every plan includes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '🔒', label: 'SSL security', desc: 'All data encrypted' },
                { emoji: '📱', label: 'Mobile app', desc: 'Works on any device' },
                { emoji: '🌍', label: 'Global access', desc: 'Use from anywhere' },
                { emoji: '🎫', label: 'Support tickets', desc: '24hr response time' },
                { emoji: '📥', label: 'CSV import', desc: 'Any format accepted' },
                { emoji: '📤', label: 'CSV export', desc: 'Your data, always' },
                { emoji: '🔄', label: 'Cancel anytime', desc: 'No lock-in ever' },
                { emoji: '🎁', label: 'Bonus period', desc: 'Every plan' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <p className="font-bold text-sm" style={{ color: '#1E293B' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Pricing questions
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
                    : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                  }
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
      <section className="px-6 py-20 text-center" style={{ background: '#1E293B' }}>
        <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
          Start free. No card needed.
        </h2>
        <p className="mb-8" style={{ color: '#94A3B8' }}>Try the full demo or create your account today.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className="candy-btn px-8 py-4 text-base inline-flex items-center gap-2">
            Create Account <ArrowRight size={18} />
          </Link>
          <Link href="/demo"
            className="px-8 py-4 text-base rounded-full font-bold inline-flex items-center gap-2"
            style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
            See Live Demo
          </Link>
        </div>
      </section>
    </div>
  )
}
