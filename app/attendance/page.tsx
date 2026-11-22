'use client'
import ModulePage from '@/components/ModulePage'

export default function Attendance() {
  return (
    <ModulePage
      title="Attendance"
      subtitle="Who was present, absent or half day. Absent days are cut from pay when you run payroll"
      module="Attendance"
      accessKey="hr"
      requiredPlan="Business"
      addLabel="Mark Attendance"
      color="#34D399"
      bg="#D1FAE5"
      shadow="#34D399"
      fields={[
        { key: 'Date', label: 'Date', type: 'date', required: true },
        { key: 'Employee', label: 'Employee', type: 'text', required: true, placeholder: 'Name' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Present', 'Absent', 'Half day', 'Leave'] },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Optional' },
      ]}
    />
  )
}
