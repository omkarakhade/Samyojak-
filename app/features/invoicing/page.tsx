import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Universal Tax Invoicing — Samyojak Features',
  description: 'Create professional invoices with automatic GST, VAT, HST, and Sales Tax calculation for 15+ countries. Send invoices via WhatsApp with one click.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/invoicing' },
  openGraph: {
    title: 'Universal Tax Invoicing — Samyojak Features',
    description: 'GST, VAT, HST, Sales Tax — 15+ countries in one click.',
    url: 'https://samyojak.vercel.app/features/invoicing',
  },
}

const items = [
  'GST for India at 0%, 5%, 12%, 18%, and 28% rates',
  'VAT for UK, Germany, UAE, France, and South Africa',
  'HST/GST for Canada',
  'Sales Tax for USA',
  'GST for Australia, New Zealand, and Singapore',
  'Send invoices directly to clients via WhatsApp',
  'Mark invoices paid, unpaid, or overdue',
  'Export all invoices to CSV anytime',
]

const faqs = [
  { q: 'Which countries\' tax systems does Samyojak support?', a: 'Samyojak supports GST for India, Australia, New Zealand, and Singapore; VAT for the UK, Germany, UAE, France, and South Africa; HST/GST for Canada; and Sales Tax for the USA — 15+ countries total.' },
  { q: 'Can I send invoices via WhatsApp?', a: 'Yes. Invoices can be sent directly to a client\'s WhatsApp with one click, in addition to standard sharing options.' },
  { q: 'Can I track which invoices are overdue?', a: 'Yes. Invoices are marked paid, unpaid, or overdue, and overdue invoices are surfaced so you can follow up.' },
]

export default function InvoicingFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Invoicing' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Universal Tax Invoicing
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Create tax-compliant invoices for clients anywhere, with the correct rate calculated
            automatically for 15+ countries — no manual tax lookup required.
          </p>
          <Link href="/signup"
            className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            Start Trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>What's included</h2>
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/features/recurring-invoices" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See recurring invoice features →</Link>
          <Link href="/features/reports" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See reporting features →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Tax-compliant invoicing, anywhere" subheading="Start sending invoices in minutes." />
      <MarketingFooter />
    </div>
  )
}
