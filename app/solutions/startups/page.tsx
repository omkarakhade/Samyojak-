import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoUseCaseList from '@/components/SeoUseCaseList'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'Business Management for Startups — Samyojak',
  description: 'A fast, adaptive ERP for startups that need CRM, invoicing, and project tracking without spending time on setup or configuration.',
  alternates: { canonical: 'https://www.samyojak-erp.com/solutions/startups' },
  openGraph: {
    title: 'Business Management for Startups — Samyojak',
    description: 'A fast, adaptive ERP for startups that need to move quickly.',
    url: 'https://www.samyojak-erp.com/solutions/startups',
  },
}

const useCases = [
  'Get CRM, invoicing, and project tracking running in minutes',
  'Import any early customer or lead data you already have',
  'Send quotations and invoices without configuring a chart of accounts first',
  'Track hiring through the recruiting module as your team grows',
  'Use AI business intelligence to get quick answers about your metrics',
  'Start on a weekly plan and scale up as your startup grows',
]

const faqs = [
  {
    q: 'Is Samyojak good for an early-stage startup?',
    a: 'Yes. Samyojak is built to get you operational quickly without needing to configure modules or hire a consultant, which matters when time and resources are limited early on.',
  },
  {
    q: 'Can Samyojak grow with my startup?',
    a: 'Yes. Start with CRM Starter or ERP Basic, and move up to Business or Complete ERP plans as you add HR, projects, and AI needs.',
  },
  {
    q: 'Does Samyojak support recruiting as I hire my first employees?',
    a: 'Yes. The recruiting module tracks candidates through Applied, Screening, Interview, Offer, and Hired stages.',
  },
]

export default function StartupsPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Startups' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Business Management for Startups
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Startups move fast and can't afford weeks of ERP setup. Samyojak gets CRM, invoicing,
            projects, and recruiting running in minutes, adapting to the data you already have.
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
          <SeoUseCaseList heading="Why startups choose Samyojak" items={useCases} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Frequently asked questions
          </h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3">
          <Link href="/features/recruiting" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See recruiting features →
          </Link>
          <Link href="/solutions/growing-businesses" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            Business management for growing businesses →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Move fast without the setup overhead"
        subheading="Import your existing data and be running in minutes."
      />
      <MarketingFooter />
    </div>
  )
      }
