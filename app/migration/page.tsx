import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileSpreadsheet, Building2, Cloud, Database } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Migrate to Samyojak — Import Your Existing Data',
  description: 'See how to migrate your business data from Excel, Odoo, Zoho, or Google Sheets into Samyojak without reformatting or losing information.',
  alternates: { canonical: 'https://samyojak.vercel.app/migration' },
  openGraph: {
    title: 'Migrate to Samyojak — Import Your Existing Data',
    description: 'Migrate from Excel, Odoo, Zoho, or Google Sheets without reformatting.',
    url: 'https://samyojak.vercel.app/migration',
  },
}

const migrations = [
  { title: 'From Excel', desc: 'Import your existing spreadsheets directly, columns preserved as-is.', href: '/migration/from-excel', icon: FileSpreadsheet, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'From Odoo', desc: 'Export your Odoo data and bring it into Samyojak in minutes.', href: '/migration/from-odoo', icon: Building2, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'From Zoho', desc: 'Move your Zoho CRM and Books data into one unified workspace.', href: '/migration/from-zoho', icon: Cloud, color: '#34D399', bg: '#D1FAE5' },
  { title: 'From Google Sheets', desc: 'Import directly from your Google Sheets exports, no reformatting needed.', href: '/migration/from-google-sheets', icon: Database, color: '#FBBF24', bg: '#FEF3C7' },
]

export default function MigrationPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Migration' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Migrate to Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Moving your business data shouldn't mean starting over. See exactly how to bring your
            existing data into Samyojak from the system you're using now.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {migrations.map(m => (
            <Link key={m.href} href={m.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{m.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your data with you"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
