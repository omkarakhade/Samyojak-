import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

export const metadata: Metadata = {
  title: 'AI Business Intelligence — Samyojak Features',
  description: 'Ask your AI assistant anything about your business. Samyojak reads your live leads, invoices, inventory, and projects to give real answers.',
  alternates: { canonical: 'https://www.samyojak-erp.com/features/ai-assistant' },
  openGraph: {
    title: 'AI Business Intelligence — Samyojak Features',
    description: 'Ask AI anything about your business, get real answers from your live data.',
    url: 'https://www.samyojak-erp.com/features/ai-assistant',
  },
}

const items = [
  'Reads your live leads, invoices, inventory, HR, and project data in real time',
  'Gives specific answers using your actual business numbers, not generic advice',
  'Quick question buttons for common business queries',
  'Floating AI bubble available on every page in the dashboard',
  'Powered by Groq for fast responses',
  'Included on the Complete ERP plan',
]

const faqs = [
  { q: 'Does the AI assistant use my real business data?', a: 'Yes. It reads your live leads, invoices, inventory, HR, and project data before responding, so answers are based on your actual numbers.' },
  { q: 'What kinds of questions can I ask?', a: 'You can ask about lead status, overdue invoices, low stock, payroll totals, project deadlines, and general business overview questions.' },
  { q: 'Which plan includes the AI assistant?', a: 'AI Business Intelligence is included on the Complete ERP plan.' },
]

export default function AiAssistantFeaturePage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <MarketingNav active="features" />

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Features', href: '/features' }, { label: 'AI Assistant' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            AI Business Intelligence
          </h1>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Ask your AI assistant anything about your business. It reads your live data and gives real,
            specific answers — not generic advice.
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
          <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>How the AI assistant works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl" style={{ background: 'white', border: '2px solid #E2E8F0' }}>
              <h3 className="font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Ask in your words</h3>
              <p className="text-sm" style={{ color: '#64748B' }}>Type a question such as who has not paid this month.</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: 'white', border: '2px solid #E2E8F0' }}>
              <h3 className="font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>It finds the right report</h3>
              <p className="text-sm" style={{ color: '#64748B' }}>The assistant chooses the report and the calculation runs in code, so numbers are exact.</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: 'white', border: '2px solid #E2E8F0' }}>
              <h3 className="font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Confirm before changes</h3>
              <p className="text-sm" style={{ color: '#64748B' }}>When it proposes a change, you see a preview and confirm or undo it.</p>
            </div>
          </div>
          <p className="text-sm mt-6" style={{ color: '#475569' }}>For owners who would rather ask than hunt through menus.</p>
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
          <Link href="/features/business-intelligence" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See BI dashboard features →</Link>
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>See pricing →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Ask your business questions, get real answers" subheading="Start using AI insights in minutes." />
      <MarketingFooter />
    </div>
  )
}
