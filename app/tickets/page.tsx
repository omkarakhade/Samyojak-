'use client'
import ModulePage from '@/components/ModulePage'

export default function SupportTickets() {
  return (
    <ModulePage
      title="Support Tickets"
      subtitle="Problems your customers report. Each priority has a deadline, and late tickets show up in the assistant"
      module="Support Tickets"
      accessKey="invoices"
      requiredPlan="ERP Basic"
      addLabel="Add Ticket"
      color="#FB923C"
      bg="#FFEDD5"
      shadow="#FB923C"
      fields={[
        { key: 'Ticket No', label: 'Ticket number', type: 'text', placeholder: 'T-001' },
        { key: 'Customer', label: 'Customer', type: 'text', required: true, placeholder: 'Who reported it?' },
        { key: 'Subject', label: 'Problem', type: 'text', required: true, placeholder: 'What went wrong?' },
        { key: 'Priority', label: 'Priority', type: 'select', options: ['Urgent', 'High', 'Medium', 'Low'] },
        { key: 'Status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed'] },
        { key: 'Opened', label: 'Opened on', type: 'date' },
        { key: 'Due Date', label: 'Reply by (optional)', type: 'date' },
        { key: 'Assigned To', label: 'Assigned to', type: 'text', placeholder: 'Optional' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
