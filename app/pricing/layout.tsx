import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Samyojak AI ERP',
  description: 'Simple pricing for the AI-powered ERP. 14-day free trial on every plan. Weekly, monthly and yearly options with regional pricing.',
  alternates: { canonical: 'https://www.samyojak-erp.com/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
