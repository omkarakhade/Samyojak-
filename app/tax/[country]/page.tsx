import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SeoLanding from '@/components/SeoLanding'
import { TAX_PAGES } from '@/lib/seoPages'
import FreeInvoiceGenerator from '@/components/FreeInvoiceGenerator'

export const dynamicParams = false
export function generateStaticParams() {
  return TAX_PAGES.map(p => ({ country: p.slug }))
}

const find = (slug: string) => TAX_PAGES.find(p => p.slug === slug)

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const p = find((await params).country)
  if (!p) return {}
  const url = `https://www.samyojak-erp.com/tax/${p.slug}`
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url },
  }
}

export default async function TaxLanding({ params }: { params: Promise<{ country: string }> }) {
  const p = find((await params).country)
  if (!p) notFound()
  return <SeoLanding page={p} parent={{ label: 'Tax by country', href: '/tax' }} rates={p.rates} ratesTitle={`${p.country}: rates at a glance`} extra={<FreeInvoiceGenerator slug={p.slug} country={p.country} />} />
}
