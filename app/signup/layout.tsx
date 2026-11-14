import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start Your Free Trial',
  description: 'Create your Samyojak account and start a 14-day free trial on any plan. No credit card needed to begin.',
  alternates: { canonical: 'https://www.samyojak-erp.com/signup' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
