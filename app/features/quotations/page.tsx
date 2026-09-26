import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Quotations — Samyojak Features',
  description: 'Build professional quotations, send them to clients, and convert accepted quotes to invoices in one click with Samyojak.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features/quotations' },
  openGraph: {
    title: 'Quotations — Samyojak Features',
    description: 'Build professional quotations and convert them to invoices in one click.',
    url: 'https://www.samyojak-erp.com/features/quotations',
  },
}

const items = [
  'Build professional quotations with line items and pricing',
  'Send quotations directly to clients',
  'Convert an accepted quote to an invoice in one click',
  'Track quotation status — Draft, Sent, Accepted, Declined',
  'Apply the correct tax rate for the client\'s country automatically',
  'Keep a full history of every quotation sent',
]

const faqs = [
  { q: 'Can I convert a quotation directly to an invoice?', a: 'Yes. Once a client accepts a quote, converting it to an invoice takes one click, carrying over the line items and pricing.' },
  { q: 'Do quotations include tax calculations?', a: 'Yes. Quotations use the same universal tax engine as invoicing, applying the correct GST, VAT, or other rate for the client\'s country.' },
  { q: 'Can I track which quotes are still pending?', a: 'Yes. Quotation status — Draft, Sent, Accepted, Declined — is tracked so you always know what\'s outstanding.' },
]

export default function QuotationsFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Quotations' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Quotations
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Send professional quotes before starting work, then convert accepted quotes straight into
            invoices — no re-entering line items, no separate tools.
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
          <Link href="/features/invoicing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See invoicing features →</Link>
          <Link href="/industries/agencies" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for agencies →</Link>
        </div>
      </section>

      <SeoCtaSection heading="From quote to invoice in one click" subheading="Start sending quotations in minutes." />
      <MarketingFooter />
    </div>
  )
      }
