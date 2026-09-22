import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoUseCaseList from '@/components/SeoUseCaseList'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP for Manufacturing Businesses — Samyojak',
  description: 'Manage inventory, suppliers, invoicing, and projects for your manufacturing business with Samyojak\'s adaptive ERP. Import your existing data and get running in minutes.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/manufacturing' },
  openGraph: {
    title: 'ERP for Manufacturing Businesses — Samyojak',
    description: 'Manage inventory, suppliers, invoicing, and projects for your manufacturing business.',
    url: 'https://samyojak.vercel.app/industries/manufacturing',
  },
}

const useCases = [
  'Track raw material and finished goods inventory with free auto-generated QR codes',
  'Set reorder levels and get low-stock alerts before you run out',
  'Manage supplier and customer relationships through the CRM module',
  'Invoice clients with GST, VAT, or other applicable tax rates built in',
  'Track production-related projects on a Kanban board with deadlines',
  'Import your existing inventory or customer data from spreadsheets without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak handle manufacturing inventory?',
    a: 'Yes. Samyojak\'s inventory module tracks stock levels, reorder points, and generates free QR codes for products, which many manufacturing businesses use for tracking materials and finished goods.',
  },
  {
    q: 'Does Samyojak support supplier management?',
    a: 'Supplier and customer relationships can be tracked through Samyojak\'s CRM module, with contact details, communication history, and status tracking.',
  },
  {
    q: 'Can I import my existing manufacturing data into Samyojak?',
    a: 'Yes. Export your current inventory, customer, or supplier data as a CSV and Samyojak\'s adaptive import will accept it without requiring you to restructure it first.',
  },
]

export default function ManufacturingPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Manufacturing' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Manufacturing Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Manufacturing businesses juggle inventory, suppliers, production timelines, and invoicing
            simultaneously. Samyojak brings these into one adaptive workspace, importing your existing
            data without forcing you to restructure it first.
          </p>
          <Link href="/signup"
            className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            Start Trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <SeoUseCaseList heading="How Samyojak helps manufacturing businesses" items={useCases} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Frequently asked questions
          </h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/features/inventory" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See inventory features →
          </Link>
          <Link href="/industries/retail" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for retail →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your manufacturing operations into one workspace"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
