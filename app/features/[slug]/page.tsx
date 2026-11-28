import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SeoLanding from '@/components/SeoLanding'
import { FEATURE_PAGES } from '@/lib/seoPages'

export const dynamicParams = false
export function generateStaticParams() {
  return FEATURE_PAGES.map(p => ({ slug: p.slug }))
}

const find = (slug: string) => FEATURE_PAGES.find(p => p.slug === slug)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = find((await params).slug)
  if (!p) return {}
  const url = `https://www.samyojak-erp.com/features/${p.slug}`
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url },
  }
}

export default async function FeatureLanding({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug)
  if (!p) notFound()
  return <SeoLanding page={p} parent={{ label: 'Features', href: '/features' }} />
}
