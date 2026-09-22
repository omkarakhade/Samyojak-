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
  title: 'ERP for Finance Businesses — Samyojak',
  description: 'Manage clients, invoicing, and reporting for your finance or accounting business with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries/finance' },
  openGraph: {
    title: 'ERP for Finance Businesses — Samyojak',
    description: 'Manage clients, invoicing, and reporting for your finance or accounting business.',
    url: 'https://samyojak.vercel.app/industries/finance',
  },
}

const useCases = [
  'Track client relationships and inquiries through the CRM module',
  'Send quotations for services and convert to invoices',
  'Generate tax reports and revenue analytics through the reports module',
  'Set up recurring invoices for retainer or subscription clients',
  'Manage your team through the HR module',
  'Import your existing client or billing data without reformatting',
]

const faqs = [
  {
    q: 'Can Samyojak generate tax reports?',
    a: 'Yes. The reports module generates tax reports, monthly revenue summaries, and breakdowns by tax rate across your invoicing data.',
  },
  {
    q: 'Can I bill clients on a recurring basis?',
    a: 'Yes. The recurring invoices module supports weekly, monthly, and yearly automatic billing schedules for retainer clients.',
  },
  {
    q: 'Can I import my existing client billing records?',
    a: 'Yes. Export your data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.',
  },
]

export default function FinancePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Finance' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Finance Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Finance and accounting businesses need accurate invoicing, client tracking, and reporting.
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
          <SeoUseCaseList heading="How Samyojak helps finance businesses" items={useCases} />
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
          <Link href="/features/reports" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See reporting features →
          </Link>
          <Link href="/industries/agencies" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for agencies →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your finance operations into one workspace"
        subheading="Import your existing client data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
