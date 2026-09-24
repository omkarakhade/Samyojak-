import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'How to Choose an ERP — A Practical Checklist',
  description: 'A step-by-step checklist for evaluating ERP software: data migration, pricing structure, required modules, and setup time.',
  alternates: { canonical: 'https://samyojak.vercel.app/learn/how-to-choose-an-erp' },
  openGraph: {
    title: 'How to Choose an ERP — A Practical Checklist',
    description: 'A step-by-step checklist for evaluating ERP software.',
    url: 'https://samyojak.vercel.app/learn/how-to-choose-an-erp',
  },
}

const checklist = [
  'List the modules you actually need — don\'t pay for HR or projects if you only need CRM and invoicing today',
  'Check how the ERP handles your existing data — will it accept a CSV export as-is, or require reformatting',
  'Understand the full pricing structure — per-user fees, annual contracts, and implementation costs all matter',
  'Confirm tax compliance for your region — GST, VAT, or Sales Tax should be built in, not a manual workaround',
  'Test the actual setup time — sign up and see how long it takes to get real data in and usable',
  'Check if you can export your data back out — avoid getting locked into a system you can\'t leave easily',
]

const faqs = [
  { q: 'What is the biggest mistake businesses make choosing an ERP?', a: 'Committing to an annual contract before confirming the platform can actually import their existing data without major reformatting effort.' },
  { q: 'Should I test an ERP before committing?', a: 'Yes. A weekly or short-term trial period lets you confirm setup time and data import compatibility before a longer commitment.' },
  { q: 'How important is tax compliance when choosing an ERP?', a: 'Very important if you invoice across multiple regions. Manual tax calculation is error-prone, so built-in support for your relevant tax systems saves significant time and reduces mistakes.' },
]

export default function HowToChooseAnErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'How to Choose an ERP' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            How to Choose an ERP
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            A practical, step-by-step checklist for evaluating ERP software before you commit to a
            plan or contract.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>The checklist</h2>
          <ul className="space-y-3">
            {checklist.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3">
          <Link href="/best/erp-for-small-business" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Best ERP for small business →</Link>
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See pricing →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Try the checklist against Samyojak" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
