import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoCtaSection from '@/components/SeoCtaSection'
import { TAX_PAGES } from '@/lib/seoPages'

export const metadata: Metadata = {
  title: 'GST, VAT and Sales Tax Invoicing by Country | Samyojak',
  description: 'How Samyojak handles GST, VAT and sales tax on invoices in India, the UK, UAE, Singapore, Australia, Canada, the US and New Zealand.',
  alternates: { canonical: 'https://www.samyojak-erp.com/tax' },
}

export default function TaxIndex() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Tax invoicing by country</h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Samyojak picks GST, VAT or sales tax from the customer’s country, state and the items sold, and tells you what it applied. Choose your market.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TAX_PAGES.map(p => (
              <Link key={p.slug} href={`/tax/${p.slug}`} className="p-5 rounded-2xl hover:opacity-90"
                style={{ background: 'white', border: '2px solid #E2E8F0' }}>
                <h2 className="font-black mb-1" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{p.country}</h2>
                <p className="text-sm" style={{ color: '#64748B' }}>{p.h1}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SeoCtaSection heading="Invoice any customer, anywhere" subheading="Start a 14-day free trial. No card needed." />
      <MarketingFooter />
    </div>
  )
}
