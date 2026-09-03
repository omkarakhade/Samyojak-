'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'

interface TrialBannerProps {
  daysRemaining: number
  message: string
}

export default function TrialBanner({ daysRemaining, message }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 2

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl mb-6 flex-wrap"
      style={{ background: isUrgent ? '#FEE2E2' : '#EDE9FE', border: `2px solid ${isUrgent ? '#DC2626' : '#8B5CF6'}` }}
    >
      <div className="flex items-center gap-2">
        <Clock size={18} style={{ color: isUrgent ? '#DC2626' : '#8B5CF6' }} />
        <span className="text-sm font-bold" style={{ color: isUrgent ? '#DC2626' : '#5B21B6' }}>{message}</span>
      </div>
      <Link
        href="/pricing"
        className="px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap"
        style={{ background: isUrgent ? '#DC2626' : '#8B5CF6', color: 'white' }}
      >
        Upgrade Now
      </Link>
    </div>
  )
}
