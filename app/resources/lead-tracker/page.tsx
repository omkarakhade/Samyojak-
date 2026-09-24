import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'Lead Tracker — Framework for Prioritizing Leads',
  description: 'A simple framework for tracking and prioritizing leads so none go cold and follow-ups happen on time.',
  alternates: { canonical: 'https://samyojak.vercel.app/resources/lead-tracker' },
  openGraph: {
    title: 'Lead Tracker — Framework for Prioritizing Leads',
    description: 'A simple framework for tracking and prioritizing leads.',
    url: 'https://samyojak.vercel.app/resources/lead-tracker',
  },
}

const items = [
  'A clear status for every lead — don\'t let leads sit in limbo without a defined stage',
  'A specific next follow-up date, not a vague "follow up later"',
  'A note of the last interaction, so you don\'t repeat yourself on the next call',
  'A way to rank or score leads, so you know who to prioritize when time is limited',
  'A regular review — weekly at minimum — to catch leads that have gone quiet',
  'A defined point where a lead is marked lost, so your active list stays accurate',
]

export default function LeadTrackerPage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="Lead Tracker"
      title="Lead Tracker"
      intro="A lead tracker is only useful if it actually gets used consistently. Here's a simple framework that keeps leads from falling through the cracks."
      sectionHeading="What a working lead tracker needs"
      items={items}
      relatedLinks={[
        { label: 'See CRM features', href: '/features/crm' },
        { label: 'What is lead management?', href: '/glossary/lead-management' },
      ]}
      ctaHeading="Let AI score your leads automatically"
      ctaSubheading="Import your leads and start tracking in minutes."
    />
  )
}
