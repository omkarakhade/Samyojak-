import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Migrate from Odoo to Samyojak',
  description: 'Step-by-step guide to exporting your Odoo data and importing it into Samyojak without reformatting.',
  alternates: { canonical: 'https://www.samyojak-erp.com/migration/from-odoo' },
  openGraph: {
    title: 'Migrate from Odoo to Samyojak',
    description: 'Export your Odoo data and bring it into Samyojak in minutes.',
    url: 'https://www.samyojak-erp.com/migration/from-odoo',
  },
}

const steps = [
  'In Odoo, go to the list view of the data you want to export — contacts, invoices, or inventory',
  'Select the records, then use Odoo\'s Export function to download a CSV file',
  'Sign up for Samyojak and choose the matching module to import into',
  'Upload the exported CSV directly — Samyojak accepts Odoo\'s column structure as-is',
  'Preview and confirm the import',
]

const faqs = [
  { q: 'Do I need to reformat my Odoo export before importing?', a: 'No. Samyojak\'s adaptive import accepts the CSV structure Odoo exports without requiring you to match a predefined template.' },
  { q: 'Can I migrate Odoo CRM data specifically?', a: 'Yes. Export your Odoo CRM contacts and leads as CSV, then import them into Samyojak\'s CRM module.' },
  { q: 'What if I only want to migrate part of my Odoo data?', a: 'You can export and import whichever Odoo modules matter most to you first, then bring over additional data later.' },
]

export default function MigrateFromOdooPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Migration', href: '/migration' }, { label: 'From Odoo' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Migrate from Odoo to Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Export your Odoo data as CSV and bring it into Samyojak without reformatting — a faster
            path than a full ERP re-implementation.
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
            How to migrate from Odoo
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
          <Link href="/compare/samyojak-vs-odoo" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Compare Samyojak vs Odoo →</Link>
          <Link href="/alternatives/odoo" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Odoo alternative →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Leave Odoo's setup time behind" subheading="Import your Odoo export and be running in minutes." />
      <MarketingFooter />
    </div>
  )
      }
