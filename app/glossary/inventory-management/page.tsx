import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Inventory Management Definition — Glossary',
  description: 'Inventory management definition — tracking stock levels, reorder points, and product data for a business.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/inventory-management' },
  openGraph: {
    title: 'Inventory Management Definition — Glossary',
    description: 'Inventory management definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/inventory-management',
  },
}

export default function GlossaryInventoryManagementPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'Inventory Management' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="Inventory Management"
        shortDefinition="The process of tracking stock levels, reorder points, and product data for a business."
        paragraphs={[
          'Inventory management refers to tracking the quantity, location, and status of products a business holds, so stock levels are known and reorders can happen before items run out.',
          'In software, this typically includes features like stock counts, low-stock alerts, reorder levels, and identifiers such as SKUs or QR codes for tracking individual products.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'Business Automation', href: '/glossary/business-automation' },
        ]}
      />
      <SeoCtaSection heading="See inventory tracking in action" subheading="Import your product data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
