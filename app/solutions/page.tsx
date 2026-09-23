import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, Rocket, TrendingUp, FileSpreadsheet, Layers, Zap, LayoutGrid } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Samyojak Solutions — Business Management for Every Stage',
  description: 'From small businesses and startups to growing companies, see how Samyojak\'s adaptive ERP replaces spreadsheets and disconnected tools with one centralized workspace.',
  alternates: { canonical: 'https://samyojak.vercel.app/solutions' },
  openGraph: {
    title: 'Samyojak Solutions — Business Management for Every Stage',
    description: 'See how Samyojak\'s adaptive ERP fits your business, wherever you are.',
    url: 'https://samyojak.vercel.app/solutions',
  },
}

const solutions = [
  { title: 'Small Business', desc: 'ERP and business management built for small business needs and budgets.', href: '/solutions/small-business', icon: Building2, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'Startups', desc: 'Move fast without spending weeks configuring business software.', href: '/solutions/startups', icon: Rocket, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'Growing Businesses', desc: 'Manage more clients, more staff, and more data without breaking your workflow.', href: '/solutions/growing-businesses', icon: TrendingUp, color: '#34D399', bg: '#D1FAE5' },
  { title: 'Replace Spreadsheets', desc: 'Move your CRM, invoicing, and inventory data out of Excel and into one system.', href: '/solutions/replace-spreadsheets', icon: FileSpreadsheet, color: '#FBBF24', bg: '#FEF3C7' },
  { title: 'Replace Multiple Tools', desc: 'Consolidate disconnected apps into one adaptive workspace.', href: '/solutions/replace-multiple-tools', icon: Layers, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'Business Automation', desc: 'Automate recurring invoices, lead scoring, and reporting.', href: '/solutions/business-automation', icon: Zap, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'Centralized Management', desc: 'CRM, invoices, inventory, HR, projects, and reports in one place.', href: '/solutions/centralized-business-management', icon: LayoutGrid, color: '#34D399', bg: '#D1FAE5' },
]

export default function SolutionsPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Solutions for Every Business
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Whether you're a small business, a startup moving fast, or a growing company outgrowing
            spreadsheets and disconnected tools, Samyojak adapts to where you are right now.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map(sol => (
            <Link key={sol.href} href={sol.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: sol.bg, border: `2px solid ${sol.color}` }}>
                <sol.icon size={20} style={{ color: sol.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{sol.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{sol.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="Find the right fit for your business"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
