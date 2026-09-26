import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Business Automation Definition — Glossary',
  description: 'Business automation definition — using software to handle repetitive tasks like recurring invoices, alerts, and reporting automatically.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/business-automation' },
  openGraph: {
    title: 'Business Automation Definition — Glossary',
    description: 'Business automation definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/business-automation',
  },
}

export default function GlossaryBusinessAutomationPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'Business Automation' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="Business Automation"
        shortDefinition="Using software to handle repetitive tasks automatically, like recurring invoices, alerts, and reports."
        paragraphs={[
          'Business automation refers to using software to perform repetitive business tasks automatically, reducing the manual effort required to keep operations running.',
          'Common examples include automatically generating recurring invoices on a schedule, sending low-stock alerts, calculating tax rates, and generating reports without manual data compilation.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'Business Intelligence', href: '/glossary/business-intelligence' },
        ]}
      />
      <SeoCtaSection heading="Let automation handle the repetitive work" subheading="Start automating in minutes." />
      <MarketingFooter />
    </div>
  )
}
