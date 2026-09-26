import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Users, Package, TrendingUp, FolderKanban, CheckSquare, ClipboardList } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Resources — Templates & Checklists',
  description: 'Free templates and checklists for invoicing, CRM, inventory, lead tracking, project management, and ERP evaluation.',
  alternates: { canonical: 'https://www.samyojak-erp.com/resources' },
  openGraph: {
    title: 'Resources — Templates & Checklists',
    description: 'Free templates and checklists for business management.',
    url: 'https://www.samyojak-erp.com/resources',
  },
}

const resources = [
  { title: 'Invoice Template', desc: 'What to include on a professional, tax-compliant invoice.', href: '/resources/invoice-template', icon: FileText, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'CRM Template', desc: 'A starting structure for tracking leads and customer relationships.', href: '/resources/crm-template', icon: Users, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'Inventory Template', desc: 'A starting structure for tracking stock and reorder levels.', href: '/resources/inventory-template', icon: Package, color: '#34D399', bg: '#D1FAE5' },
  { title: 'Lead Tracker', desc: 'A simple framework for tracking and prioritizing leads.', href: '/resources/lead-tracker', icon: TrendingUp, color: '#FBBF24', bg: '#FEF3C7' },
  { title: 'Project Management Template', desc: 'A starting structure for tracking projects and deadlines.', href: '/resources/project-management-template', icon: FolderKanban, color: '#8B5CF6', bg: '#EDE9FE' },
  { title: 'ERP Checklist', desc: 'A checklist for evaluating ERP software before you commit.', href: '/resources/erp-checklist', icon: CheckSquare, color: '#F472B6', bg: '#FCE7F3' },
  { title: 'Business Management Checklist', desc: 'A checklist for auditing your current business operations.', href: '/resources/business-management-checklist', icon: ClipboardList, color: '#34D399', bg: '#D1FAE5' },
]

export default function ResourcesPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Resources' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Free Templates & Checklists
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Practical templates and checklists for managing your business — use them on their own, or
            see how each maps directly to a Samyojak module.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(r => (
            <Link key={r.href} href={r.href}
              className="block p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: r.bg, border: `2px solid ${r.color}` }}>
                <r.icon size={20} style={{ color: r.color }} />
              </div>
              <h2 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{r.title}</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{r.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoCtaSection
        heading="Skip the template, use the real thing"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
}
