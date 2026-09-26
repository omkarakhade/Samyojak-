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
  title: 'ERP for Small Business — Samyojak',
  description: 'An adaptive ERP built for small business budgets and timelines. CRM, invoicing, inventory, HR, and projects in one workspace, with weekly plans and no per-user fees.',
  alternates: { canonical: 'https://www.samyojak-erp.com/solutions/small-business' },
  openGraph: {
    title: 'ERP for Small Business — Samyojak',
    description: 'An adaptive ERP built for small business budgets and timelines.',
    url: 'https://www.samyojak-erp.com/solutions/small-business',
  },
}

const useCases = [
  'Start with weekly plans instead of committing to a long annual contract',
  'No per-user fees, regardless of how many people on your team use it',
  'Import your existing spreadsheet or CRM data without reformatting',
  'Set up CRM, invoicing, and inventory in minutes, not weeks',
  'Send tax-compliant invoices with GST, VAT, or other applicable rates built in',
  'Scale up to HR, projects, and AI features as your business grows',
]

const faqs = [
  {
    q: 'Is Samyojak affordable for a small business?',
    a: 'Yes. Samyojak offers weekly, monthly, and yearly plans with flat pricing regardless of team size, starting with a low weekly rate. Pricing is shown automatically based on your region.',
  },
  {
    q: 'Do I need technical knowledge to set up Samyojak?',
    a: 'No. Samyojak is designed to be usable without a developer or consultant. Import your existing data and start using the CRM, invoicing, and inventory modules directly.',
  },
  {
    q: 'Can I start small and add more modules later?',
    a: 'Yes. Samyojak\'s plans are structured so you can start with CRM and invoicing, then add HR, projects, and AI business intelligence as your business grows.',
  },
]

export default function SmallBusinessPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Small Business' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Small Business
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Small businesses need software that fits their budget and doesn't require weeks of setup.
            Samyojak brings CRM, invoicing, inventory, and more into one adaptive workspace, starting
            with weekly plans and no per-user fees.
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
          <SeoUseCaseList heading="Why small businesses choose Samyojak" items={useCases} />
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
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See pricing →
          </Link>
          <Link href="/solutions/startups" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Business management for startups →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Built for how small businesses actually work"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
          }
