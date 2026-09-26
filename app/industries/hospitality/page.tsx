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
  title: 'ERP for Hospitality Businesses — Samyojak',
  description: 'Manage staff, inventory, customer relationships, and invoicing for your hospitality business with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://www.samyojak-erp.com/industries/hospitality' },
  openGraph: {
    title: 'ERP for Hospitality Businesses — Samyojak',
    description: 'Manage staff, inventory, customer relationships, and invoicing for your hospitality business.',
    url: 'https://www.samyojak-erp.com/industries/hospitality',
  },
}

const useCases = [
  'Manage supply and inventory with low-stock alerts and free QR codes',
  'Track guest or corporate client relationships through the CRM module',
  'Manage staff scheduling and payroll through the HR module',
  'Invoice corporate clients or event bookings with applicable tax rates',
  'Track renovation, event, or operational projects on a Kanban board',
  'Import your existing staff or supplier data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak manage hotel or restaurant inventory?',
    a: 'Yes. The inventory module tracks stock levels and reorder points for supplies, with free QR code generation for tracking.',
  },
  {
    q: 'Can I track corporate client bookings?',
    a: 'Yes. The CRM module tracks client relationships and inquiries, and the invoicing module handles billing for bookings or events.',
  },
  {
    q: 'Can I import my existing staff records?',
    a: 'Yes. Export your data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function HospitalityPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Hospitality' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Hospitality Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Hospitality businesses manage staff, supplies, and guest relationships around the clock.
            Samyojak keeps these operations organized in one adaptive workspace.
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
          <SeoUseCaseList heading="How Samyojak helps hospitality businesses" items={useCases} />
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
          <Link href="/features/hr" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See HR features →
          </Link>
          <Link href="/industries/services" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for service businesses →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your hospitality operations into one workspace"
        subheading="Import your existing staff and supplier data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
