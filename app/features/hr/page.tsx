import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'HR & Payroll — Samyojak Features',
  description: 'Manage employee records, salary tracking, and leave balance in one place with Samyojak\'s HR module.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/hr' },
  openGraph: {
    title: 'HR & Payroll — Samyojak Features',
    description: 'Employee management, salary tracking, and leave balance.',
    url: 'https://samyojak.vercel.app/features/hr',
  },
}

const items = [
  'Employee profiles with roles and departments',
  'Monthly salary tracking',
  'Leave balance tracking',
  'Joining date and employment records',
  'Import your existing staff data from any CSV format',
  'Export HR data to CSV anytime',
]

const faqs = [
  { q: 'Can Samyojak track employee salaries?', a: 'Yes. The HR module tracks monthly salary information alongside employee roles and departments.' },
  { q: 'Does Samyojak track leave balances?', a: 'Yes. Leave balance is tracked per employee within the HR module.' },
  { q: 'Can I import my existing staff records?', a: 'Yes. Export your staff data as CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.' },
]

export default function HrFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'HR & Payroll' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            HR & Payroll
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Manage your entire team — salaries, departments, joining dates, and leave balance — with
            your existing staff data imported as-is.
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
          <Link href="/features/recruiting" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See recruiting features →</Link>
          <Link href="/industries/healthcare" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Business management for healthcare →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Manage your whole team in one place" subheading="Import your staff data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
