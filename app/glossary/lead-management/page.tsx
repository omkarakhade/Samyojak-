import type { Metadata } from 'next'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoGlossaryDefinition from '@/components/SeoGlossaryDefinition'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Lead Management Definition — Glossary',
  description: 'Lead management definition — tracking and prioritizing potential customers through a sales pipeline.',
  alternates: { canonical: 'https://samyojak.vercel.app/glossary/lead-management' },
  openGraph: {
    title: 'Lead Management Definition — Glossary',
    description: 'Lead management definition and explanation.',
    url: 'https://samyojak.vercel.app/glossary/lead-management',
  },
}

export default function GlossaryLeadManagementPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />
      <section className="px-6 pt-8">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Glossary', href: '/glossary' }, { label: 'Lead Management' }]} />
        </div>
      </section>
      <SeoGlossaryDefinition
        term="Lead Management"
        shortDefinition="The process of tracking and prioritizing potential customers through a sales pipeline."
        paragraphs={[
          'Lead management refers to tracking potential customers from their first point of contact through to a decision — whether that\'s a sale or a lost opportunity.',
          'This typically includes organizing leads into pipeline stages, setting follow-up reminders, and sometimes using AI-based scoring to prioritize which leads are most likely to convert.',
        ]}
        related={[
          { label: 'CRM', href: '/glossary/crm' },
          { label: 'ERP', href: '/glossary/erp' },
        ]}
      />
      <SeoCtaSection heading="Never lose track of a lead" subheading="Start tracking your pipeline in minutes." />
      <MarketingFooter />
    </div>
  )
}
