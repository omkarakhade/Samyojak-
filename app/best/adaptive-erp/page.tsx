import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Best Adaptive ERP — Why Data Import Matters',
  description: 'What "adaptive ERP" means, why traditional ERP setup takes so long, and how to evaluate whether a platform truly adapts to your existing data.',
  alternates: { canonical: 'https://www.samyojak-erp.com/best/adaptive-erp' },
  openGraph: {
    title: 'Best Adaptive ERP — Why Data Import Matters',
    description: 'What "adaptive ERP" means and how to evaluate it.',
    url: 'https://www.samyojak-erp.com/best/adaptive-erp',
  },
}

const criteria = [
  'True adaptive import accepts your CSV as-is, without requiring you to rename columns first',
  'No forced schema — the platform organizes around your data structure, not the reverse',
  'Zero data loss — every row and column from your export should be preserved',
  'Fast time-to-value — you should be using real features within minutes of importing',
  'No mandatory consultant or implementation partner for basic setup',
  'Ability to export your data back out at any time, in the same flexible way it came in',
]

const faqs = [
  { q: 'What does "adaptive ERP" actually mean?', a: 'An adaptive ERP is one that reorganizes itself around the structure of the data you already have, rather than requiring you to reformat your data to match a predefined system structure.' },
  { q: 'How is this different from a traditional ERP import?', a: 'Traditional ERP imports typically require mapping each of your columns to specific predefined fields before the system will accept the data. Adaptive import skips that step.' },
  { q: 'Why does this matter for setup time?', a: 'Column mapping and data reformatting is one of the biggest time costs in traditional ERP implementation. Removing that step is what allows adaptive ERPs to go from signup to usable in minutes rather than weeks.' },
]

export default function AdaptiveErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Best', href: '/best' }, { label: 'Adaptive ERP' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Best Adaptive ERP
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            "Adaptive" is becoming a common term in ERP marketing. Here's what it should actually mean,
            and how to tell if a platform genuinely delivers on it.
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
            Samyojak's core design principle is exactly this — you upload your existing CSV, and the
            platform reads your columns as-is rather than forcing a predefined structure on you.
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
          <Link href="/features/csv-import-export" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See CSV import features →</Link>
          <Link href="/compare/samyojak-vs-odoo" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Compare Samyojak vs Odoo →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See adaptive import in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
