import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP Definition — Glossary',
  description: 'ERP (Enterprise Resource Planning) definition — software that centralizes core business functions like CRM, invoicing, inventory, and HR.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/erp' },
  openGraph: {
    title: 'ERP Definition — Glossary',
    description: 'ERP definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/erp',
  },
}

export default function GlossaryErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'ERP' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="ERP"
        shortDefinition="Enterprise Resource Planning — software that centralizes core business functions into one connected system."
        paragraphs={[
          'ERP stands for Enterprise Resource Planning. It refers to a category of software that combines core business functions — such as sales, invoicing, inventory, HR, and project management — into a single connected platform.',
          'Rather than managing each function with separate tools or spreadsheets, an ERP allows data to flow between modules automatically, giving a business one consistent source of truth.',
        ]}
        related={[
          { label: 'CRM', href: '/glossary/crm' },
          { label: 'Adaptive ERP', href: '/glossary/adaptive-erp' },
          { label: 'Business Operating System', href: '/glossary/business-operating-system' },
        ]}
      />
      <SeoCtaSection heading="See ERP in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
