'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  useEffect(() => {
    const shoot = async () => {
      const { default: confetti } = await import('canvas-confetti')
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
      setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } }), 300)
      setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } }), 600)
    }
    shoot()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF5' }}>
      <div className="text-center max-w-md w-full">
        <div className="text-7xl mb-6 float">🎉</div>
        <div className="p-8 rounded-2xl mb-6" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}>
          <h1 className="text-3xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Payment Successful!
          </h1>
          <p className="mb-2" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
            Welcome to Samyojak! Your account is now active.
          </p>
          <p className="text-sm font-semibold" style={{ color: '#34D399' }}>
            ✅ Your bonus period has been added automatically
          </p>
        </div>
        <Link href="/dashboard" className="candy-btn px-8 py-4 text-lg flex items-center justify-center gap-3 w-full">
          Go to Dashboard <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}
