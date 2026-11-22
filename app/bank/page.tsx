'use client'
import ModulePage from '@/components/ModulePage'

export default function BankStatement() {
  return (
    <ModulePage
      title="Bank Statement"
      subtitle="Upload your bank statement, then ask the assistant to reconcile it against your books"
      module="Bank Statement"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Bank Line"
      color="#60A5FA"
      bg="#DBEAFE"
      shadow="#60A5FA"
      fields={[
        { key: 'Date', label: 'Date', type: 'date', required: true },
        { key: 'Description', label: 'Description', type: 'text', placeholder: 'What the bank printed' },
        { key: 'Amount', label: 'Amount (money out is negative)', type: 'number', required: true, placeholder: '-2500' },
        { key: 'Reference', label: 'Reference', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
