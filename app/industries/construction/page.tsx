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
  title: 'ERP for Construction Businesses — Samyojak',
  description: 'Manage projects, materials, clients, and invoicing for your construction business with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/construction' },
  openGraph: {
    title: 'ERP for Construction Businesses — Samyojak',
    description: 'Manage projects, materials, clients, and invoicing for your construction business.',
    url: 'https://samyojak.vercel.app/industries/construction',
  },
}

const useCases = [
  'Track ongoing projects on a Kanban board with deadlines and progress',
  'Manage material and supply inventory with low-stock alerts',
  'Track client and contractor relationships through the CRM module',
  'Send quotations for jobs and convert accepted quotes to invoices',
  'Manage crew and staff records through the HR module',
  'Import your existing project or client data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak track construction project timelines?',
    a: 'Yes. The project management module provides a Kanban board with Planning, In Progress, Review, and Done stages, along with deadline tracking.',
  },
  {
    q: 'Can I track building materials as inventory?',
    a: 'Yes. The inventory module tracks stock levels and reorder points for materials, with free QR code generation for tracking.',
  },
  {
    q: 'Can I send project quotes before invoicing?',
    a: 'Yes. Build a quotation, send it to the client, and convert it to an invoice once the job is accepted.',
  },
]

export default function ConstructionPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Construction' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Construction Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Construction businesses juggle project timelines, materials, client relationships, and
            invoicing at once. Samyojak brings these into one adaptive workspace built around your
            existing data.
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
          <SeoUseCaseList heading="How Samyojak helps construction businesses" items={useCases} />
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
          <Link href="/features/projects" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See project management features →
          </Link>
          <Link href="/industries/real-estate" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for real estate →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your construction operations into one workspace"
        subheading="Import your existing project data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
      }
