'use client'
import ModulePage from '@/components/ModulePage'

export default function BillsOfMaterials() {
  return (
    <ModulePage
      title="Bills of Materials"
      subtitle="What goes into ONE unit of each product. Finishing a production job uses these parts up in Inventory"
      module="Bills of Materials"
      accessKey="projects"
      requiredPlan="Business"
      addLabel="Add Bill of Materials"
      color="#F472B6"
      bg="#FCE7F3"
      shadow="#F472B6"
      fields={[
        { key: 'Product', label: 'Product', type: 'text', required: true, placeholder: 'e.g. Steel bracket' },
        { key: 'Components', label: 'Parts for ONE unit', type: 'text', required: true, placeholder: 'Steel sheet x2; Bolt x8' },
        { key: 'Labour Cost', label: 'Labour cost per unit', type: 'number', placeholder: '0' },
        { key: 'Notes', label: 'Notes', type: 'text', placeholder: 'Anything else' },
      ]}
    />
  )
}
