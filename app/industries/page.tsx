import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Factory, ShoppingBag, Stethoscope, GraduationCap } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'ERP for Every Industry — Samyojak',
  description: 'Samyojak adapts to how your industry already works. See how manufacturing, retail, healthcare, and education businesses use Samyojak for CRM, invoicing, inventory, and more.',
  alternates: { canonical: 'https://samyojak.vercel.app/industries' },
  openGraph: {
    title: 'ERP for Every Industry — Samyojak',
    description: 'Samyojak adapts to how your industry already works.',
    url: 'https://samyojak.vercel.app/industries',
  },
}

const industries = [
  { title: 'Manufacturing', desc: 'Inventory, suppliers, projects, and invoicing for production businesses.', href: '/industries/manufacturing', icon: Factory, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'Retail', desc: 'Point-of-sale inventory, customer tracking, and invoicing for retail operations.', href: '/industries/retail', icon: ShoppingBag, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'Healthcare', desc: 'Patient-adjacent business management — billing, staff, and operations tracking.', href: '/industries/healthcare', icon: Stethoscope, color: '#34D399', bg: '#D1FAE5' },
  { title: 'Education', desc: 'Administrative and business management for schools and training institutes.', href: '/industries/education', icon: GraduationCap, color: '#FBBF24', bg: '#FEF3C7' },
]

export default function IndustriesPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Industries' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Built for Your Industry
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Samyojak doesn't force your business into a rigid template. Whatever industry you're in,
            the same core modules — CRM, invoicing, inventory, HR, and projects — adapt to how you
            actually work.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {industries.map(ind => (
            <Link key={ind.href} href={ind.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: ind.bg, border: `2px solid ${ind.color}` }}>
                <ind.icon size={20} style={{ color: ind.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{ind.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{ind.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="See Samyojak for your industry"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
                  }
