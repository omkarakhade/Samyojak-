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
  title: 'ERP for Agencies — Samyojak',
  description: 'Manage clients, projects, invoicing, and team for your agency with Samyojak\'s adaptive ERP. CRM, quotations, project tracking, and tax-compliant invoicing in one workspace.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/agencies' },
  openGraph: {
    title: 'ERP for Agencies — Samyojak',
    description: 'Manage clients, projects, invoicing, and team for your agency.',
    url: 'https://samyojak.vercel.app/industries/agencies',
  },
}

const useCases = [
  'Track client leads and relationships through the CRM module',
  'Send quotations for new projects and convert to invoices once accepted',
  'Track client work on a Kanban board — Planning, In Progress, Review, Done',
  'Set up recurring invoices for retainer clients',
  'Manage your team through the HR module',
  'Import your existing client or project data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak manage multiple client accounts at once?',
    a: 'Yes. CRM, projects, and invoicing are all built to track multiple clients simultaneously, with each project trackable independently on the Kanban board.',
  },
  {
    q: 'Can I set up recurring billing for retainer clients?',
    a: 'Yes. The recurring invoices module supports weekly, monthly, and yearly automatic billing schedules.',
  },
  {
    q: 'Can I import my existing client list?',
    a: 'Yes. Export your data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function AgenciesPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Agencies' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Agencies
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Agencies juggle multiple client accounts, project deadlines, and retainer billing at once.
            Samyojak brings CRM, quotations, projects, and recurring invoicing into one workspace.
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
          <SeoUseCaseList heading="How Samyojak helps agencies" items={useCases} />
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
          <Link href="/features/recurring-invoices" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See recurring invoice features →
          </Link>
          <Link href="/industries/services" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for service businesses →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your agency's client work into one workspace"
        subheading="Import your existing client data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
