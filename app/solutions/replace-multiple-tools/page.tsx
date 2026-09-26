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
  title: 'Replace Multiple Business Tools — Samyojak',
  description: 'Stop juggling separate apps for CRM, invoicing, inventory, and HR. Samyojak consolidates them into one adaptive workspace.',
  alternates: { canonical: 'https://www.samyojak-erp.com/solutions/replace-multiple-tools' },
  openGraph: {
    title: 'Replace Multiple Business Tools — Samyojak',
    description: 'Stop juggling separate apps for CRM, invoicing, inventory, and HR.',
    url: 'https://www.samyojak-erp.com/solutions/replace-multiple-tools',
  },
}

const useCases = [
  'Manage CRM, invoicing, inventory, HR, and projects with one login instead of five',
  'Stop paying separate subscriptions for each disconnected tool',
  'Avoid manually re-entering the same customer data across multiple apps',
  'Get a single BI dashboard instead of checking metrics in different places',
  'Import your data from whichever tools you currently use into one workspace',
  'Reduce the training overhead of teaching your team multiple systems',
]

const faqs = [
  {
    q: 'What kinds of separate tools does Samyojak typically replace?',
    a: 'Businesses commonly consolidate a standalone CRM, a separate invoicing tool, a spreadsheet for inventory, and a different app for project tracking into Samyojak\'s single workspace.',
  },
  {
    q: 'Can I import data from multiple different tools at once?',
    a: 'Yes. You can import CSV exports from each of your existing tools into the relevant Samyojak module — CRM data into CRM, inventory data into Inventory, and so on.',
  },
  {
    q: 'Will using one tool instead of several save money?',
    a: 'Samyojak\'s flat-rate plans with no per-user fees often cost less than maintaining multiple separate subscriptions, though the exact savings depend on your current tool stack.',
  },
]

export default function ReplaceMultipleToolsPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Replace Multiple Tools' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Replace Multiple Business Tools
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Juggling a separate CRM, invoicing tool, spreadsheet, and project tracker means duplicate
            data entry and scattered reporting. Samyojak consolidates these into one adaptive workspace.
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
          <SeoUseCaseList heading="What changes when you consolidate tools" items={useCases} />
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
          <Link href="/solutions/centralized-business-management" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Centralized business management →
          </Link>
          <Link href="/compare/erp-vs-multiple-tools" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP vs multiple tools →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="One workspace instead of five logins"
        subheading="Import your data from your current tools and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
