'use client'
import ModulePage from '@/components/ModulePage'

export default function RecurringInvoices() {
  return (
    <ModulePage
      title="Recurring Invoices"
      subtitle="Things you bill again and again, like monthly maintenance. Tell the assistant to bill what is due and it makes the invoices"
      module="Recurring Invoices"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Recurring Bill"
      color="#34D399"
      bg="#D1FAE5"
      shadow="#34D399"
      fields={[
        { key: 'Client Name', label: 'Client', type: 'text', required: true, placeholder: 'Who do you bill?' },
        { key: 'Description', label: 'For what', type: 'text', placeholder: 'Website maintenance' },
        { key: 'Amount', label: 'Amount each time', type: 'number', required: true, placeholder: '2000' },
        { key: 'Frequency', label: 'How often', type: 'select', options: ['Monthly', 'Weekly', 'Quarterly', 'Yearly'] },
        { key: 'Next Date', label: 'Next bill date', type: 'date', required: true },
        { key: 'Status', label: 'Status', type: 'select', options: ['Active', 'Paused', 'Ended'] },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
