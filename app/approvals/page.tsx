'use client'
import ModulePage from '@/components/ModulePage'

export default function Approvals() {
  return (
    <ModulePage
      title="Approvals"
      subtitle="Things waiting for your yes or no, like a discount or a big purchase. Tell the assistant your decision"
      module="Approvals"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Request"
      color="#A78BFA"
      bg="#EDE9FE"
      shadow="#A78BFA"
      fields={[
        { key: 'Request', label: 'What needs approval', type: 'text', required: true, placeholder: '10% discount for Mehta' },
        { key: 'Requested By', label: 'Asked by', type: 'text', placeholder: 'Name' },
        { key: 'Amount', label: 'Amount', type: 'number', placeholder: '0' },
        { key: 'Date', label: 'Date', type: 'date' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
