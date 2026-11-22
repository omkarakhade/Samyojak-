'use client'
import ModulePage from '@/components/ModulePage'

export default function LeaveRequests() {
  return (
    <ModulePage
      title="Leave Requests"
      subtitle="Time off people ask for. Approved unpaid leave is cut from pay"
      module="Leave Requests"
      accessKey="hr"
      requiredPlan="Business"
      addLabel="Add Leave"
      color="#FBBF24"
      bg="#FEF3C7"
      shadow="#FBBF24"
      fields={[
        { key: 'Employee', label: 'Employee', type: 'text', required: true, placeholder: 'Name' },
        { key: 'Leave Type', label: 'Type', type: 'select', options: ['Paid', 'Sick', 'Casual', 'Unpaid'] },
        { key: 'From', label: 'From', type: 'date', required: true },
        { key: 'To', label: 'To', type: 'date' },
        { key: 'Reason', label: 'Reason', type: 'text', placeholder: 'Optional' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
      ]}
    />
  )
}
