'use client'
import ModulePage from '@/components/ModulePage'

export default function Returns() {
  return (
    <ModulePage
      title="Returns & Refunds"
      subtitle="Items customers send back: why, what you decide, and what you refund"
      module="Returns"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Return"
      color="#F472B6"
      bg="#FCE7F3"
      shadow="#F472B6"
      fields={[
        { key: 'Return No', label: 'Return number', type: 'text', placeholder: 'RET-001' },
        { key: 'Customer', label: 'Customer', type: 'text', required: true, placeholder: 'Who is returning it?' },
        { key: 'Item', label: 'Item', type: 'text', required: true, placeholder: 'What is being returned?' },
        { key: 'Quantity', label: 'Quantity', type: 'number', placeholder: '1' },
        { key: 'Refund Amount', label: 'Refund amount', type: 'number', placeholder: '0' },
        { key: 'Reason', label: 'Reason', type: 'select', options: ['Damaged', 'Defective', 'Wrong item', 'Not as described', 'Late delivery', 'Changed mind', 'Other'] },
        { key: 'Condition', label: 'Condition received', type: 'select', options: ['New', 'Opened', 'Used', 'Damaged'] },
        { key: 'Decision', label: 'Decision', type: 'select', options: ['Restock', 'Refurbish', 'Discard', 'Return to vendor'] },
        { key: 'Status', label: 'Status', type: 'select', options: ['Requested', 'Approved', 'Received', 'Refunded', 'Rejected'] },
        { key: 'Return Date', label: 'Return date', type: 'date' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
