import { Check } from 'lucide-react'

interface SeoUseCaseListProps {
  heading: string
  items: string[]
}

export default function SeoUseCaseList({ heading, items }: SeoUseCaseListProps) {
  return (
    <div>
      <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
        {heading}
      </h2>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
            <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#34D399' }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
