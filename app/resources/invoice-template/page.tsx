import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'Invoice Template — What to Include',
  description: 'What a professional, tax-compliant invoice should include — client details, line items, tax calculation, and payment terms.',
  alternates: { canonical: 'https://www.samyojak-erp.com/resources/invoice-template' },
  openGraph: {
    title: 'Invoice Template — What to Include',
    description: 'What a professional, tax-compliant invoice should include.',
    url: 'https://www.samyojak-erp.com/resources/invoice-template',
  },
}

const items = [
  'Your business name, address, and contact details',
  'Client name, address, and contact details',
  'A unique invoice number for tracking',
  'The invoice date and payment due date',
  'Line items with description, quantity, and unit price',
  'The applicable tax rate and calculated tax amount for the client\'s region',
  'A clear total amount due',
  'Payment terms and accepted payment methods',
]

export default function InvoiceTemplatePage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="Invoice Template"
      title="Invoice Template"
      intro="A professional invoice needs more than just a price. Here's what to include to make sure your invoices are clear, complete, and tax-compliant."
      sectionHeading="What to include on every invoice"
      items={items}
      relatedLinks={[
        { label: 'See invoicing features', href: '/features/invoicing' },
        { label: 'Recurring invoices', href: '/features/recurring-invoices' },
      ]}
      ctaHeading="Skip the manual template"
      ctaSubheading="Create tax-compliant invoices in Samyojak in seconds."
    />
  )
}
