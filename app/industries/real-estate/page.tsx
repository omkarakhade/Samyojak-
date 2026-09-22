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
  title: 'ERP for Real Estate Businesses — Samyojak',
  description: 'Manage leads, client relationships, projects, and invoicing for your real estate business with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/real-estate' },
  openGraph: {
    title: 'ERP for Real Estate Businesses — Samyojak',
    description: 'Manage leads, client relationships, projects, and invoicing for your real estate business.',
    url: 'https://samyojak.vercel.app/industries/real-estate',
  },
}

const useCases = [
  'Track property leads and buyer or renter inquiries with AI lead scoring',
  'Set follow-up reminders so no inquiry goes cold',
  'Track property-related projects — renovations, listings, closings — on a Kanban board',
  'Send quotations and invoices for commissions or service fees',
  'Manage your agent or staff team through the HR module',
  'Import your existing lead or client data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak track property leads?',
    a: 'Yes. The CRM module includes AI-powered lead scoring, follow-up reminders, and pipeline stages suited to tracking buyer, renter, or seller inquiries.',
  },
  {
    q: 'Can I manage multiple property deals at once?',
    a: 'Yes. The project management module lets you track each deal or listing on a Kanban board with deadlines and progress.',
  },
  {
    q: 'Can I import my existing lead list?',
    a: 'Yes. Export your leads as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function RealEstatePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Real Estate' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Real Estate Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Real estate runs on leads, follow-ups, and deal timelines. Samyojak's CRM and project
            tracking keep every inquiry and deal organized in one adaptive workspace.
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
          <SeoUseCaseList heading="How Samyojak helps real estate businesses" items={useCases} />
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
          <Link href="/features/crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See CRM features →
          </Link>
          <Link href="/industries/construction" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for construction →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Keep every lead and deal organized"
        subheading="Import your existing lead data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
