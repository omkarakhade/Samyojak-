import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'ERP Evaluation Checklist',
  description: 'A checklist for evaluating ERP software before you commit — data migration, pricing, modules, and setup time.',
  alternates: { canonical: 'https://www.samyojak-erp.com/resources/erp-checklist' },
  openGraph: {
    title: 'ERP Evaluation Checklist',
    description: 'A checklist for evaluating ERP software before you commit.',
    url: 'https://www.samyojak-erp.com/resources/erp-checklist',
  },
}

const items = [
  'Does it accept your existing data as a direct CSV import, without reformatting?',
  'Is pricing flat-rate, or does it scale per user as your team grows?',
  'Is there a mandatory annual contract, or can you pay weekly or monthly?',
  'Does it support the tax system your business needs — GST, VAT, Sales Tax, or others?',
  'Can you realistically test setup time before committing?',
  'Which modules are included at each pricing tier, and do you need all of them now?',
  'Can you export your data back out if you decide to switch later?',
]

export default function ErpChecklistPage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="ERP Checklist"
      title="ERP Evaluation Checklist"
      intro="Before committing to an ERP, run through this checklist to avoid the most common regrets — hidden costs, long setup times, and painful data migration."
      sectionHeading="Questions to ask before choosing an ERP"
      items={items}
      relatedLinks={[
        { label: 'How to choose an ERP', href: '/learn/how-to-choose-an-erp' },
        { label: 'Best ERP for small business', href: '/best/erp-for-small-business' },
      ]}
      ctaHeading="See how Samyojak checks these boxes"
      ctaSubheading="Import your existing data and be running in minutes."
    />
  )
}
