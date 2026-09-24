import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Glossary — ERP & Business Software Terms',
  description: 'Quick definitions of common ERP, CRM, and business software terms — ERP, CRM, SaaS, inventory management, business intelligence, and more.',
  alternates: { canonical: 'https://samyojak.vercel.app/glossary' },
  openGraph: {
    title: 'Glossary — ERP & Business Software Terms',
    description: 'Quick definitions of common ERP, CRM, and business software terms.',
    url: 'https://samyojak.vercel.app/glossary',
  },
}

const terms = [
  { term: 'ERP', href: '/glossary/erp' },
  { term: 'CRM', href: '/glossary/crm' },
  { term: 'SaaS', href: '/glossary/saas' },
  { term: 'Inventory Management', href: '/glossary/inventory-management' },
  { term: 'Business Intelligence', href: '/glossary/business-intelligence' },
  { term: 'Lead Management', href: '/glossary/lead-management' },
  { term: 'Business Automation', href: '/glossary/business-automation' },
  { term: 'Adaptive ERP', href: '/glossary/adaptive-erp' },
]

export default function GlossaryPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Glossary
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Quick, plain-language definitions of common terms in ERP and business management software.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {terms.map(t => (
              <Link key={t.href} href={t.href}
                className="block p-4 rounded-xl text-center transition-all hover:-translate-y-1"
                style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #F1F5F9' }}>
                <span className="font-bold text-sm" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{t.term}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SeoCtaSection
        heading="See these concepts in practice"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
