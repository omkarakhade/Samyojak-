'use client'
import ModulePage from '@/components/ModulePage'

export default function ExpenseClaims() {
  return (
    <ModulePage
      title="Expense Claims"
      subtitle="Money staff spent for the business and want back"
      module="Expense Claims"
      accessKey="hr"
      requiredPlan="Business"
      addLabel="Add Claim"
      color="#F472B6"
      bg="#FCE7F3"
      shadow="#F472B6"
      fields={[
        { key: 'Employee', label: 'Employee', type: 'text', required: true, placeholder: 'Name' },
        { key: 'Category', label: 'Category', type: 'text', placeholder: 'Travel, Food...' },
        { key: 'Amount', label: 'Amount', type: 'number', required: true, placeholder: '0' },
        { key: 'Date', label: 'Date', type: 'date' },
        { key: 'Description', label: 'What for', type: 'text', placeholder: 'Optional' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Submitted', 'Approved', 'Reimbursed', 'Rejected'] },
      ]}
    />
  )
}
