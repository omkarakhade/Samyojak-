import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Migrate from Google Sheets to Samyojak',
  description: 'Step-by-step guide to exporting your Google Sheets and importing them into Samyojak without reformatting.',
  alternates: { canonical: 'https://samyojak.vercel.app/migration/from-google-sheets' },
  openGraph: {
    title: 'Migrate from Google Sheets to Samyojak',
    description: 'Import directly from your Google Sheets exports, no reformatting needed.',
    url: 'https://samyojak.vercel.app/migration/from-google-sheets',
  },
}

const steps = [
  'Open your Google Sheet and go to File → Download → Comma Separated Values (.csv)',
  'Sign up for Samyojak and select the module matching your data — CRM, Invoices, Inventory, or HR',
  'Upload the downloaded CSV file directly',
  'Preview the imported data to confirm it looks correct',
  'Confirm — your sheet data is now organized in Samyojak',
]

const faqs = [
  { q: 'Do I need a Google account to export my sheet?', a: 'You just need access to the Google Sheet itself to download it as a CSV — no special permissions beyond normal viewing or editing access are required.' },
  { q: 'Can I import multiple tabs from one Google Sheet?', a: 'Each tab needs to be exported and imported separately, since a CSV export only includes one sheet tab at a time.' },
  { q: 'Will formulas in my Google Sheet cause import issues?', a: 'No. When you export to CSV, formulas are converted to their calculated values, so the import works with the final displayed data.' },
]

export default function MigrateFromGoogleSheetsPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Migration', href: '/migration' }, { label: 'From Google Sheets' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Migrate from Google Sheets to Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Your Google Sheets data can move into Samyojak in minutes — export as CSV, upload, and
            you're done. No reformatting, no lost formulas' final values.
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
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            How to migrate from Google Sheets
          </h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: '#8B5CF6' }}>
                  {i + 1}
                </span>
                <span className="text-sm pt-0.5" style={{ color: '#475569' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/migration/from-excel" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Migrate from Excel →</Link>
          <Link href="/solutions/replace-spreadsheets" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Replace spreadsheets →</Link>
        </div>
      </section>

      <SeoCtaSection heading="From Google Sheets to a real workspace" subheading="Import your sheet data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
