import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function SeoBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: '#94A3B8' }}>
      <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={12} />
          {item.href ? (
            <Link href={item.href} className="hover:text-violet-600 transition-colors">{item.label}</Link>
          ) : (
            <span style={{ color: '#1E293B' }} className="font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
