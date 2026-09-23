import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Migrate from Excel to Samyojak',
  description: 'Step-by-step guide to importing your Excel spreadsheets — leads, invoices, inventory, or staff records — into Samyojak without reformatting.',
  alternates: { canonical: 'https://samyojak.vercel.app/migration/from-excel' },
  openGraph: {
    title: 'Migrate from Excel to Samyojak',
    description: 'Import your Excel spreadsheets into Samyojak without reformatting.',
    url: 'https://samyojak.vercel.app/migration/from-excel',
  },
}

const steps = [
  'Open your Excel file and use "Save As" to export it as a CSV file',
  'Sign up for Samyojak and choose the module you want to import into — CRM, Invoices, Inventory, or HR',
  'Upload the CSV file directly — no need to rename columns or match a template first',
  'Preview the imported data to confirm everything looks correct',
  'Confirm the import and your data is ready to use immediately',
]

const faqs = [
  { q: 'Do I need to reformat my Excel columns before importing?', a: 'No. Samyojak\'s adaptive import reads your existing column headers and data as-is, without requiring you to match a predefined field structure.' },
  { q: 'What Excel data can I import?', a: 'You can import leads and contacts into CRM, product data into Inventory, client and billing data into Invoices, and staff records into HR.' },
  { q: 'What if my spreadsheet has extra or unusual columns?', a: 'Samyojak\'s adaptive import is designed to work with your actual spreadsheet structure rather than rejecting unexpected columns.' },
]

export default function MigrateFromExcelPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Migration', href: '/migration' }, { label: 'From Excel' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Migrate from Excel to Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Your spreadsheet data doesn't need to be restructured before it can be useful. Export as
            CSV, upload it, and start working — Samyojak adapts to your existing format.
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
            How to migrate from Excel
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
          <Link href="/features/csv-import-export" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See CSV import features →</Link>
          <Link href="/solutions/replace-spreadsheets" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Replace spreadsheets →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Bring your spreadsheet data as-is" subheading="Import your Excel file and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
