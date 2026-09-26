import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'What Is CRM? Definition, Purpose & Examples',
  description: 'CRM (Customer Relationship Management) explained simply — what it tracks, how lead scoring works, and why businesses use it.',
  alternates: { canonical: 'https://www.samyojak-erp.com/learn/what-is-crm' },
  openGraph: {
    title: 'What Is CRM? Definition, Purpose & Examples',
    description: 'CRM explained simply — what it tracks and why businesses use it.',
    url: 'https://www.samyojak-erp.com/learn/what-is-crm',
  },
}

const faqs = [
  { q: 'What does CRM stand for?', a: 'CRM stands for Customer Relationship Management — software that tracks leads, customers, and the interactions a business has with them over time.' },
  { q: 'What does a CRM typically track?', a: 'A CRM typically tracks contact details, lead status (such as New, Contacted, or Converted), follow-up dates, and communication history for each lead or customer.' },
  { q: 'Is CRM the same as ERP?', a: 'No. CRM is usually one module within a broader ERP system. ERP also covers invoicing, inventory, HR, and other operational functions beyond just customer relationships.' },
]

export default function WhatIsCrmPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'What Is CRM?' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            What Is CRM?
          </h1>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            CRM stands for Customer Relationship Management. It refers to software that helps a
            business track and manage its interactions with leads and customers — from the first
            point of contact through follow-ups and, ideally, a closed sale.
          </p>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            A CRM typically organizes leads into pipeline stages, such as New, Contacted, Converted, or
            Lost, so a sales team can see at a glance where every relationship stands. Many CRMs also
            include follow-up reminders to prevent leads from being forgotten, and some use AI to score
            leads based on how likely they are to convert.
          </p>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            CRM is often one part of a larger business management system. When connected to invoicing,
            a converted lead can move directly into billing without re-entering their information in a
            separate tool.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3">
          <Link href="/learn/what-is-erp" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is ERP? →</Link>
          <Link href="/best/crm-software" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Best CRM software →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See CRM lead scoring in action" subheading="Import your leads and start tracking in minutes." />
      <MarketingFooter />
    </div>
  )
}
