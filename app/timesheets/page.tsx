'use client'
import ModulePage from '@/components/ModulePage'

export default function Timesheets() {
  return (
    <ModulePage
      title="Timesheets"
      subtitle="Hours worked, by project and client, so you know what to bill"
      module="Timesheets"
      accessKey="projects"
      requiredPlan="Business"
      addLabel="Log Hours"
      color="#38BDF8"
      bg="#E0F2FE"
      shadow="#38BDF8"
      fields={[
        { key: 'Date', label: 'Date', type: 'date' },
        { key: 'Person', label: 'Who worked', type: 'text', placeholder: 'Name' },
        { key: 'Project', label: 'Project', type: 'text', required: true, placeholder: 'e.g. Website' },
        { key: 'Client', label: 'Client', type: 'text', placeholder: 'Who is it for?' },
        { key: 'Task', label: 'What was done', type: 'text', placeholder: 'e.g. Home page design' },
        { key: 'Hours', label: 'Hours', type: 'number', required: true, placeholder: '0' },
        { key: 'Billable', label: 'Billable?', type: 'select', options: ['Yes', 'No'] },
        { key: 'Hourly Rate', label: 'Hourly rate', type: 'number', placeholder: '0' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Anything else' },
      ]}
    />
  )
}
