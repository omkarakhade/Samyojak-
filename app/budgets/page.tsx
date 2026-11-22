'use client'
import ModulePage from '@/components/ModulePage'

export default function Budgets() {
  return (
    <ModulePage
      title="Budgets"
      subtitle="How much you plan to spend each month on a category. Ask the assistant how you are doing against budget"
      module="Budgets"
      accessKey="expenses"
      requiredPlan="ERP Basic"
      addLabel="Add Budget"
      color="#FBBF24"
      bg="#FEF3C7"
      shadow="#FBBF24"
      fields={[
        { key: 'Category', label: 'Expense category', type: 'text', required: true, placeholder: 'Marketing' },
        { key: 'Monthly Budget', label: 'Monthly budget', type: 'number', required: true, placeholder: '20000' },
        { key: 'Month', label: 'Only for month (optional)', type: 'text', placeholder: '2026-12' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
