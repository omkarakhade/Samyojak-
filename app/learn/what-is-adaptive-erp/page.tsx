import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'What Is Adaptive ERP?',
  description: 'Adaptive ERP explained — how it differs from traditional module-based ERP systems by adjusting to your existing data instead of forcing a predefined structure.',
  alternates: { canonical: 'https://www.samyojak-erp.com/learn/what-is-adaptive-erp' },
  openGraph: {
    title: 'What Is Adaptive ERP?',
    description: 'How adaptive ERP differs from traditional, module-based ERP.',
    url: 'https://www.samyojak-erp.com/learn/what-is-adaptive-erp',
  },
}

const faqs = [
  { q: 'How is adaptive ERP different from traditional ERP?', a: 'Traditional ERP typically requires you to reformat your existing data to match a predefined schema before it can be imported. Adaptive ERP reads your data structure as-is and organizes around it instead.' },
  { q: 'Does adaptive ERP mean fewer features?', a: 'No. Adaptive ERP refers specifically to how data import and setup work, not the depth of features available once your data is in the system.' },
  { q: 'Why does adaptive ERP reduce setup time?', a: 'Since column mapping and schema matching is one of the most time-consuming parts of ERP implementation, removing that requirement allows a business to be operational much faster.' },
]

export default function WhatIsAdaptiveErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'What Is Adaptive ERP?' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            What Is Adaptive ERP?
          </h1>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            Adaptive ERP refers to a business management system that adjusts to the structure of your
            existing data, rather than requiring you to restructure your data to fit a predefined
            system schema first.
          </p>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            In a traditional ERP, importing a spreadsheet of leads or products often means mapping each
            of your columns to a specific predefined field, sometimes column by column. If your
            spreadsheet has a column the system doesn't expect, it may be rejected or ignored entirely.
          </p>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            An adaptive ERP reads your CSV export as-is, preserving your original column names and
            every row of data, and organizes the system around that structure. This significantly
            reduces the setup time typically associated with ERP implementation, since data migration
            no longer requires manual reformatting.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3">
          <Link href="/best/adaptive-erp" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Best adaptive ERP →</Link>
          <Link href="/features/csv-import-export" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See CSV import features →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See adaptive import in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
