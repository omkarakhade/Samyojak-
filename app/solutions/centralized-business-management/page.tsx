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
  title: 'Centralized Business Management — Samyojak',
  description: 'Manage CRM, invoices, inventory, HR, projects, and reports from one centralized workspace with Samyojak\'s adaptive ERP.',
  alternates: { canonical: 'https://samyojak.vercel.app/solutions/centralized-business-management' },
  openGraph: {
    title: 'Centralized Business Management — Samyojak',
    description: 'Manage CRM, invoices, inventory, HR, projects, and reports from one workspace.',
    url: 'https://samyojak.vercel.app/solutions/centralized-business-management',
  },
}

const useCases = [
  'View leads, invoices, inventory, staff, and projects from a single dashboard',
  'Cross-reference data — see which clients have overdue invoices while reviewing your CRM',
  'Run reports that pull from multiple modules at once',
  'Give your team one login and one interface to learn instead of several',
  'Keep all business data in sync without manual exports and imports between tools',
  'Ask the AI assistant questions that span across your entire business, not just one module',
]

const faqs = [
  {
    q: 'What does "centralized business management" mean in Samyojak?',
    a: 'It means your CRM, invoicing, inventory, HR, projects, and reports all live in one workspace, connected to the same underlying data, rather than being spread across separate disconnected tools.',
  },
  {
    q: 'Can I see data from multiple modules in one view?',
    a: 'Yes. The BI Dashboard shows revenue trends, lead pipeline, invoice status, inventory levels, and payroll breakdowns together, and the AI assistant can answer questions that span multiple modules.',
  },
  {
    q: 'Is centralized management harder to set up than separate tools?',
    a: 'No. Samyojak\'s adaptive import means you bring your existing data in as-is, and the centralized structure is there from the start without extra configuration.',
  },
]

export default function CentralizedBusinessManagementPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Centralized Business Management' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Centralized Business Management
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Scattered data across separate tools makes it hard to see the full picture of your
            business. Samyojak centralizes CRM, invoices, inventory, HR, projects, and reports into
            one connected workspace.
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
          <SeoUseCaseList heading="What centralized management looks like in Samyojak" items={useCases} />
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
          <Link href="/solutions/replace-multiple-tools" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Replace multiple tools →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="See your whole business in one place"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
