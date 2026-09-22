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
  title: 'Business Management for Healthcare — Samyojak',
  description: 'Manage billing, staff, and administrative operations for your healthcare business with Samyojak. Adaptive data import, invoicing, and HR management included.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/healthcare' },
  openGraph: {
    title: 'Business Management for Healthcare — Samyojak',
    description: 'Manage billing, staff, and administrative operations for your healthcare business.',
    url: 'https://samyojak.vercel.app/industries/healthcare',
  },
}

const useCases = [
  'Manage staff records, roles, and payroll through the HR module',
  'Create and send invoices for services with applicable tax rates',
  'Track supplier or vendor relationships through the CRM module',
  'Manage recruiting for new hires from application through hiring',
  'Track administrative projects — renovations, compliance tasks, or equipment procurement',
  'Import your existing staff or billing data without reformatting',
]

const faqs = [
  {
    q: 'Does Samyojak handle patient records?',
    a: 'Samyojak is a business operations platform — it is not a clinical patient record system. It supports the administrative and business side of running a healthcare practice, including billing, staff, and vendor management.',
  },
  {
    q: 'Can Samyojak manage clinic staff and payroll?',
    a: 'Yes. Samyojak\'s HR module tracks employee records, roles, departments, and payroll, and the recruiting module manages hiring.',
  },
  {
    q: 'Can I import my existing administrative data?',
    a: 'Yes. Export your staff, billing, or vendor data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function HealthcarePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Healthcare' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Business Management for Healthcare
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Running a healthcare practice involves more than patient care — billing, staffing, and
            vendor relationships all need managing. Samyojak handles the administrative and business
            side in one adaptive workspace.
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
          <SeoUseCaseList heading="How Samyojak helps healthcare businesses" items={useCases} />
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
          <Link href="/industries/education" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Business management for education →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Simplify your practice's administrative operations"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
