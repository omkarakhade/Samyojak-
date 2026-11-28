import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'
import type { SeoPage } from '@/lib/seoPages'

const heading = { fontFamily: 'Outfit', color: '#1E293B' } as const

/** One layout for the data-driven marketing pages (see lib/seoPages.ts). */
export default function SeoLanding({
  page,
  parent,
  rates,
  ratesTitle,
}: {
  page: SeoPage
  parent: { label: string; href: string }
  rates?: string[]
  ratesTitle?: string
}) {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: parent.label, href: parent.href }, { label: page.h1 }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={heading}>{page.h1}</h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>{page.intro}</p>
          <Link href="/signup"
            className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            Start Trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {rates && rates.length > 0 && (
        <section className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black mb-4" style={heading}>{ratesTitle || 'Rates at a glance'}</h2>
            <ul className="space-y-3">
              {rates.map(r => (
                <li key={r} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                  <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#8B5CF6' }} />{r}
                </li>
              ))}
            </ul>
            <p className="text-xs mt-4" style={{ color: '#94A3B8' }}>Tax rates change and some items are borderline. Treat this as a guide and confirm with your accountant.</p>
          </div>
        </section>
      )}

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={heading}>{page.heading}</h2>
          <ul className="space-y-3">
            {page.items.map(item => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {page.steps && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black mb-6" style={heading}>How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {page.steps.map((s, i) => (
                <div key={s.title} className="p-5 rounded-2xl" style={{ background: 'white', border: '2px solid #E2E8F0' }}>
                  <h3 className="font-black mb-2" style={heading}>{i + 1}. {s.title}</h3>
                  <p className="text-sm" style={{ color: '#64748B' }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={heading}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={page.faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          {page.related.map(r => (
            <Link key={r.href} href={r.href} className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>{r.label} →</Link>
          ))}
        </div>
      </section>

      <SeoCtaSection heading={page.cta} subheading="Start a 14-day free trial. No card needed." />
      <MarketingFooter />
    </div>
  )
}
