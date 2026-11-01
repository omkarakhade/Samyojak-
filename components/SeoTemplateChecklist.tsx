import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

interface SeoTemplateChecklistProps {
  breadcrumbLabel: string
  title: string
  intro: string
  sectionHeading: string
  items: string[]
  relatedLinks: { label: string; href: string }[]
  ctaHeading: string
  ctaSubheading: string
}

export default function SeoTemplateChecklist({
  breadcrumbLabel, title, intro, sectionHeading, items, relatedLinks, ctaHeading, ctaSubheading,
}: SeoTemplateChecklistProps) {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Resources', href: '/resources' }, { label: breadcrumbLabel }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            {title}
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>{intro}</p>
          <Link href="/signup"
            className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            Start Trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{sectionHeading}</h2>
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3">
          {relatedLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
              {link.label} →
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection heading={ctaHeading} subheading={ctaSubheading} />
      <MarketingFooter />
    </div>
  )
}
