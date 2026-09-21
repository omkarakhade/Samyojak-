'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface FaqItem {
  q: string
  a: string
}

export default function SeoFaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-2xl overflow-hidden"
          style={{ border: '2px solid #E2E8F0', background: 'white' }}>
          <button className="w-full flex items-center justify-between p-5 text-left"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <span className="font-bold text-sm pr-4" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
              {faq.q}
            </span>
            {openFaq === i
              ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
              : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
          </button>
          {openFaq === i && (
            <div className="px-5 pb-5 border-t border-gray-100">
              <p className="pt-4 text-sm" style={{ color: '#64748B' }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
