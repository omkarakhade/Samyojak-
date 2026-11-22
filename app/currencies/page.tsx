'use client'
import ModulePage from '@/components/ModulePage'

export default function CurrencyRates() {
  return (
    <ModulePage
      title="Currency Rates"
      subtitle="How many rupees one unit of a foreign currency is worth. Invoices and expenses in that currency are converted in your books"
      module="Currency Rates"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Rate"
      color="#34D399"
      bg="#D1FAE5"
      shadow="#34D399"
      fields={[
        { key: 'Currency', label: 'Currency', type: 'text', required: true, placeholder: 'USD' },
        { key: 'Rate', label: 'Rupees per 1 unit', type: 'number', required: true, placeholder: '84' },
        { key: 'Date', label: 'Date', type: 'date' },
      ]}
    />
  )
}
