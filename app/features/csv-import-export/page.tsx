import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'CSV Import & Export — Samyojak Features',
  description: 'Migrate from any existing ERP, CRM, or spreadsheet without renaming a single column. Samyojak\'s adaptive import accepts any CSV format.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features/csv-import-export' },
  openGraph: {
    title: 'CSV Import & Export — Samyojak Features',
    description: 'Migrate from any existing ERP or spreadsheet without reformatting.',
    url: 'https://www.samyojak-erp.com/features/csv-import-export',
  },
}

const items = [
  'Accepts any CSV column naming convention as-is',
  'Smart mapping of your columns to the relevant Samyojak module',
  'Preview your data before confirming the import',
  'Batch import hundreds of records at once',
  'Source tracking so you know where imported data came from',
  'Works with exports from any business software or spreadsheet',
]

const faqs = [
  { q: 'Do I need to reformat my spreadsheet before importing?', a: 'No. Samyojak\'s adaptive import accepts your CSV columns as-is, without requiring you to rename or restructure them to match a predefined template first.' },
  { q: 'Can I import from any CRM or ERP?', a: 'Yes. As long as you can export your data as a CSV file, Samyojak\'s adaptive import will accept it, regardless of which system it originally came from.' },
  { q: 'Can I export my Samyojak data back out?', a: 'Yes. Every module supports exporting your data to CSV at any time.' },
]

export default function CsvImportExportFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'CSV Import & Export' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            CSV Import & Export
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Migrate from any existing ERP, CRM, or spreadsheet without renaming a single column. This
            is the foundation of how Samyojak adapts to you instead of the other way around.
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
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>What's included</h2>
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
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
          <Link href="/solutions/replace-spreadsheets" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Replace spreadsheets →</Link>
          <Link href="/alternatives/odoo" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Odoo alternative →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Bring your data as-is, no reformatting" subheading="Start importing your data in minutes." />
      <MarketingFooter />
    </div>
  )
}
