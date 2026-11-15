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
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Where it helps most</h2>
          <p className="text-base mb-3" style={{ color: '#475569' }}>Repeated tasks are the best place to start: recurring invoices, payment reminders, low-stock alerts and daily summaries. Each saves a few minutes, and together they save hours each week while cutting typing mistakes.</p>
          <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Ask: which three tasks do I repeat every week?</p>
        </div>
      </section>
      <SeoCtaSection heading="Let automation handle the repetitive work" subheading="Start automating in minutes." />
      <MarketingFooter />
    </div>
  )
}
