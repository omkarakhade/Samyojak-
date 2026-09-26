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
  title: 'Samyojak vs Zoho — Which ERP Is Right for You?',
  description: 'Compare Samyojak and Zoho across CRM, invoicing, pricing, and setup complexity. See how Samyojak\'s unified adaptive ERP compares to Zoho\'s suite of separate apps.',
  alternates: { canonical: 'https://www.samyojak-erp.com/compare/samyojak-vs-zoho' },
  openGraph: {
    title: 'Samyojak vs Zoho — Which ERP Is Right for You?',
    description: 'Compare Samyojak and Zoho across CRM, invoicing, pricing, and setup complexity.',
    url: 'https://www.samyojak-erp.com/compare/samyojak-vs-zoho',
  },
}

const rows = [
  { feature: 'Setup time', samyojak: 'Minutes', competitor: 'Days to weeks per app' },
  { feature: 'Import existing CSV data', samyojak: 'Any format, zero mapping', competitor: 'Requires field mapping per module' },
  { feature: 'Weekly billing option', samyojak: 'Yes', competitor: 'No, typically monthly/annual' },
  { feature: 'Modules in one app', samyojak: 'Unified — one login, one workspace', competitor: 'Separate apps (CRM, Books, Inventory, etc.)' },
  { feature: 'AI business assistant', samyojak: 'Built into Complete plan', competitor: 'Available as separate add-on' },
  { feature: 'Free QR codes for inventory', samyojak: 'Included', competitor: 'Not standard' },
  { feature: 'GST/VAT/HST tax support', samyojak: 'Built in for 15+ countries', competitor: 'Region-specific product versions' },
  { feature: 'Per-user pricing', samyojak: 'No — flat rate per plan', competitor: 'Often per-user' },
]

const faqs = [
  {
    q: 'Is Samyojak a good Zoho alternative?',
    a: 'If you want CRM, invoicing, inventory, HR, and projects working together in a single unified workspace instead of juggling separate Zoho apps, Samyojak is worth comparing. It is designed to get you running with your existing data in minutes.',
  },
  {
    q: 'Can I import my Zoho CRM or Zoho Books data into Samyojak?',
    a: 'Yes. Export your data from Zoho as a CSV and Samyojak\'s adaptive import will accept it as-is, preserving your original columns without requiring you to match a predefined template.',
  },
  {
    q: 'Does Samyojak charge per user like Zoho?',
    a: 'No. Samyojak plans are flat-rate regardless of how many people on your team use it.',
  },
  {
    q: 'Is Samyojak cheaper than Zoho One?',
    a: 'Samyojak offers weekly, monthly, and yearly plans with region-based pricing shown automatically on the pricing page, with no per-user fees.',
  },
]

export default function SamyojakVsZoho() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Compare', href: '/compare' }, { label: 'Samyojak vs Zoho' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Samyojak vs Zoho
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Zoho offers a broad suite of individual business apps — CRM, Books, Inventory, and more —
            that work together but are managed somewhat separately. Samyojak takes a unified approach:
            CRM, quotations, invoicing, inventory, HR, recruiting, projects, and AI in a single adaptive
            workspace that accepts your existing data without reformatting.
          </p>
          <div className="flex gap-4 flex-wrap mb-4">
            <Link href="/signup"
              className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              Start Trial <ArrowRight size={16} />
            </Link>
            <Link href="/alternatives/zoho"
              className="px-6 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-colors"
              style={{ color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
              Read the Zoho Alternative Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Feature-by-feature comparison
          </h2>
          <SeoComparisonTable competitorName="Zoho" rows={rows} />
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            When Samyojak makes more sense
          </h2>
          <ul className="space-y-3 mb-6">
            {[
              'You want one login and one workspace instead of multiple connected apps',
              'You have existing data in spreadsheets or exports from other tools',
              'You want flat, predictable pricing without per-user costs',
              'You need multi-country tax handling — GST, VAT, HST — without regional product versions',
              'You want an AI assistant built into your core plan',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
                {item}
              </li>
            ))}
          </ul>
          <h2 className="text-2xl font-black mb-4 mt-10" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            When Zoho makes more sense
          </h2>
          <p className="text-sm" style={{ color: '#64748B' }}>
            If your business already relies on a large number of specialized Zoho apps beyond core
            operations — like Zoho Desk, Zoho Campaigns, or industry-specific tools — and needs that
            breadth of integrations, Zoho's wider ecosystem may serve those specific needs better.
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
          <Link href="/compare/samyojak-vs-odoo" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Compare Samyojak vs Odoo →
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
        heading="See why teams are switching from Zoho"
        subheading="One workspace. Your existing data. Running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
