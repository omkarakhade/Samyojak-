import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'SaaS Definition — Glossary',
  description: 'SaaS (Software as a Service) definition — cloud-hosted software accessed through a subscription, with no installation required.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/saas' },
  openGraph: {
    title: 'SaaS Definition — Glossary',
    description: 'SaaS definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/saas',
  },
}

export default function GlossarySaasPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'SaaS' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="SaaS"
        shortDefinition="Software as a Service — cloud-hosted software accessed via subscription, with no installation required."
        paragraphs={[
          'SaaS stands for Software as a Service. It describes software that is hosted in the cloud and accessed through a web browser or app, rather than installed locally on a computer or server.',
          'SaaS platforms are typically paid for through a subscription — weekly, monthly, or yearly — and updates, maintenance, and hosting are handled by the provider rather than the customer.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'Business Operating System', href: '/glossary/business-operating-system' },
        ]}
      />
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>What you should check before buying</h2>
          <p className="text-base mb-3" style={{ color: '#475569' }}>Look at pricing per user, how your data can be exported, where it is stored and what happens if you stop paying. SaaS saves you from running servers, but you still need a way out.</p>
          <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Ask: can I export all my data whenever I want?</p>
        </div>
      </section>
      <SeoCtaSection heading="Try a SaaS ERP built for you" subheading="No installation, no maintenance — just sign up." />
      <MarketingFooter />
    </div>
  )
}
