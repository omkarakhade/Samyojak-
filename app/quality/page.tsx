'use client'
import ModulePage from '@/components/ModulePage'

export default function Quality() {
  return (
    <ModulePage
      title="Quality Issues"
      subtitle="Defects and complaints, what caused them, and the fix you committed to"
      module="Quality Issues"
      accessKey="projects"
      requiredPlan="Business"
      addLabel="Report Issue"
      color="#FB923C"
      bg="#FFEDD5"
      shadow="#FB923C"
      fields={[
        { key: 'Issue No', label: 'Issue number', type: 'text', placeholder: 'QI-001' },
        { key: 'Product', label: 'Product', type: 'text', required: true, placeholder: 'Which product?' },
        { key: 'Defect', label: 'What is wrong', type: 'text', required: true, placeholder: 'e.g. Seal leaking' },
        { key: 'Quantity Affected', label: 'Units affected', type: 'number', placeholder: '0' },
        { key: 'Severity', label: 'Severity', type: 'select', options: ['Minor', 'Major', 'Critical'] },
        { key: 'Root Cause', label: 'Root cause', type: 'text', placeholder: 'Why did it happen? (if known)' },
        { key: 'Corrective Action', label: 'Corrective action', type: 'text', placeholder: 'What will stop it happening again?' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Open', 'Investigating', 'Fixed', 'Closed'] },
        { key: 'Reported Date', label: 'Reported date', type: 'date' },
        { key: 'Owner', label: 'Owner', type: 'text', placeholder: 'Who is responsible?' },
      ]}
    />
  )
}
