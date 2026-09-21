import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Odoo Alternative — Samyojak Adaptive ERP',
  description: 'Looking for an Odoo alternative? Samyojak is an adaptive ERP that imports your existing data as-is and gets CRM, invoicing, inventory, HR, and projects running in minutes.',
  alternates: { canonical: 'https://samyojak.vercel.app/alternatives/odoo' },
  openGraph: {
    title: 'Odoo Alternative — Samyojak Adaptive ERP',
    description: 'Looking for an Odoo alternative? Samyojak imports your existing data and gets you running in minutes.',
    url: 'https://samyojak.vercel.app/alternatives/odoo',
  },
}

const faqs = [
  {
    q: 'Why do businesses look for an Odoo alternative?',
    a: 'Common reasons include long implementation timelines, the need for developer support to customize modules, and complexity that outgrows what a small or mid-sized business actually needs day to day.',
  },
  {
    q: 'What makes Samyojak different from Odoo?',
    a: 'Samyojak is built around adaptive data import — you bring your existing CSV or spreadsheet data as-is, and Samyojak organizes it without requiring you to match a predefined schema first. Core modules are unified in one workspace rather than a large collection of separate apps.',
  },
  {
    q: 'Can I migrate my Odoo data to Samyojak?',
    a: 'Yes. Export your data from Odoo as CSV files and import them into Samyojak. The adaptive import accepts your original column structure.',
  },
  {
    q: 'Does Samyojak support manufacturing or MRP like Odoo?',
    a: 'Samyojak focuses on CRM, quotations, invoicing, inventory, HR, recruiting, projects, reports, and AI business intelligence. For businesses needing deep manufacturing resource planning, evaluate whether Samyojak\'s core operational modules meet your needs first.',
  },
]

export default function OdooAlternative() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Alternatives', href: '/alternatives' }, { label: 'Odoo Alternative' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Looking for an Odoo Alternative?
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Odoo is a capable ERP, but its breadth of modules and configuration requirements can mean
            weeks of implementation before a business is fully operational. Samyojak takes an adaptive
            approach — import your existing data as-is and get CRM, invoicing, inventory, HR, and
            projects running in minutes, not weeks.
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
            What businesses want from an Odoo alternative
          </h2>
          <ul className="space-y-3">
            {[
              'Faster setup without needing a developer or implementation partner',
              'The ability to bring existing CRM, invoice, and inventory data over without reformatting it',
              'A simpler, unified interface across core business functions',
              'Predictable pricing that does not scale unpredictably with modules or users',
              'Built-in AI insights without needing a separate integration',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
                {item}
              </li>
            ))}
          </ul>
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
            See the full Samyojak vs Odoo comparison →
          </Link>
          <Link href="/features" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See all Samyojak features →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Ready to try an ERP that adapts to you?"
        subheading="Import your data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
