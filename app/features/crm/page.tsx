import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'CRM with AI Lead Scoring — Samyojak Features',
  description: 'Manage your sales pipeline with AI-powered lead scoring, follow-up reminders, and status tracking. Import leads from any CRM without reformatting.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/crm' },
  openGraph: {
    title: 'CRM with AI Lead Scoring — Samyojak Features',
    description: 'Manage your sales pipeline with AI-powered lead scoring and follow-up reminders.',
    url: 'https://samyojak.vercel.app/features/crm',
  },
}

const items = [
  'AI lead scoring from 0 to 100 based on your lead data',
  'Pipeline stages — New, Contacted, Converted, Lost',
  'Follow-up date reminders so no lead goes cold',
  'Import leads from any CSV format, columns preserved as-is',
  'Export your leads to CSV anytime',
  'Business type categorization for organizing different lead sources',
]

const faqs = [
  { q: 'Does Samyojak\'s CRM score leads automatically?', a: 'Yes. Leads are scored from 0 to 100 automatically based on the data in your CRM, helping you prioritize which leads to follow up with first.' },
  { q: 'Can I import leads from another CRM?', a: 'Yes. Export your leads as a CSV from your current CRM and Samyojak\'s adaptive import accepts it without requiring you to match a predefined field structure.' },
  { q: 'Can I set follow-up reminders for leads?', a: 'Yes. Each lead can have a follow-up date, and Samyojak surfaces upcoming and overdue follow-ups so leads don\'t get missed.' },
]

export default function CrmFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'CRM' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            CRM with AI Lead Scoring
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Manage your entire sales pipeline in one place. Samyojak's CRM scores your leads with AI,
            reminds you of follow-ups, and accepts your existing lead data without forcing you to
            reformat it first.
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
          <Link href="/features/quotations" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See quotation features →</Link>
          <Link href="/industries/real-estate" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for real estate →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Score and track every lead automatically" subheading="Import your existing lead data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
      }
