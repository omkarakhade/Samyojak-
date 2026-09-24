import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'What Is ERP? Definition, Purpose & Examples',
  description: 'ERP (Enterprise Resource Planning) explained simply — what it does, what modules it typically includes, and why businesses use it.',
  alternates: { canonical: 'https://samyojak.vercel.app/learn/what-is-erp' },
  openGraph: {
    title: 'What Is ERP? Definition, Purpose & Examples',
    description: 'ERP explained simply — what it does and why businesses use it.',
    url: 'https://samyojak.vercel.app/learn/what-is-erp',
  },
}

const faqs = [
  { q: 'What does ERP stand for?', a: 'ERP stands for Enterprise Resource Planning — software that centralizes core business functions like sales, invoicing, inventory, and HR into one connected system.' },
  { q: 'What modules does an ERP typically include?', a: 'Common ERP modules include CRM (sales and leads), invoicing and finance, inventory management, HR and payroll, and project management, though the exact modules vary by platform.' },
  { q: 'Do small businesses need ERP software?', a: 'Small businesses often start with spreadsheets or separate tools, but as data volume and team size grow, an ERP centralizes information and reduces manual duplicate work.' },
]

export default function WhatIsErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'What Is ERP?' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            What Is ERP?
          </h1>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            ERP stands for Enterprise Resource Planning. It refers to software that brings together
            the core operational functions of a business — sales, invoicing, inventory, HR, and
            projects — into one connected system, instead of managing each with separate tools or
            spreadsheets.
          </p>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>
            The purpose of ERP is to give a business a single source of truth for its data. Instead of
            a sales lead living in one spreadsheet, an invoice in another tool, and inventory counts in
            a third system, an ERP connects these so that information flows between them automatically.
          </p>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Typical ERP modules include a CRM for managing leads and customers, invoicing for billing
            and tax compliance, inventory management for tracking stock, HR for managing employees and
            payroll, and project management for tracking deliverables and deadlines. Some modern ERPs
            also include AI-powered business intelligence that reads across all of these modules to
            answer questions about the business.
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
          <Link href="/learn/what-is-crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is CRM? →</Link>
          <Link href="/learn/erp-vs-crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP vs CRM →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See ERP in action" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
