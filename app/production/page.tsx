'use client'
import ModulePage from '@/components/ModulePage'

export default function Production() {
  return (
    <ModulePage
      title="Production Jobs"
      subtitle="What you are making, how much is done, and what is running late"
      module="Production Jobs"
      accessKey="projects"
      requiredPlan="Business"
      addLabel="Add Job"
      color="#60A5FA"
      bg="#DBEAFE"
      shadow="#60A5FA"
      fields={[
        { key: 'Job No', label: 'Job number', type: 'text', placeholder: 'JOB-001' },
        { key: 'Product', label: 'Product', type: 'text', required: true, placeholder: 'What are you making?' },
        { key: 'Quantity Planned', label: 'Quantity planned', type: 'number', required: true, placeholder: '0' },
        { key: 'Quantity Made', label: 'Quantity made so far', type: 'number', placeholder: '0' },
        { key: 'Start Date', label: 'Start date', type: 'date' },
        { key: 'Due Date', label: 'Due date', type: 'date' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Planned', 'In Progress', 'On Hold', 'Done'] },
        { key: 'Line', label: 'Line or machine', type: 'text', placeholder: 'Optional' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
