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
  title: 'ERP for Growing Businesses — Samyojak',
  description: 'Manage more clients, more staff, and more data without breaking your workflow. Samyojak scales from CRM and invoicing to HR, projects, and AI as you grow.',
  alternates: { canonical: 'https://samyojak.vercel.app/solutions/growing-businesses' },
  openGraph: {
    title: 'ERP for Growing Businesses — Samyojak',
    description: 'Manage more clients, more staff, and more data without breaking your workflow.',
    url: 'https://samyojak.vercel.app/solutions/growing-businesses',
  },
}

const useCases = [
  'Add HR and payroll management as your team grows',
  'Track more projects simultaneously with the Kanban board',
  'Set up recurring invoices as you take on retainer clients',
  'Use BI dashboard charts to monitor revenue, pipeline, and payroll trends',
  'Get AI business intelligence answers about your live data as complexity increases',
  'Keep all your growing data in one place instead of across disconnected tools',
]

const faqs = [
  {
    q: 'When should a growing business upgrade its ERP plan?',
    a: 'As you add employees, take on more clients, or need deeper reporting, moving from ERP Basic to Business or Complete ERP unlocks HR, project management, and AI business intelligence.',
  },
  {
    q: 'Can Samyojak handle more data as my business grows?',
    a: 'Yes. Samyojak\'s modules are built to scale with growing lead volumes, invoice counts, inventory items, and staff records without requiring a system migration.',
  },
  {
    q: 'Does Samyojak provide reporting as my business gets more complex?',
    a: 'Yes. The BI Dashboard and Reports modules provide revenue trends, pipeline health, payroll breakdowns, and tax reports across all your data.',
  },
]

export default function GrowingBusinessesPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Growing Businesses' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Growing Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            As your business grows, so does the complexity of managing clients, staff, and data.
            Samyojak scales with you — from CRM and invoicing to HR, projects, and AI insights —
            all in one workspace.
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
          <SeoUseCaseList heading="How Samyojak scales with growing businesses" items={useCases} />
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
          <Link href="/features/business-intelligence" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See BI dashboard features →
          </Link>
          <Link href="/solutions/small-business" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for small business →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Scale without switching systems"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
