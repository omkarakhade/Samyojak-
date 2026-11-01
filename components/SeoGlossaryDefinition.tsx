import Link from 'next/link'

interface RelatedTerm {
  label: string
  href: string
}

interface SeoGlossaryDefinitionProps {
  term: string
  shortDefinition: string
  paragraphs: string[]
  related: RelatedTerm[]
}

export default function SeoGlossaryDefinition({ term, shortDefinition, paragraphs, related }: SeoGlossaryDefinitionProps) {
  return (
    <>
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            {term}
          </h1>
          <p className="text-lg font-semibold mb-8" style={{ color: '#8B5CF6' }}>
            {shortDefinition}
          </p>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg mb-6" style={{ color: '#64748B' }}>{p}</p>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
          <div className="max-w-3xl mx-auto py-12">
            <h2 className="text-xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Related terms
            </h2>
            <div className="flex flex-wrap gap-3">
              {related.map(r => (
                <Link key={r.href} href={r.href}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
                  style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
