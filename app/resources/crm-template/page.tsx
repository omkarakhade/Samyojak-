import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'CRM Template — Starting Structure for Lead Tracking',
  description: 'A starting structure for tracking leads and customer relationships — what fields and pipeline stages to include.',
  alternates: { canonical: 'https://samyojak.vercel.app/resources/crm-template' },
  openGraph: {
    title: 'CRM Template — Starting Structure for Lead Tracking',
    description: 'A starting structure for tracking leads and customer relationships.',
    url: 'https://samyojak.vercel.app/resources/crm-template',
  },
}

const items = [
  'Lead name and contact details — email and phone',
  'Lead source — where they came from',
  'Pipeline status — New, Contacted, Converted, or Lost',
  'A follow-up date to prevent leads from going cold',
  'Notes field for context from conversations',
  'A priority or score to help decide who to follow up with first',
  'Deal value, if applicable, to estimate potential revenue',
]

export default function CrmTemplatePage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="CRM Template"
      title="CRM Template"
      intro="Whether you're using a spreadsheet or dedicated software, here's the core structure a CRM needs to actually be useful for tracking leads."
      sectionHeading="Fields to include in your CRM"
      items={items}
      relatedLinks={[
        { label: 'See CRM features', href: '/features/crm' },
        { label: 'Best CRM software', href: '/best/crm-software' },
      ]}
      ctaHeading="Skip the spreadsheet, use AI lead scoring"
      ctaSubheading="Import your leads and start tracking in minutes."
    />
  )
}
