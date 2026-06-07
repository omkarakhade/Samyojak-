'use client'
import Link from 'next/link'
import { Lock } from 'lucide-react'

interface Props {
  moduleName: string
  requiredPlan: string
}

export default function LockedModule({ moduleName, requiredPlan }: Props) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center max-w-md p-8 rounded-2xl" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #F472B6' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#EDE9FE', border: '2px solid #8B5CF6' }}>
          <Lock size={32} style={{ color: '#8B5CF6' }} />
        </div>
        <h2 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
          {moduleName} is Locked
        </h2>
        <p className="text-gray-500 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Upgrade to the <strong>{requiredPlan}</strong> plan or higher to unlock {moduleName}.
        </p>
        <Link
          href="/choose-plan"
          className="candy-btn px-6 py-3 inline-flex items-center gap-2"
        >
          Upgrade Plan →
        </Link>
      </div>
    </div>
  )
}
