import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Project Management — Samyojak Features',
  description: 'Track client projects on a Kanban board with Planning, In Progress, Review, and Done stages, deadlines, and progress tracking.',
  alternates: { canonical: 'https://samyojak.vercel.app/features/projects' },
  openGraph: {
    title: 'Project Management — Samyojak Features',
    description: 'Kanban board, deadlines, progress tracking, client projects.',
    url: 'https://samyojak.vercel.app/features/projects',
  },
}

const items = [
  '4-column Kanban board — Planning, In Progress, Review, Done',
  'Deadline tracking with overdue alerts',
  'Progress percentage tracking per project',
  'Move a project between stages with one click',
  'Set project start dates and deadlines',
  'Create and delete projects instantly',
]

const faqs = [
  { q: 'How does the project Kanban board work?', a: 'Projects move through four columns — Planning, In Progress, Review, Done — and can be moved between stages with a single click as work progresses.' },
  { q: 'Does Samyojak alert me about overdue projects?', a: 'Yes. Projects past their deadline are flagged so nothing slips through unnoticed.' },
  { q: 'Can I track progress percentage on each project?', a: 'Yes. Each project can have a progress percentage tracked alongside its Kanban stage.' },
]

export default function ProjectsFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'Projects' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Project Management
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Track all your client projects on a visual Kanban board, with deadlines and progress
            tracked alongside your CRM and invoicing data.
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
          <Link href="/industries/construction" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for construction →</Link>
          <Link href="/industries/agencies" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP for agencies →</Link>
        </div>
      </section>

      <SeoCtaSection heading="See every project's status at a glance" subheading="Start tracking projects in minutes." />
      <MarketingFooter />
    </div>
  )
}
