import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'CRM Definition — Glossary',
  description: 'CRM (Customer Relationship Management) definition — software that tracks leads, customers, and sales pipeline stages.',
  alternates: { canonical: 'https://samyojak.vercel.app/glossary/crm' },
  openGraph: {
    title: 'CRM Definition — Glossary',
    description: 'CRM definition and explanation.',
    url: 'https://samyojak.vercel.app/glossary/crm',
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
      <SeoCtaSection heading="See CRM lead scoring in action" subheading="Import your leads and start tracking in minutes." />
      <MarketingFooter />
    </div>
  )
}
