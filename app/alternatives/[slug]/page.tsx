import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SeoLanding from '@/components/SeoLanding'
import { ALT_PAGES } from '@/lib/altPages'

export const dynamicParams = false
export function generateStaticParams() {
  return ALT_PAGES.map(p => ({ slug: p.slug }))
}

const find = (slug: string) => ALT_PAGES.find(p => p.slug === slug)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = find((await params).slug)
  if (!p) return {}
  const url = `https://www.samyojak-erp.com/alternatives/${p.slug}`
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url },
  }
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug)
  if (!p) notFound()
  return <SeoLanding page={p} parent={{ label: 'Alternatives', href: '/alternatives' }} />
}
