import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'CRM Definition — Glossary',
  description: 'CRM (Customer Relationship Management) definition — software that tracks leads, customers, and sales pipeline stages.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/crm' },
  openGraph: {
    title: 'CRM Definition — Glossary',
    description: 'CRM definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/crm',
  },
}

export default function GlossaryCrmPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'CRM' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="CRM"
        shortDefinition="Customer Relationship Management — software that tracks leads, customers, and interactions over time."
        paragraphs={[
          'CRM stands for Customer Relationship Management. It refers to software used to track leads, customers, and the interactions a business has with them, typically organized into pipeline stages such as New, Contacted, Converted, or Lost.',
          'CRM can be standalone software or one module within a broader ERP system, often connected to invoicing so a converted lead can move directly into billing.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'Lead Management', href: '/glossary/lead-management' },
        ]}
      />
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>A simple pipeline example</h2>
          <p className="text-base mb-3" style={{ color: '#475569' }}>A lead enters as New, becomes Contacted after your first reply, then Converted when they accept a quotation, or Lost if they go quiet. Reviewing each stage weekly shows where leads stall and what to follow up on.</p>
          <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Ask: can a converted lead turn into an invoice without retyping?</p>
        </div>
      </section>
      <SeoCtaSection heading="See CRM lead scoring in action" subheading="Import your leads and start tracking in minutes." />
      <MarketingFooter />
    </div>
  )
}
