import type { Metadata } from 'next'
import FeaturesClient from './FeaturesClient'

export const metadata: Metadata = {
  title: 'Features — Samyojak Adaptive ERP',
  description: 'An ERP that adjusts to you: CRM, invoicing, books, stock and warehouses, manufacturing, payroll, projects and reports. Imports your data as-is.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features' },
  openGraph: {
    title: 'Features — Samyojak Adaptive ERP',
    description: 'CRM, invoicing, books, stock, manufacturing and payroll in one adaptive workspace.',
    url: 'https://www.samyojak-erp.com/features',
  },
}

export default function FeaturesPage() {
  return <FeaturesClient />
}
