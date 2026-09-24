import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'How Does ERP Work?',
  description: 'How data flows through an ERP system — from entry in CRM or invoicing, through operations, to reporting and business intelligence.',
  alternates: { canonical: 'https://samyojak.vercel.app/learn/how-does-erp-work' },
  openGraph: {
    title: 'How Does ERP Work?',
    description: 'How data flows through an ERP system, from entry to reporting.',
    url: 'https://samyojak.vercel.app/learn/how-does-erp-work',
  },
}

const faqs = [
  { q: 'Where does data first enter an ERP system?', a: 'Data typically enters through a specific module — a new lead in CRM, a new invoice in billing, a new product in inventory — either through manual entry or an import.' },
  { q: 'How does data move between ERP modules?', a: 'Modules are connected through the underlying business entities they share. For example, a converted lead in CRM can become a client on an invoice without re-entering their details.' },
  { q: 'How does reporting work in an ERP?', a: 'Reports pull data from across connected modules — revenue from invoicing, pipeline from CRM, stock levels from inventory — to generate a combined view without manual data gathering.' },
]

export default function HowDoesErpWorkPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'How Does ERP Work?' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            How Does ERP Work?
          </h1>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            An ERP works by connecting the different functions of a business so that data entered in
            one place is available everywhere it's relevant, instead of being isolated in separate
            tools.
          </p>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            The process typically starts with data entry — a new lead added to CRM, a product added to
            inventory, or an employee record added to HR. This data can be entered manually or imported
            in bulk from an existing spreadsheet or system.
          </p>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            From there, the data flows into operational workflows. A lead moves through pipeline
            stages toward conversion. A converted lead can become a client on an invoice without
            re-entering their contact details. A product's stock level updates as sales occur, and low
            stock triggers a reorder alert.
          </p>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Finally, this connected data feeds into reporting and business intelligence — revenue
            trends, tax summaries, pipeline health, and payroll breakdowns are generated automatically
            from the underlying data, rather than requiring manual compilation.
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
          <Link href="/learn/what-is-erp" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is ERP? →</Link>
          <Link href="/features/business-intelligence" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See BI dashboard features →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See connected data in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
