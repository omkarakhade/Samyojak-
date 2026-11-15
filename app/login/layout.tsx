import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Samyojak workspace to manage CRM, invoicing, inventory and more.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.samyojak-erp.com/login' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
