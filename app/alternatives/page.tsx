import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP & CRM Alternatives — Samyojak',
  description: 'Exploring alternatives to Odoo, Zoho, spreadsheets, or juggling multiple business tools? See how Samyojak\'s adaptive ERP approach compares.',
  alternates: { canonical: 'https://samyojak.vercel.app/alternatives' },
  openGraph: {
    title: 'ERP & CRM Alternatives — Samyojak',
    description: 'Exploring alternatives to Odoo, Zoho, spreadsheets, or multiple business tools? See how Samyojak compares.',
    url: 'https://samyojak.vercel.app/alternatives',
  },
}

const alternatives = [
  {
    title: 'Odoo Alternative',
    desc: 'Faster setup, adaptive data import, and a unified workspace instead of many modules.',
    href: '/alternatives/odoo',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    title: 'Zoho Alternative',
    desc: 'One login instead of several connected apps, with flat pricing regardless of team size.',
    href: '/alternatives/zoho',
    color: '#F472B6',
    bg: '#FCE7F3',
  },
]

export default function AlternativesPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Alternatives' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Looking for an Alternative?
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            If your current ERP, CRM, or business software isn't working the way you need it to,
            here's how Samyojak's adaptive approach compares to popular alternatives.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {alternatives.map(a => (
            <Link key={a.href} href={a.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: a.bg, border: `2px solid ${a.color}` }}>
                <ArrowRight size={20} style={{ color: a.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{a.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="Try the adaptive alternative"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
