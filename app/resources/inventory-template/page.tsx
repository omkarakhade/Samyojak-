import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'Inventory Template — Starting Structure for Stock Tracking',
  description: 'A starting structure for tracking inventory — what fields to include for stock levels, reorder points, and product identification.',
  alternates: { canonical: 'https://www.samyojak-erp.com/resources/inventory-template' },
  openGraph: {
    title: 'Inventory Template — Starting Structure for Stock Tracking',
    description: 'A starting structure for tracking inventory.',
    url: 'https://www.samyojak-erp.com/resources/inventory-template',
  },
}

const items = [
  'Product name and description',
  'SKU or unique identifier for each product',
  'Category, for organizing similar products',
  'Current stock quantity',
  'Reorder level — the threshold that should trigger a restock',
  'Unit cost and selling price',
  'Supplier information, if applicable',
]

export default function InventoryTemplatePage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="Inventory Template"
      title="Inventory Template"
      intro="A basic inventory tracker needs more than just a product name and quantity. Here's the structure that actually prevents you from running out of stock unexpectedly."
      sectionHeading="Fields to include in your inventory tracker"
      items={items}
      relatedLinks={[
        { label: 'See inventory features', href: '/features/inventory' },
        { label: 'ERP for retail', href: '/industries/retail' },
      ]}
      ctaHeading="Get automatic low-stock alerts"
      ctaSubheading="Import your product data and be running in minutes."
    />
  )
}
