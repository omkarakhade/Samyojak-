'use client'
import ModulePage from '@/components/ModulePage'

export default function SalesOrders() {
  return (
    <ModulePage
      title="Sales Orders"
      subtitle="Orders customers have confirmed, before you invoice them. Tell the assistant when it is delivered and it makes the invoice"
      module="Sales Orders"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Sales Order"
      color="#60A5FA"
      bg="#DBEAFE"
      shadow="#60A5FA"
      fields={[
        { key: 'Order No', label: 'Order number', type: 'text', placeholder: 'SO-001' },
        { key: 'Client Name', label: 'Client', type: 'text', required: true, placeholder: 'Who ordered?' },
        { key: 'Line Items', label: 'What they ordered', type: 'text', placeholder: 'Laptop x2 @50000; Mouse x5 @500' },
        { key: 'Amount', label: 'Amount (before tax)', type: 'number', placeholder: '0' },
        { key: 'Order Date', label: 'Order date', type: 'date' },
        { key: 'Delivery Date', label: 'Delivery date', type: 'date' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Open', 'Confirmed', 'Delivered', 'Cancelled'] },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
