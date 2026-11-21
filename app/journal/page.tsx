'use client'
import ModulePage from '@/components/ModulePage'

export default function Journal() {
  return (
    <ModulePage
      title="Journal Entries"
      subtitle="Money moves that are not a sale or an expense: capital you put in, loans, drawings, opening balances"
      module="Journal Entries"
      accessKey="expenses"
      requiredPlan="ERP Basic"
      addLabel="Add Entry"
      color="#A78BFA"
      bg="#EDE9FE"
      shadow="#A78BFA"
      fields={[
        { key: 'Date', label: 'Date', type: 'date' },
        { key: 'Debit Account', label: 'Money goes to (debit)', type: 'text', required: true, placeholder: 'e.g. Cash and Bank' },
        { key: 'Credit Account', label: 'Money comes from (credit)', type: 'text', required: true, placeholder: 'e.g. Owner Capital' },
        { key: 'Amount', label: 'Amount', type: 'number', required: true, placeholder: '0' },
        { key: 'Narration', label: 'What was this?', type: 'text', placeholder: 'e.g. Opening balance' },
      ]}
    />
  )
}
