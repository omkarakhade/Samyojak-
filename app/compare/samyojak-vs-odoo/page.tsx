import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoComparisonTable from '@/components/SeoComparisonTable'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Samyojak vs Odoo — Which ERP Is Right for You?',
  description: 'Compare Samyojak and Odoo across features, setup time, data import, and pricing. See how Samyojak\'s adaptive approach differs from Odoo\'s traditional ERP model.',
  alternates: { canonical: 'https://samyojak.vercel.app/compare/samyojak-vs-odoo' },
  openGraph: {
    title: 'Samyojak vs Odoo — Which ERP Is Right for You?',
    description: 'Compare Samyojak and Odoo across features, setup time, data import, and pricing.',
    url: 'https://samyojak.vercel.app/compare/samyojak-vs-odoo',
  },
}

const rows = [
  { feature: 'Setup time', samyojak: 'Minutes', competitor: 'Weeks to months' },
  { feature: 'Import existing CSV data', samyojak: 'Any format, zero mapping', competitor: 'Requires structured import templates' },
  { feature: 'Weekly billing option', samyojak: 'Yes', competitor: 'No' },
  { feature: 'AI business assistant', samyojak: 'Built into Complete plan', competitor: 'Not natively included' },
  { feature: 'CRM included', samyojak: 'Yes, with AI lead scoring', competitor: 'Yes, separate app/module' },
  { feature: 'Inventory with QR codes', samyojak: 'Free, auto-generated', competitor: 'Available, configuration required' },
  { feature: 'GST/VAT/HST tax support', samyojak: 'Built in for 15+ countries', competitor: 'Available with localization setup' },
  { feature: 'Deployment model', samyojak: 'Cloud SaaS, no install', competitor: 'Self-hosted or Odoo cloud' },
]

const faqs = [
  {
    q: 'Is Samyojak a good Odoo alternative?',
    a: 'Samyojak is built for businesses that want to be running in minutes rather than spending weeks on setup and module configuration. If you want CRM, invoicing, inventory, HR, and projects in one adaptive workspace without a lengthy implementation process, Samyojak is worth evaluating.',
  },
  {
    q: 'Can I import my existing Odoo data into Samyojak?',
    a: 'Yes. Export your data from Odoo as a CSV and Samyojak\'s adaptive import will accept it — you do not need to reformat it to match a predefined structure first.',
  },
  {
    q: 'Does Samyojak have as many modules as Odoo?',
    a: 'Odoo offers a very wide range of specialized apps for large and complex organizations. Samyojak focuses on the core modules most small and growing businesses actually use — CRM, quotations, invoicing, inventory, HR, recruiting, projects, reports, and AI — kept simple and unified.',
  },
  {
    q: 'Is Samyojak cheaper than Odoo?',
    a: 'Samyojak offers weekly, monthly, and yearly plans starting at a low weekly rate with no per-user fees. Pricing is shown automatically based on your region on the Samyojak pricing page.',
  },
]

export default function SamyojakVsOdoo() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Compare', href: '/compare' }, { label: 'Samyojak vs Odoo' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Samyojak vs Odoo
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Odoo is a well-known, feature-rich ERP built for businesses that need extensive customization
            across dozens of specialized apps. Samyojak takes a different approach: an adaptive ERP that
            imports your existing data as-is and gets your core operations — CRM, invoicing, inventory,
            HR, and projects — running in minutes instead of weeks.
          </p>
          <div className="flex gap-4 flex-wrap mb-4">
            <Link href="/signup"
              className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              Start Trial <ArrowRight size={16} />
            </Link>
            <Link href="/alternatives/odoo"
              className="px-6 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-colors"
              style={{ color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
              Read the Odoo Alternative Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Feature-by-feature comparison
          </h2>
          <SeoComparisonTable competitorName="Odoo" rows={rows} />
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            When Samyojak makes more sense
          </h2>
          <ul className="space-y-3 mb-6">
            {[
              'You want to be operational within minutes, not weeks',
              'You have existing CRM, invoicing, or inventory data in CSV or spreadsheet format',
              'You need GST, VAT, or HST tax handling without complex localization setup',
              'You want an AI assistant that reads your live business data',
              'You prefer flat, predictable weekly or monthly pricing without per-user costs',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
                {item}
              </li>
            ))}
          </ul>
          <h2 className="text-2xl font-black mb-4 mt-10" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            When Odoo makes more sense
          </h2>
          <p className="text-sm" style={{ color: '#64748B' }}>
            If your business requires highly specialized modules — manufacturing MRP, point-of-sale
            hardware integrations, or deep customization through a developer team — Odoo's larger
            app ecosystem may be a better fit for that scale of complexity.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Frequently asked questions
          </h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/compare/samyojak-vs-zoho" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Compare Samyojak vs Zoho →
          </Link>
          <Link href="/features" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See all Samyojak features →
          </Link>
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            View pricing →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="See why teams are switching from Odoo"
        subheading="Import your data and be running in minutes. No consultants, no configuration."
      />
      <MarketingFooter />
    </div>
  )
      }
