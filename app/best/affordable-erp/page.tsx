import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Best Affordable ERP — Avoiding Hidden Costs',
  description: 'A guide to finding affordable ERP software: understanding per-user fees, annual contracts, and hidden implementation costs.',
  alternates: { canonical: 'https://samyojak.vercel.app/best/affordable-erp' },
  openGraph: {
    title: 'Best Affordable ERP — Avoiding Hidden Costs',
    description: 'A guide to finding affordable ERP software without hidden costs.',
    url: 'https://samyojak.vercel.app/best/affordable-erp',
  },
}

const criteria = [
  'Flat-rate pricing — costs that don\'t multiply as you add team members',
  'No mandatory annual contract — the ability to pay weekly or monthly without long-term lock-in',
  'No hidden implementation fees — setup should be included, not billed separately',
  'Transparent module pricing — clear visibility into what each plan tier includes',
  'No consultant requirement — affordable ERP shouldn\'t need a paid implementation partner',
  'Free or included core features like QR code generation and CSV import',
]

const faqs = [
  { q: 'What hidden costs should I watch for with ERP software?', a: 'Common hidden costs include per-user fees that scale unexpectedly, paid implementation or migration services, and add-on modules that are marketed as included but billed separately.' },
  { q: 'Is weekly ERP billing actually more affordable than annual?', a: 'Weekly billing gives you the flexibility to stop paying if the software isn\'t working for you, avoiding the sunk cost of a prepaid annual contract that doesn\'t fit your needs.' },
  { q: 'Does affordable ERP mean fewer features?', a: 'Not necessarily. Affordable, flat-rate ERP platforms can include the same core modules as expensive per-user platforms — the difference is often in pricing structure rather than feature depth.' },
]

export default function AffordableErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Best', href: '/best' }, { label: 'Affordable ERP' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Best Affordable ERP
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            "Affordable" often hides costs in per-user fees, annual contracts, or implementation
            services. Here's what to check before signing up.
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
            What to check for
          </h2>
          <ul className="space-y-3">
            {criteria.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
          <p className="text-sm mt-8" style={{ color: '#64748B' }}>
            Samyojak offers weekly, monthly, and yearly plans with flat pricing regardless of team
            size, and includes QR code generation and CSV import at no extra cost.
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
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See pricing →</Link>
          <Link href="/best/erp-for-small-business" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Best ERP for small business →</Link>
        </div>
      </section>

      <SeoCtaSection heading="No per-user fees, no annual lock-in" subheading="See flat-rate pricing and start in minutes." />
      <MarketingFooter />
    </div>
  )
}
