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
  title: 'Replace Spreadsheets — Samyojak',
  description: 'Move your CRM, invoicing, and inventory tracking out of Excel spreadsheets and into Samyojak, without losing any of your existing data.',
  alternates: { canonical: 'https://www.samyojak-erp.com/solutions/replace-spreadsheets' },
  openGraph: {
    title: 'Replace Spreadsheets — Samyojak',
    description: 'Move your CRM, invoicing, and inventory tracking out of Excel and into one system.',
    url: 'https://www.samyojak-erp.com/solutions/replace-spreadsheets',
  },
}

const useCases = [
  'Import your existing Excel or Google Sheets data directly, without reformatting',
  'Replace manual lead tracking with CRM pipeline stages and AI lead scoring',
  'Replace manual invoice numbering with automated, tax-compliant invoicing',
  'Replace manual stock counts with real-time inventory tracking and low-stock alerts',
  'Get automatic reports instead of manually building pivot tables',
  'Access your business data from any device instead of a single spreadsheet file',
]

const faqs = [
  {
    q: 'Will I lose data when moving from spreadsheets to Samyojak?',
    a: 'No. Samyojak\'s adaptive import accepts your CSV export from Excel or Google Sheets and preserves every column and row exactly as it was, without requiring you to restructure it first.',
  },
  {
    q: 'What are the main reasons businesses move off spreadsheets?',
    a: 'Common reasons include multiple people editing the same file leading to conflicts, no automated reminders or alerts, manual invoice creation being time-consuming, and no centralized reporting.',
  },
  {
    q: 'Can I keep using spreadsheets alongside Samyojak during the transition?',
    a: 'You can export data from Samyojak back to CSV at any time, so you are not locked into an all-or-nothing switch.',
  },
]

export default function ReplaceSpreadsheetsPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Replace Spreadsheets' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Replace Spreadsheets With Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Spreadsheets work until they don't — version conflicts, manual formulas, and no automated
            reminders slow you down. Samyojak imports your existing spreadsheet data as-is and gives
            you CRM, invoicing, and inventory in one adaptive workspace.
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
          <SeoUseCaseList heading="What changes when you leave spreadsheets behind" items={useCases} />
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
          <Link href="/features/csv-import-export" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See CSV import features →
          </Link>
          <Link href="/migration/from-excel" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Migrating from Excel →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Leave spreadsheet chaos behind"
        subheading="Import your Excel data as-is and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
