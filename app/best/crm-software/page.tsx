import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Best CRM Software — What to Look For',
  description: 'A guide to choosing CRM software: lead scoring, pipeline tracking, follow-up automation, and data import compatibility.',
  alternates: { canonical: 'https://samyojak.vercel.app/best/crm-software' },
  openGraph: {
    title: 'Best CRM Software — What to Look For',
    description: 'A guide to choosing CRM software for your business.',
    url: 'https://samyojak.vercel.app/best/crm-software',
  },
}

const criteria = [
  'Lead scoring — does it help you prioritize which leads to follow up with',
  'Pipeline visibility — can you see where every lead stands at a glance',
  'Follow-up reminders — does it prevent leads from going cold',
  'Data import — can you bring in leads from your current spreadsheet or CRM directly',
  'Integration with invoicing — does converting a lead to a paying client require switching tools',
  'Pricing — per-user fees can get expensive as your sales team grows',
]

const faqs = [
  { q: 'What is the most important CRM feature for a small sales team?', a: 'Follow-up reminders and lead scoring tend to have the biggest immediate impact, since they directly prevent leads from being forgotten or deprioritized incorrectly.' },
  { q: 'Should CRM and invoicing be in the same system?', a: 'Keeping CRM and invoicing connected removes the need to re-enter client information when a lead converts to a paying customer, and gives you visibility into revenue directly tied to your pipeline.' },
  { q: 'Can I switch CRM software without losing my existing leads?', a: 'If the new CRM supports adaptive CSV import, you can bring your existing lead data over without needing to manually re-enter every contact.' },
]

export default function CrmSoftwarePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Best', href: '/best' }, { label: 'CRM Software' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Best CRM Software
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            The right CRM depends on how your sales process actually works. Here's what to evaluate
            before committing to a platform.
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
            Samyojak's CRM module includes AI lead scoring, follow-up reminders, and is connected
            directly to invoicing — so converting a lead to a paying client doesn't require switching
            tools.
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
          <Link href="/features/crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See CRM features →</Link>
          <Link href="/best/erp-for-small-business" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Best ERP for small business →</Link>
        </div>
      </section>

      <SeoCtaSection heading="CRM connected to your whole business" subheading="Start scoring and tracking leads in minutes." />
      <MarketingFooter />
    </div>
  )
}
