import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Recurring Invoices — Samyojak Features',
  description: 'Automatically generate and send invoices on a weekly, monthly, or yearly schedule for retainer or subscription clients with Samyojak.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/recurring-invoices' },
  openGraph: {
    title: 'Recurring Invoices — Samyojak Features',
    description: 'Automatically generate and send invoices on a schedule.',
    url: 'https://samyojak.vercel.app/features/recurring-invoices',
  },
}

const items = [
  'Set up weekly, monthly, or yearly recurring billing schedules',
  'Invoices generate and send automatically on schedule',
  'Apply the correct tax rate automatically on every recurring invoice',
  'Pause or cancel a recurring schedule at any time',
  'Track payment status for each generated invoice',
  'Ideal for retainer clients, subscriptions, or ongoing service contracts',
]

const faqs = [
  { q: 'How do recurring invoices work in Samyojak?', a: 'You set a schedule — weekly, monthly, or yearly — for a client, and Samyojak automatically generates and sends the invoice on that schedule without manual action each time.' },
  { q: 'Can I pause a recurring invoice?', a: 'Yes. Recurring schedules can be paused or cancelled at any time if a retainer or subscription changes.' },
  { q: 'Does the tax rate stay accurate on recurring invoices?', a: 'Yes. Each recurring invoice applies the tax rate configured for that client\'s country automatically.' },
]

export default function RecurringInvoicesFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Recurring Invoices' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Recurring Invoices
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Stop manually creating the same invoice every month for retainer or subscription clients.
            Set a schedule once and Samyojak handles the rest.
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
          <Link href="/features/invoicing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See invoicing features →</Link>
          <Link href="/industries/agencies" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for agencies →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Never manually bill a retainer client again" subheading="Set up recurring invoices in minutes." />
      <MarketingFooter />
    </div>
  )
}
