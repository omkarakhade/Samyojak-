import type { Metadata } from 'next'
import FeaturesClient from './FeaturesClient'

export const metadata: Metadata = {
  title: 'Features — Samyojak Adaptive ERP',
  description: 'CRM, quotations, invoicing, recurring billing, inventory, HR, recruiting, projects, reports, BI dashboard, and AI business intelligence — 12 modules in one adaptive workspace that imports your existing data as-is.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features' },
  openGraph: {
    title: 'Features — Samyojak Adaptive ERP',
    description: 'CRM, invoicing, inventory, HR, and AI in one adaptive workspace.',
    url: 'https://www.samyojak-erp.com/features',
  },
}

export default function FeaturesPage() {
  return <FeaturesClient />
}
