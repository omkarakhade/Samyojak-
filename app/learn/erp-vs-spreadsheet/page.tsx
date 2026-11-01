import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoComparisonTable from '@/components/SeoComparisonTable'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP vs Spreadsheet — When to Make the Switch',
  description: 'ERP and spreadsheets compared — data integrity, collaboration, automation, and when a business outgrows spreadsheet-based management.',
  alternates: { canonical: 'https://www.samyojak-erp.com/learn/erp-vs-spreadsheet' },
  openGraph: {
    title: 'ERP vs Spreadsheet — When to Make the Switch',
    description: 'ERP and spreadsheets compared.',
    url: 'https://www.samyojak-erp.com/learn/erp-vs-spreadsheet',
  },
}

const rows = [
  { feature: 'Multiple users editing simultaneously', samyojak: 'Built to support this', competitor: 'Often causes version conflicts' },
  { feature: 'Automated reminders', samyojak: 'Yes — follow-ups, low stock, overdue invoices', competitor: 'Manual only' },
  { feature: 'Tax calculation', samyojak: 'Automatic based on country', competitor: 'Manual formulas' },
  { feature: 'Reporting', samyojak: 'Automatic dashboards and charts', competitor: 'Manual pivot tables' },
  { feature: 'Access from any device', samyojak: 'Yes', competitor: 'Depends on file storage setup' },
]

const faqs = [
  { q: 'When does a business outgrow spreadsheets?', a: 'Common signs include multiple people editing the same file causing conflicts, manual invoice creation becoming time-consuming, and no automated way to track overdue payments or low stock.' },
  { q: 'Will I lose my spreadsheet data if I switch to an ERP?', a: 'If the ERP supports adaptive CSV import, you can bring your spreadsheet data over directly without losing any rows or columns.' },
  { q: 'Can I still use spreadsheets alongside an ERP?', a: 'Yes. Most ERPs, including Samyojak, allow you to export data back to CSV at any time, so you\'re not locked into an all-or-nothing switch.' },
]

export default function ErpVsSpreadsheetPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'ERP vs Spreadsheet' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP vs Spreadsheet
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Spreadsheets work well for a while, but they weren't built for multi-person collaboration,
            automated alerts, or connected reporting. Here's how ERP software addresses those gaps.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Side-by-side comparison</h2>
          <SeoComparisonTable competitorName="Spreadsheets" rows={rows} />
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/solutions/replace-spreadsheets" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Replace spreadsheets →</Link>
          <Link href="/migration/from-excel" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Migrate from Excel →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Leave spreadsheet chaos behind" subheading="Import your data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
