import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoComparisonTable from '@/components/SeoComparisonTable'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP vs CRM — What\'s the Difference?',
  description: 'ERP and CRM explained side by side — what each covers, how they overlap, and when a business needs one, the other, or both.',
  alternates: { canonical: 'https://samyojak.vercel.app/learn/erp-vs-crm' },
  openGraph: {
    title: 'ERP vs CRM — What\'s the Difference?',
    description: 'ERP and CRM explained side by side.',
    url: 'https://samyojak.vercel.app/learn/erp-vs-crm',
  },
}

const rows = [
  { feature: 'Primary focus', samyojak: 'Whole business operations', competitor: 'Customer and lead relationships' },
  { feature: 'Typical modules', samyojak: 'CRM, invoicing, inventory, HR, projects', competitor: 'Leads, contacts, pipeline, follow-ups' },
  { feature: 'Used by', samyojak: 'Whole business — sales, finance, operations', competitor: 'Primarily sales teams' },
  { feature: 'Data scope', samyojak: 'Customers, products, staff, finances', competitor: 'Customers and leads only' },
  { feature: 'Can exist standalone', samyojak: 'Yes', competitor: 'Yes, or as one ERP module' },
]

const faqs = [
  { q: 'Is CRM part of ERP or separate?', a: 'CRM can exist as standalone software, but it is also commonly included as one module within a broader ERP system alongside invoicing, inventory, and HR.' },
  { q: 'Does a small business need ERP or just CRM?', a: 'A business focused only on sales and lead tracking may only need CRM. A business also managing invoicing, inventory, or staff typically benefits from the broader coverage of an ERP.' },
  { q: 'Can I upgrade from CRM-only to full ERP later?', a: 'Yes, if the platform is built with expandable modules. Starting with CRM and adding invoicing, inventory, or HR later is common as a business grows.' },
]

export default function ErpVsCrmPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'ERP vs CRM' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP vs CRM
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            ERP and CRM are related but not the same thing. CRM focuses specifically on customer and
            lead relationships, while ERP covers the broader set of operations across a business.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Side-by-side comparison</h2>
          <SeoComparisonTable competitorName="CRM Alone" rows={rows} />
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/learn/what-is-erp" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is ERP? →</Link>
          <Link href="/learn/what-is-crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is CRM? →</Link>
        </div>
      </section>

      <SeoCtaSection heading="CRM and ERP together, in one workspace" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
