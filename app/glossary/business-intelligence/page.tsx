import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Business Intelligence Definition — Glossary',
  description: 'Business intelligence definition — analyzing business data to generate insights like revenue trends, pipeline health, and reporting.',
  alternates: { canonical: 'https://samyojak.vercel.app/glossary/business-intelligence' },
  openGraph: {
    title: 'Business Intelligence Definition — Glossary',
    description: 'Business intelligence definition and explanation.',
    url: 'https://samyojak.vercel.app/glossary/business-intelligence',
  },
}

export default function GlossaryBusinessIntelligencePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'Business Intelligence' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="Business Intelligence"
        shortDefinition="Analyzing business data to generate insights like revenue trends, pipeline health, and reporting."
        paragraphs={[
          'Business intelligence, often shortened to BI, refers to the process of analyzing business data to surface insights — such as revenue trends over time, sales pipeline health, or inventory levels — that support decision-making.',
          'In software, BI often takes the form of dashboards and charts built automatically from underlying data, and increasingly includes AI-powered tools that can answer specific questions about a business\'s live data.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'Business Automation', href: '/glossary/business-automation' },
        ]}
      />
      <SeoCtaSection heading="See your data as clear insights" subheading="Start viewing your business intelligence in minutes." />
      <MarketingFooter />
    </div>
  )
}
