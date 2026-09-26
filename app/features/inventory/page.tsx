import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Inventory + Free QR Codes — Samyojak Features',
  description: 'Track stock levels with automatic QR code generation, low-stock alerts, and reorder management. Import your existing inventory data without reformatting.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features/inventory' },
  openGraph: {
    title: 'Inventory + Free QR Codes — Samyojak Features',
    description: 'Stock tracking with auto-generated QR codes and low-stock alerts.',
    url: 'https://www.samyojak-erp.com/features/inventory',
  },
}

const items = [
  'Free auto-generated QR codes for every product in your inventory',
  'Real-time stock level tracking',
  'Low-stock alerts and configurable reorder levels',
  'Category management for organizing products',
  'SKU tracking',
  'Import products from any CSV format',
  'Export your full inventory to CSV anytime',
]

const faqs = [
  { q: 'Are QR codes really free?', a: 'Yes. Every product added to your inventory automatically gets a QR code generated at no extra cost.' },
  { q: 'Does Samyojak alert me before I run out of stock?', a: 'Yes. Set a reorder level for each product and Samyojak surfaces low-stock alerts before you run out.' },
  { q: 'Can I import my existing product catalog?', a: 'Yes. Export your inventory as a CSV and Samyojak\'s adaptive import accepts it without requiring a predefined structure.' },
]

export default function InventoryFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Inventory' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Inventory + Free QR Codes
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Track your stock with automatic QR code generation, low-stock alerts, and reorder
            management — with your existing product data imported as-is.
          </p>
          <Link href="/signup"
            className="px-6 py-3 rounded-full text-sm font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            Start Trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>What's included</h2>
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/industries/retail" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for retail →</Link>
          <Link href="/industries/manufacturing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for manufacturing →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Track your stock without the manual counting" subheading="Import your inventory and be running in minutes." />
      <MarketingFooter />
    </div>
  )
}
