import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Compare Samyojak — ERP Comparisons',
  description: 'See how Samyojak compares to other ERP and business management platforms, and how ERP compares to CRM, spreadsheets, and using multiple separate tools.',
  alternates: { canonical: 'https://samyojak.vercel.app/compare' },
  openGraph: {
    title: 'Compare Samyojak — ERP Comparisons',
    description: 'See how Samyojak compares to other ERP and business management platforms.',
    url: 'https://samyojak.vercel.app/compare',
  },
}

const comparisons = [
  {
    title: 'Samyojak vs Odoo',
    desc: 'How Samyojak\'s adaptive setup compares to Odoo\'s traditional module-based ERP.',
    href: '/compare/samyojak-vs-odoo',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    title: 'Samyojak vs Zoho',
    desc: 'How Samyojak\'s unified workspace compares to Zoho\'s suite of separate apps.',
    href: '/compare/samyojak-vs-zoho',
    color: '#F472B6',
    bg: '#FCE7F3',
  },
]

export default function ComparePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Compare' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Compare Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            See exactly how Samyojak compares to other business management platforms — feature by
            feature, so you can make an informed decision for your business.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisons.map(c => (
            <Link key={c.href} href={c.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: c.bg, border: `2px solid ${c.color}` }}>
                <ArrowRight size={20} style={{ color: c.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{c.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="See it for yourself"
        subheading="Start a trial and compare Samyojak to your current setup directly."
      />
      <MarketingFooter />
    </div>
  )
}
