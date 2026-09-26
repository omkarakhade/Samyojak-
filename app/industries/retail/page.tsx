import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoUseCaseList from '@/components/SeoUseCaseList'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP for Retail Businesses — Samyojak',
  description: 'Manage inventory, customer relationships, and invoicing for your retail business with Samyojak. Free QR codes, low-stock alerts, and adaptive data import included.',
  alternates: { canonical: 'https://www.samyojak-erp.com/industries/retail' },
  openGraph: {
    title: 'ERP for Retail Businesses — Samyojak',
    description: 'Manage inventory, customer relationships, and invoicing for your retail business.',
    url: 'https://www.samyojak-erp.com/industries/retail',
  },
}

const useCases = [
  'Track product inventory with free auto-generated QR codes for every item',
  'Get low-stock alerts before items run out',
  'Build customer relationships with CRM lead tracking and follow-up reminders',
  'Create and send tax-compliant invoices in seconds',
  'Send invoices directly to customers via WhatsApp',
  'Import your existing product catalog or customer list without reformatting',
]

const faqs = [
  {
    q: 'Does Samyojak work for a single retail store or multiple locations?',
    a: 'Samyojak\'s inventory and CRM modules track your products and customers in one workspace, suited to small and growing retail operations managing their stock and sales relationships centrally.',
  },
  {
    q: 'Can I generate QR codes for my products?',
    a: 'Yes. Samyojak automatically generates a free QR code for every product added to your inventory.',
  },
  {
    q: 'Can I import my existing product catalog?',
    a: 'Yes. Upload your existing inventory as a CSV and Samyojak\'s adaptive import accepts it without requiring you to match a predefined format.',
  },
]

export default function RetailPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries', href: '/industries' }, { label: 'Retail' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            ERP for Retail Businesses
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Retail businesses need fast, accurate inventory tracking and simple invoicing without
            complex setup. Samyojak gives you both — plus customer relationship tracking — in one
            adaptive workspace.
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
          <SeoUseCaseList heading="How Samyojak helps retail businesses" items={useCases} />
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
          <Link href="/features/inventory" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See inventory features →
          </Link>
          <Link href="/industries/manufacturing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            ERP for manufacturing →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Bring your retail operations into one workspace"
        subheading="Import your existing product data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
