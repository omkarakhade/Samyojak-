import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Samyojak collects, uses and protects your data, and the choices you have.',
  alternates: { canonical: 'https://www.samyojak-erp.com/privacy' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
