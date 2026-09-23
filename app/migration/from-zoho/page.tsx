import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Migrate from Zoho to Samyojak',
  description: 'Step-by-step guide to exporting your Zoho CRM and Zoho Books data and importing it into Samyojak without reformatting.',
  alternates: { canonical: 'https://samyojak.vercel.app/migration/from-zoho' },
  openGraph: {
    title: 'Migrate from Zoho to Samyojak',
    description: 'Move your Zoho CRM and Books data into one unified workspace.',
    url: 'https://samyojak.vercel.app/migration/from-zoho',
  },
}

const steps = [
  'In Zoho CRM or Zoho Books, go to the module you want to export — leads, contacts, or invoices',
  'Use Zoho\'s built-in Export function to download a CSV file',
  'Sign up for Samyojak and select the matching module for your import',
  'Upload the Zoho CSV export directly — no field mapping required',
  'Preview and confirm — your Zoho data is now in Samyojak',
]

const faqs = [
  { q: 'Can I migrate both Zoho CRM and Zoho Books data?', a: 'Yes. Export each separately as CSV — CRM data goes into Samyojak\'s CRM module, and Books invoicing data goes into the Invoices module.' },
  { q: 'Do I need to match Zoho\'s field names to Samyojak\'s?', a: 'No. Samyojak\'s adaptive import accepts your Zoho export columns as-is without requiring manual field mapping.' },
  { q: 'Will migrating from Zoho lose any of my historical data?', a: 'No data is lost in the import process — every row and column from your CSV export is preserved.' },
]

export default function MigrateFromZohoPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Migration', href: '/migration' }, { label: 'From Zoho' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Migrate from Zoho to Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Move your Zoho CRM and Zoho Books data into one unified Samyojak workspace, without
            reformatting or manual field mapping.
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
            How to migrate from Zoho
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
          <Link href="/compare/samyojak-vs-zoho" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Compare Samyojak vs Zoho →</Link>
          <Link href="/alternatives/zoho" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Zoho alternative →</Link>
        </div>
      </section>

      <SeoCtaSection heading="One workspace instead of two Zoho apps" subheading="Import your Zoho export and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
