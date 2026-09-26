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
  title: 'ERP for Service Businesses — Samyojak',
  description: 'Manage clients, projects, and invoicing for your service business with Samyojak\'s adaptive ERP. CRM, project tracking, and tax-compliant invoicing in one workspace.',
  alternates: { canonical: 'https://www.samyojak-erp.com/industries/services' },
  openGraph: {
    title: 'ERP for Service Businesses — Samyojak',
    description: 'Manage clients, projects, and invoicing for your service business.',
    url: 'https://www.samyojak-erp.com/industries/services',
  },
}

const useCases = [
  'Track client relationships and leads through the CRM module',
  'Send professional quotations before starting work, then convert to invoices',
  'Track service delivery projects on a Kanban board with deadlines',
  'Invoice clients with applicable tax rates built in',
  'Manage your team through the HR module',
  'Import your existing client or project data without reformatting',
]

const faqs = [
  {
    q: 'What kinds of service businesses does Samyojak support?',
    a: 'Samyojak\'s CRM, quotations, invoicing, and project modules suit consultants, agencies, contractors, and any business that delivers services to clients rather than physical products.',
  },
  {
    q: 'Can I send quotes before invoicing a client?',
    a: 'Yes. Samyojak\'s quotations module lets you build a quote, send it, and convert it to an invoice once accepted.',
  },
  {
    q: 'Can I track multiple client projects at once?',
    a: 'Yes. The project management module provides a Kanban board with Planning, In Progress, Review, and Done stages for each client engagement.',
  },
]

export default function ServicesPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Services' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Service Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Service businesses run on client relationships, project delivery, and accurate invoicing.
            Samyojak brings quotations, CRM, projects, and invoicing into one adaptive workspace.
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
          <SeoUseCaseList heading="How Samyojak helps service businesses" items={useCases} />
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
          <Link href="/features/quotations" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See quotation features →
          </Link>
          <Link href="/industries/agencies" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for agencies →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your service business into one workspace"
        subheading="Import your existing client data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
