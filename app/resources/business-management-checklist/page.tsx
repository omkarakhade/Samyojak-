import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'Business Management Checklist',
  description: 'A checklist for auditing your current business operations — where data lives, what\'s manual, and where automation could help.',
  alternates: { canonical: 'https://samyojak.vercel.app/resources/business-management-checklist' },
  openGraph: {
    title: 'Business Management Checklist',
    description: 'A checklist for auditing your current business operations.',
    url: 'https://samyojak.vercel.app/resources/business-management-checklist',
  },
}

const items = [
  'Where does your lead and customer data currently live — one place, or scattered across tools?',
  'How much time does creating an invoice take, and is tax calculated manually?',
  'Do you know your current stock levels without physically checking?',
  'Are staff records, salaries, and leave balances tracked consistently?',
  'Do you have visibility into project deadlines across all active client work?',
  'Can you generate a revenue or tax report without building it manually?',
  'How many separate tools does your team log into during a normal week?',
]

export default function BusinessManagementChecklistPage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="Business Management Checklist"
      title="Business Management Checklist"
      intro="A quick audit to identify where your current operations rely on manual work or disconnected tools — and where centralizing could save real time."
      sectionHeading="Questions to audit your current operations"
      items={items}
      relatedLinks={[
        { label: 'Centralized business management', href: '/solutions/centralized-business-management' },
        { label: 'Replace multiple tools', href: '/solutions/replace-multiple-tools' },
      ]}
      ctaHeading="See what centralizing looks like"
      ctaSubheading="Import your existing data and be running in minutes."
    />
  )
}
