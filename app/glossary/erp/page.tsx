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
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>What an ERP usually covers</h2>
          <p className="text-base mb-3" style={{ color: '#475569' }}>Typical modules are customers, quotations, invoicing, inventory, HR and projects, all sharing one set of records. The benefit is a single version of the truth: a sale updates stock and revenue together.</p>
          <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Ask: how long until my first real invoice?</p>
        </div>
      </section>
      <SeoCtaSection heading="See ERP in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
