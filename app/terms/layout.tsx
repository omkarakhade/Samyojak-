import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you use Samyojak, including plans, payments and acceptable use.',
  alternates: { canonical: 'https://www.samyojak-erp.com/terms' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
