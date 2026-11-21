'use client'
import ModulePage from '@/components/ModulePage'

export default function Assets() {
  return (
    <ModulePage
      title="Assets"
      subtitle="Laptops, machines and vehicles you own: cost, who has them, when the warranty ends"
      module="Assets"
      accessKey="projects"
      requiredPlan="Business"
      addLabel="Add Asset"
      color="#34D399"
      bg="#D1FAE5"
      shadow="#34D399"
      fields={[
        { key: 'Asset Name', label: 'Asset', type: 'text', required: true, placeholder: 'e.g. Dell laptop' },
        { key: 'Category', label: 'Category', type: 'text', placeholder: 'Laptop, Machine, Vehicle...' },
        { key: 'Serial No', label: 'Serial number', type: 'text', placeholder: 'Optional' },
        { key: 'Purchase Date', label: 'Purchase date', type: 'date' },
        { key: 'Purchase Cost', label: 'Purchase cost', type: 'number', placeholder: '0' },
        { key: 'Assigned To', label: 'Who has it', type: 'text', placeholder: 'Name' },
        { key: 'Location', label: 'Location', type: 'text', placeholder: 'Office, home, shop floor...' },
        { key: 'Status', label: 'Status', type: 'select', options: ['In use', 'In stock', 'In repair', 'Retired', 'Sold'] },
        { key: 'Warranty Until', label: 'Warranty until', type: 'date' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Anything else' },
      ]}
    />
  )
}
