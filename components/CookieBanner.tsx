'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('samyojak-cookies-accepted')) {
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('samyojak-cookies-accepted', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-[#0A1628] border border-white/20 rounded-2xl p-4 shadow-2xl">
      <p className="text-white/80 text-sm mb-3">
        We use cookies to improve your experience. See our{' '}
        <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          Accept
        </button>
        <button
          onClick={() => setShow(false)}
          className="flex-1 border border-white/20 text-white/60 px-4 py-2 rounded-xl text-sm hover:bg-white/10"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
