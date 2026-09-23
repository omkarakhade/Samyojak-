import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Best ERP for Small Business — What to Look For',
  description: 'A guide to choosing the best ERP for small business: setup time, pricing structure, data migration, and which features actually matter at small business scale.',
  alternates: { canonical: 'https://samyojak.vercel.app/best/erp-for-small-business' },
  openGraph: {
    title: 'Best ERP for Small Business — What to Look For',
    description: 'A guide to choosing the best ERP for small business.',
    url: 'https://samyojak.vercel.app/best/erp-for-small-business',
  },
}

const criteria = [
  'Setup time — can you be operational in days, not months, without a consultant',
  'Pricing structure — flat-rate plans avoid surprise costs as your team grows',
  'Data migration — does it accept your existing spreadsheet or CRM export as-is',
  'Core modules — CRM, invoicing, and inventory matter more at small scale than deep customization',
  'Tax compliance — does it handle your region\'s tax requirements without manual configuration',
  'Support — can you get help without an enterprise support contract',
]

const faqs = [
  { q: 'What makes an ERP good for small business specifically?', a: 'Fast setup, predictable flat-rate pricing, and the ability to import existing data without reformatting matter more for small businesses than deep customization or industry-specific modules.' },
  { q: 'Should a small business pay for per-user ERP pricing?', a: 'Per-user pricing can become expensive as a small team grows. Flat-rate plans that don\'t scale with headcount are generally more predictable for small business budgets.' },
  { q: 'How long should ERP setup take for a small business?', a: 'For a small business without complex custom workflows, setup should realistically take minutes to hours, not weeks — especially if the ERP accepts existing data imports directly.' },
]

export default function ErpForSmallBusinessPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Best', href: '/best' }, { label: 'ERP for Small Business' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Best ERP for Small Business
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            The "best" ERP for a small business looks different than the best ERP for an enterprise.
            Here's what actually matters when you're evaluating options at small business scale.
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
            What to evaluate
          </h2>
          <ul className="space-y-3">
            {criteria.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
          <p className="text-sm mt-8" style={{ color: '#64748B' }}>
            Samyojak is built around these exact priorities — adaptive data import, flat-rate weekly
            or monthly pricing, and core modules that cover CRM, invoicing, inventory, and HR without
            requiring configuration before you can start using it.
          </p>
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
          <Link href="/solutions/small-business" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for small business →</Link>
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See pricing →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Built for small business, from day one" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
          }
