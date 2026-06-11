'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, CreditCard, User, Mail, ArrowRight } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planName = searchParams.get('plan') || 'CRM Starter'
  const productId = searchParams.get('product') || ''
  const price = searchParams.get('price') || '$4.99'
  const period = searchParams.get('period') || 'wk'
  const bonus = searchParams.get('bonus') || '+1 week free'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        setUserName(user.user_metadata?.full_name || '')
      }
    }
    getUser()
  }, [])

  const handlePay = async () => {
    if (!productId) {
      setError('Invalid product. Please go back and select a plan.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email: userEmail,
          name: userName,
          planName,
        }),
      })

      const data = await res.json()

      if (data.url) {
        // Redirect to Dodo hosted payment page
        window.location.href = data.url
      } else {
        setError(data.error || 'Payment failed. Please try again.')
      }
    } catch (e: any) {
      setError('Network error: ' + e.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#FFFDF5' }}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              S
            </div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Samyojak
            </span>
          </Link>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Complete your order
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            You will be redirected to our secure payment page
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-6 rounded-2xl mb-6"
          style={{ background: '#EDE9FE', border: '2px solid #8B5CF6' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3"
            style={{ color: '#8B5CF6', fontFamily: 'Outfit' }}>
            Order Summary
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-xl"
                style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                Samyojak {planName}
              </p>
              <p className="text-sm mt-1" style={{ color: '#6D28D9' }}>
                🎁 {bonus} included
              </p>
            </div>
            <div className="text-right">
              <p className="font-black text-3xl"
                style={{ fontFamily: 'Outfit', color: '#8B5CF6' }}>
                {price}
              </p>
              <p className="text-xs" style={{ color: '#7C3AED' }}>per {period}</p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6 rounded-2xl mb-6"
          style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #E2E8F0' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4"
            style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
            Account Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
              <User size={18} style={{ color: '#8B5CF6' }} />
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                  {userName || 'Your Name'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
              <Mail size={18} style={{ color: '#8B5CF6' }} />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                  {userEmail || 'your@email.com'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: '#94A3B8' }}>
            Receipt will be sent to this email after payment
          </p>
        </div>

        {/* What Happens Next */}
        <div className="p-4 rounded-xl mb-6"
          style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#065F46', fontFamily: 'Outfit' }}>
            What happens next:
          </p>
          <div className="space-y-1">
            {[
              '1. Click Pay Now — you go to secure Dodo Payments page',
              '2. Enter your card or UPI details on the secure page',
              '3. Payment is processed securely',
              '4. You are redirected back to your Samyojak dashboard',
              '5. Your bonus period is activated automatically',
            ].map(step => (
              <p key={step} className="text-xs" style={{ color: '#047857', fontFamily: 'Plus Jakarta Sans' }}>
                {step}
              </p>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl mb-4"
            style={{ background: '#FEE2E2', border: '2px solid #FCA5A5' }}>
            <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
            <p className="text-xs text-red-500 mt-1">
              If this keeps happening contact samyojak@gmail.com
            </p>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="candy-btn w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Redirecting to payment...
            </>
          ) : (
            <>
              <Lock size={22} />
              Pay {price}/{period} — Secure Checkout
              <ArrowRight size={22} />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <Lock size={12} style={{ color: '#94A3B8' }} />
            <span className="text-xs" style={{ color: '#94A3B8' }}>SSL Encrypted</span>
          </div>
          <span style={{ color: '#E2E8F0' }}>·</span>
          <span className="text-xs" style={{ color: '#94A3B8' }}>Powered by Dodo Payments</span>
          <span style={{ color: '#E2E8F0' }}>·</span>
          <span className="text-xs" style={{ color: '#94A3B8' }}>Cancel anytime</span>
        </div>

        <p className="text-center mt-4">
          <Link href="/choose-plan" className="text-sm hover:underline"
            style={{ color: '#8B5CF6', fontFamily: 'Plus Jakarta Sans' }}>
            ← Change plan
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF5' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
