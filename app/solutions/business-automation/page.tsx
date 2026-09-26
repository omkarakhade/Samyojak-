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
  title: 'Business Automation — Samyojak',
  description: 'Automate recurring invoices, lead scoring, and reporting with Samyojak, reducing manual work across your business operations.',
  alternates: { canonical: 'https://www.samyojak-erp.com/solutions/business-automation' },
  openGraph: {
    title: 'Business Automation — Samyojak',
    description: 'Automate recurring invoices, lead scoring, and reporting with Samyojak.',
    url: 'https://www.samyojak-erp.com/solutions/business-automation',
  },
}

const useCases = [
  'Automatically generate and send recurring invoices on a weekly, monthly, or yearly schedule',
  'Let AI lead scoring rank your leads from 0–100 without manual review',
  'Get automatic low-stock alerts before you run out of inventory',
  'Generate tax reports and revenue summaries automatically instead of building them manually',
  'Automatically calculate tax rates based on the country you select for each invoice',
  'Ask the AI assistant for business insights instead of manually pulling numbers together',
]

const faqs = [
  {
    q: 'What parts of my business can Samyojak automate?',
    a: 'Samyojak automates recurring invoice generation, lead scoring, low-stock alerts, tax calculation, and report generation across your CRM, invoicing, and inventory data.',
  },
  {
    q: 'Does automation require any setup or configuration?',
    a: 'Recurring invoices and lead scoring work out of the box once you have data in the relevant modules — no separate automation configuration is required.',
  },
  {
    q: 'Can the AI assistant automate answering business questions?',
    a: 'The AI assistant on the Complete plan reads your live data and answers specific questions about leads, invoices, inventory, and more without you needing to manually check each module.',
  },
]

export default function BusinessAutomationPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Solutions', href: '/solutions' }, { label: 'Business Automation' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Business Automation With Samyojak
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Manual, repetitive tasks slow your business down. Samyojak automates recurring invoicing,
            lead scoring, stock alerts, and reporting so you can focus on the work that actually needs
            your attention.
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
          <SeoUseCaseList heading="What Samyojak automates" items={useCases} />
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
          <Link href="/features/recurring-invoices" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See recurring invoice features →
          </Link>
          <Link href="/features/ai-assistant" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>
            See AI assistant features →
          </Link>
        </div>
      </section>

      <SeoCtaSection
        heading="Let Samyojak handle the repetitive work"
        subheading="Import your data and start automating in minutes."
      />
      <MarketingFooter />
    </div>
  )
      }
