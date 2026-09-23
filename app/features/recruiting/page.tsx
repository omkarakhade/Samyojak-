import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Recruiting — Samyojak Features',
  description: 'Track candidates through Applied, Screening, Interview, Offer, and Hired stages with Samyojak\'s recruiting module.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/recruiting' },
  openGraph: {
    title: 'Recruiting — Samyojak Features',
    description: 'Track candidates through Applied, Screening, Interview, Offer, and Hired.',
    url: 'https://samyojak.vercel.app/features/recruiting',
  },
}

const items = [
  'Track candidates through Applied, Screening, Interview, Offer, and Hired stages',
  'Keep candidate contact details and notes in one place',
  'See your full hiring pipeline at a glance',
  'Move candidates between stages as they progress',
  'Import candidate data from a CSV without reformatting',
  'Keep hiring history for future reference',
]

const faqs = [
  { q: 'What stages does the recruiting module track?', a: 'Candidates move through Applied, Screening, Interview, Offer, and Hired stages, giving you a clear view of your hiring pipeline.' },
  { q: 'Can I use recruiting alongside HR?', a: 'Yes. Once a candidate is hired, their information carries forward into ongoing HR and payroll tracking.' },
  { q: 'Can I import a list of existing candidates?', a: 'Yes. Export your candidate data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.' },
]

export default function RecruitingFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Recruiting' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Recruiting
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Track every candidate through your hiring pipeline — from application to offer — without
            losing track of where things stand.
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
          <Link href="/features/hr" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See HR features →</Link>
          <Link href="/solutions/startups" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Business management for startups →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Never lose track of a candidate" subheading="Start tracking your hiring pipeline in minutes." />
      <MarketingFooter />
    </div>
  )
}
