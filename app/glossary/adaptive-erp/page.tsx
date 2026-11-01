import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Adaptive ERP Definition — Glossary',
  description: 'Adaptive ERP definition — an ERP that adjusts to a business\'s existing data structure instead of requiring reformatting.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/adaptive-erp' },
  openGraph: {
    title: 'Adaptive ERP Definition — Glossary',
    description: 'Adaptive ERP definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/adaptive-erp',
  },
}

export default function GlossaryAdaptiveErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'Adaptive ERP' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="Adaptive ERP"
        shortDefinition="An ERP that adjusts to a business's existing data structure instead of requiring it to be reformatted first."
        paragraphs={[
          'Adaptive ERP describes a type of ERP system that reads and organizes around a business\'s existing data structure, rather than requiring the data to be reformatted to match a predefined schema before import.',
          'This typically means a CSV export can be uploaded directly, with column names and row data preserved as-is, significantly reducing the time required for setup and data migration compared to traditional ERP systems.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'SaaS', href: '/glossary/saas' },
        ]}
      />
      <SeoCtaSection heading="See adaptive import in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
