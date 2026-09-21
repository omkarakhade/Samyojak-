import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SeoCtaSectionProps {
  heading: string
  subheading: string
}

export default function SeoCtaSection({ heading, subheading }: SeoCtaSectionProps) {
  return (
    <section className="px-6 py-20 text-center" style={{ background: '#1E293B' }}>
      <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
        {heading}
      </h2>
      <p className="text-lg mb-8" style={{ color: '#94A3B8' }}>
        {subheading}
      </p>
      <Link href="/signup"
        className="px-10 py-5 text-xl rounded-full font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
        style={{ background: '#8B5CF6', border: '2px solid white', boxShadow: '4px 4px 0px rgba(255,255,255,0.3)' }}>
        Start Trial <ArrowRight size={20} />
      </Link>
    </section>
  )
}
