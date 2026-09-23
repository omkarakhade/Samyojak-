import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Tax Reports & Analytics — Samyojak Features',
  description: 'Generate GSTR-1 compatible tax reports, monthly revenue summaries, and collection rate analytics with Samyojak.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/reports' },
  openGraph: {
    title: 'Tax Reports & Analytics — Samyojak Features',
    description: 'GSTR-1 format, monthly summaries, revenue analytics.',
    url: 'https://samyojak.vercel.app/features/reports',
  },
}

const items = [
  'GSTR-1 compatible tax reports',
  'Monthly revenue summaries',
  'Tax collected broken down by rate — 5%, 12%, 18%, 28%',
  'Paid vs unpaid vs overdue invoice breakdown',
  'Collection rate tracked by month',
  'Export any report to CSV',
]

const faqs = [
  { q: 'Does Samyojak generate GST-compliant reports?', a: 'Yes. Reports are generated in a GSTR-1 compatible format for Indian GST filing, alongside general revenue and collection reports.' },
  { q: 'Can I see revenue trends over time?', a: 'Yes. Monthly revenue summaries and collection rate tracking show trends across your invoicing history.' },
  { q: 'Can I export reports for my accountant?', a: 'Yes. Any report can be exported to CSV for sharing with an accountant or bookkeeper.' },
]

export default function ReportsFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Reports' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Tax Reports & Analytics
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Generate GSTR-1 compatible tax reports, monthly revenue summaries, and collection analytics
            directly from your invoicing data — no manual pivot tables required.
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
          <Link href="/features/invoicing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See invoicing features →</Link>
          <Link href="/industries/finance" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for finance →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Reports that pull themselves together" subheading="Start generating reports in minutes." />
      <MarketingFooter />
    </div>
  )
    }
