import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Samyojak',
  description: 'Talk to the Samyojak team about plans, migration or support. We reply within one business day.',
  alternates: { canonical: 'https://www.samyojak-erp.com/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
