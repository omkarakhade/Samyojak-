import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Zoho Alternative — Samyojak Adaptive ERP',
  description: 'Looking for a Zoho alternative? Samyojak unifies CRM, invoicing, inventory, HR, and projects into one adaptive ERP that accepts your existing data as-is.',
  alternates: { canonical: 'https://www.samyojak-erp.com/alternatives/zoho' },
  openGraph: {
    title: 'Zoho Alternative — Samyojak Adaptive ERP',
    description: 'Looking for a Zoho alternative? Samyojak unifies your core business operations into one adaptive ERP.',
    url: 'https://www.samyojak-erp.com/alternatives/zoho',
  },
}

const faqs = [
  {
    q: 'Why do businesses look for a Zoho alternative?',
    a: 'Common reasons include managing multiple separate Zoho apps that each need their own setup, per-user pricing that scales with team growth, and wanting a single unified workspace instead of several connected products.',
  },
  {
    q: 'What makes Samyojak different from Zoho?',
    a: 'Samyojak unifies CRM, quotations, invoicing, inventory, HR, recruiting, projects, reports, and AI in a single workspace with one login. Its adaptive import accepts your existing data structure directly, without requiring field-by-field mapping.',
  },
  {
    q: 'Can I migrate my Zoho CRM and Zoho Books data to Samyojak?',
    a: 'Yes. Export your data from Zoho as CSV files and Samyojak\'s adaptive import will accept them as-is.',
  },
  {
    q: 'Does Samyojak charge per user like Zoho?',
    a: 'No. Samyojak uses flat-rate plans regardless of team size.',
  },
]

export default function ZohoAlternative() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Alternatives', href: '/alternatives' }, { label: 'Zoho Alternative' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Looking for a Zoho Alternative?
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Zoho offers a wide suite of connected apps, but managing CRM, Books, Inventory, and more as
            separate products can add complexity. Samyojak unifies these core functions into a single
            adaptive workspace that accepts your existing data as-is.
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
            What businesses want from a Zoho alternative
          </h2>
          <ul className="space-y-3">
            {[
              'One unified workspace instead of multiple connected apps',
              'Flat pricing that does not increase per user added to the team',
              'The ability to bring existing CRM and accounting data over without reformatting',
              'Built-in AI business intelligence without a separate add-on',
              'Simple, fast setup without a lengthy onboarding process',
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
          <Link href="/compare/samyojak-vs-zoho" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See the full Samyojak vs Zoho comparison →
          </Link>
          <Link href="/features" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See all Samyojak features →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Ready to try an ERP that adapts to you?"
        subheading="One workspace, your existing data, running in minutes."
      />
      <MarketingFooter />
    </div>
  )
            }
