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
  title: 'Business Management for Education — Samyojak',
  description: 'Manage staff, billing, and administrative operations for your school or training institute with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/education' },
  openGraph: {
    title: 'Business Management for Education — Samyojak',
    description: 'Manage staff, billing, and administrative operations for your school or training institute.',
    url: 'https://samyojak.vercel.app/industries/education',
  },
}

const useCases = [
  'Manage teaching and administrative staff records through the HR module',
  'Invoice for fees, courses, or services with applicable tax rates',
  'Track prospective student or parent inquiries through the CRM module',
  'Manage hiring for new staff through the recruiting module',
  'Track administrative projects on a Kanban board with deadlines',
  'Import your existing staff or billing data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak manage student records?',
    a: 'Samyojak is a business operations platform focused on the administrative side — staff, billing, and inquiries — rather than a dedicated student information system.',
  },
  {
    q: 'Can Samyojak track inquiries from prospective students or parents?',
    a: 'Yes. The CRM module can track inquiries, follow-ups, and status through to enrollment as leads.',
  },
  {
    q: 'Can I import my existing staff or billing records?',
    a: 'Yes. Export your data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function EducationPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Education' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Business Management for Education
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Schools and training institutes handle staff, fee collection, and inquiries alongside
            teaching. Samyojak keeps the administrative side organized in one adaptive workspace.
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
          <SeoUseCaseList heading="How Samyojak helps education businesses" items={useCases} />
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
          <Link href="/industries/healthcare" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Business management for healthcare →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Simplify your institution's administrative operations"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
