import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, GitCompare, Sparkles, Layers } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Learn — ERP, CRM & Business Software Explained',
  description: 'Clear explanations of what ERP is, how it differs from CRM, what adaptive ERP means, and how to choose the right business management software.',
  alternates: { canonical: 'https://samyojak.vercel.app/learn' },
  openGraph: {
    title: 'Learn — ERP, CRM & Business Software Explained',
    description: 'Clear explanations of ERP, CRM, and business management software.',
    url: 'https://samyojak.vercel.app/learn',
  },
}

const topics = [
  { title: 'What Is ERP?', desc: 'Definition, purpose, and examples of enterprise resource planning software.', href: '/learn/what-is-erp', icon: BookOpen, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'What Is CRM?', desc: 'Definition, purpose, and examples of customer relationship management software.', href: '/learn/what-is-crm', icon: BookOpen, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'What Is Adaptive ERP?', desc: 'How adaptive ERP differs from traditional, module-based ERP systems.', href: '/learn/what-is-adaptive-erp', icon: Sparkles, color: '#34D399', bg: '#D1FAE5' },
  { title: 'ERP vs CRM', desc: 'The difference between ERP and CRM, and when a business needs each.', href: '/learn/erp-vs-crm', icon: GitCompare, color: '#FBBF24', bg: '#FEF3C7' },
  { title: 'ERP vs Spreadsheets', desc: 'When spreadsheets stop working and what an ERP does differently.', href: '/learn/erp-vs-spreadsheet', icon: GitCompare, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'How Does ERP Work?', desc: 'How data flows from entry to operations to reporting inside an ERP.', href: '/learn/how-does-erp-work', icon: Layers, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'How to Choose an ERP', desc: 'A practical checklist for evaluating ERP software before you commit.', href: '/learn/how-to-choose-an-erp', icon: BookOpen, color: '#34D399', bg: '#D1FAE5' },
]

export default function LearnPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Learn About ERP & CRM
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Clear, straightforward explanations of the terms and concepts around business management
            software — no jargon, no sales pitch.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(t => (
            <Link key={t.href} href={t.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: t.bg, border: `2px solid ${t.color}` }}>
                <t.icon size={20} style={{ color: t.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{t.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="See these concepts in practice"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
