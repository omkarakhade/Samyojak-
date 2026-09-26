import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'BI Dashboard — Samyojak Features',
  description: 'View revenue trends, lead pipeline, invoice status, inventory levels, and payroll breakdowns in one visual dashboard with Samyojak.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features/business-intelligence' },
  openGraph: {
    title: 'BI Dashboard — Samyojak Features',
    description: 'Revenue trends, lead pipeline, invoice status, and payroll in one dashboard.',
    url: 'https://www.samyojak-erp.com/features/business-intelligence',
  },
}

const items = [
  'Revenue trend charts over time',
  'Lead pipeline visualization by status',
  'Invoice status breakdown — paid, unpaid, overdue',
  'Inventory stock level overview',
  'Payroll breakdown by department',
  'All charts built from your live data, updated automatically',
]

const faqs = [
  { q: 'What does the BI Dashboard show?', a: 'It shows revenue trends, lead pipeline status, invoice status breakdown, inventory levels, and payroll by department, all in one visual dashboard.' },
  { q: 'Is the BI Dashboard updated automatically?', a: 'Yes. Charts reflect your live data across CRM, invoicing, inventory, and HR without manual refreshing or report building.' },
  { q: 'Which plans include the BI Dashboard?', a: 'BI Dashboard access is included starting from the ERP Basic plan; check the pricing page for the exact breakdown by plan.' },
]

export default function BusinessIntelligenceFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'BI Dashboard' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            BI Dashboard
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            See revenue trends, lead pipeline, invoice status, inventory levels, and payroll in one
            visual dashboard, built automatically from your live business data.
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
          <Link href="/features/ai-assistant" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See AI assistant features →</Link>
          <Link href="/solutions/growing-businesses" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for growing businesses →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See your whole business at a glance" subheading="Start viewing your data in minutes." />
      <MarketingFooter />
    </div>
  )
}
