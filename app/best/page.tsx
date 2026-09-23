import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Building2, Users, DollarSign } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Best ERP & CRM Guides — Samyojak',
  description: 'Guides to choosing the best ERP for small business, best CRM software, and best adaptive ERP for growing companies.',
  alternates: { canonical: 'https://samyojak.vercel.app/best' },
  openGraph: {
    title: 'Best ERP & CRM Guides — Samyojak',
    description: 'Guides to choosing the best ERP and CRM software for your business.',
    url: 'https://samyojak.vercel.app/best',
  },
}

const guides = [
  { title: 'Best ERP for Small Business', desc: 'What to look for in an ERP when budget and setup time matter most.', href: '/best/erp-for-small-business', icon: Building2, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'Best CRM Software', desc: 'Comparing CRM options for lead tracking, pipeline management, and follow-ups.', href: '/best/crm-software', icon: Users, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'Best Adaptive ERP', desc: 'Why adaptive data import matters and how to evaluate it.', href: '/best/adaptive-erp', icon: Award, color: '#34D399', bg: '#D1FAE5' },
  { title: 'Best Affordable ERP', desc: 'ERP options that don\'t require per-user fees or annual contracts.', href: '/best/affordable-erp', icon: DollarSign, color: '#FBBF24', bg: '#FEF3C7' },
]

export default function BestPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Best' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Guides to Choosing the Right ERP
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Practical guides on what to actually look for when comparing ERP and CRM software —
            written for business owners evaluating options, not developers.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map(g => (
            <Link key={g.href} href={g.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: g.bg, border: `2px solid ${g.color}` }}>
                <g.icon size={20} style={{ color: g.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{g.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{g.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="See if Samyojak fits what you're looking for"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
