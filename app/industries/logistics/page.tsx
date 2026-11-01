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
  title: 'ERP for Logistics Businesses — Samyojak',
  description: 'Manage customers, inventory, projects, and invoicing for your logistics business with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://www.samyojak-erp.com/industries/logistics' },
  openGraph: {
    title: 'ERP for Logistics Businesses — Samyojak',
    description: 'Manage customers, inventory, projects, and invoicing for your logistics business.',
    url: 'https://www.samyojak-erp.com/industries/logistics',
  },
}

const useCases = [
  'Track customer and shipper relationships through the CRM module',
  'Manage warehouse or fleet-related inventory with low-stock alerts',
  'Track shipment or delivery projects on a Kanban board with deadlines',
  'Invoice clients for logistics services with applicable tax rates',
  'Manage driver and staff records through the HR module',
  'Import your existing customer or shipment data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak track shipments in real time?',
    a: 'Samyojak\'s project module tracks shipment or delivery workflows through Kanban stages with deadlines, though it is a business management platform rather than a live GPS tracking system.',
  },
  {
    q: 'Can I manage warehouse inventory?',
    a: 'Yes. The inventory module tracks stock levels, reorder points, and generates free QR codes for tracking items.',
  },
  {
    q: 'Can I import my existing customer or shipment records?',
    a: 'Yes. Export your data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function LogisticsPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Logistics' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Logistics Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Logistics businesses manage customers, inventory, and delivery timelines simultaneously.
            Samyojak brings these into one adaptive workspace built around your existing data.
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
          <SeoUseCaseList heading="How Samyojak helps logistics businesses" items={useCases} />
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
          <Link href="/industries/manufacturing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for manufacturing →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your logistics operations into one workspace"
        subheading="Import your existing customer data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
        }
