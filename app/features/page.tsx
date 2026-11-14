import type { Metadata } from 'next'
import FeaturesClient from './FeaturesClient'

export const metadata: Metadata = {
  title: 'Features — Samyojak Adaptive ERP',
  description: '12 modules in one adaptive workspace: CRM, invoicing, inventory, HR, projects, reports and AI insights. Imports your data as-is.',
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
