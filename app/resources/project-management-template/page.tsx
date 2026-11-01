import type { Metadata } from 'next'
import SeoTemplateChecklist from '@/components/SeoTemplateChecklist'

export const metadata: Metadata = {
  title: 'Project Management Template — Starting Structure',
  description: 'A starting structure for tracking projects — what fields, stages, and deadlines to include for client work.',
  alternates: { canonical: 'https://www.samyojak-erp.com/resources/project-management-template' },
  openGraph: {
    title: 'Project Management Template — Starting Structure',
    description: 'A starting structure for tracking projects and deadlines.',
    url: 'https://www.samyojak-erp.com/resources/project-management-template',
  },
}

const items = [
  'Project name and the client or team it belongs to',
  'A clear stage — Planning, In Progress, Review, or Done',
  'A start date and a deadline',
  'A progress percentage or milestone tracker',
  'Notes for scope, deliverables, or key decisions',
  'An owner responsible for the project moving forward',
]

export default function ProjectManagementTemplatePage() {
  return (
    <SeoTemplateChecklist
      breadcrumbLabel="Project Management Template"
      title="Project Management Template"
      intro="Whether it's one project or a dozen, here's the core structure that keeps client work visible and on track."
      sectionHeading="Fields to include in your project tracker"
      items={items}
      relatedLinks={[
        { label: 'See project management features', href: '/features/projects' },
        { label: 'ERP for agencies', href: '/industries/agencies' },
      ]}
      ctaHeading="Track projects on a real Kanban board"
      ctaSubheading="Start tracking projects in minutes."
    />
  )
}
