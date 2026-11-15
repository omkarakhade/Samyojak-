import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Business Operating System Definition — Glossary',
  description: 'Business operating system definition — a single connected platform for running every core function of a business.',
  alternates: { canonical: 'https://www.samyojak-erp.com/glossary/business-operating-system' },
  openGraph: {
    title: 'Business Operating System Definition — Glossary',
    description: 'Business operating system definition and explanation.',
    url: 'https://www.samyojak-erp.com/glossary/business-operating-system',
  },
}

export default function GlossaryBusinessOperatingSystemPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'Business Operating System' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="Business Operating System"
        shortDefinition="A single connected platform for running every core function of a business, from sales to operations."
        paragraphs={[
          'A business operating system is a term used to describe software that acts as the central platform a business runs on, similar to how an operating system runs a computer.',
          'It typically brings together CRM, invoicing, inventory, HR, and project management into one connected workspace, so a business isn\'t dependent on multiple disconnected tools to function.',
        ]}
        related={[
          { label: 'ERP', href: '/glossary/erp' },
          { label: 'SaaS', href: '/glossary/saas' },
        ]}
      />
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>How it differs from an ERP</h2>
          <p className="text-base mb-3" style={{ color: '#475569' }}>An ERP records what happened. A business operating system also helps decide what to do next, using an assistant that reads your data and proposes actions you can confirm. The goal is fewer tools and fewer manual steps.</p>
          <p className="text-sm font-bold" style={{ color: '#8B5CF6' }}>Ask: does the tool only store data, or also act on it?</p>
        </div>
      </section>
      <SeoCtaSection heading="Run your business from one platform" subheading="Import your existing data and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
