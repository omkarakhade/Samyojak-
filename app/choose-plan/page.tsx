'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Star } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'
import type { BillingPeriod } from '@/lib/products'

function detectIndia(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')
  } catch {
    return false
  }
}

export default function ChoosePlan() {
  const [billing, setBilling] = useState<BillingPeriod>('weekly')
  const [isIndia, setIsIndia] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    setIsIndia(detectIndia())
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

  const handleSelect = async (productIdIndia: string, productIdGlobal: string, planName: string) => {
    setLoadingPlan(planName)
    const productId = isIndia ? productIdIndia : productIdGlobal

    if (productId === 'pdt_REPLACE_WITH_DODO_ID') {
      alert('Payment coming soon! Contact hello@samyojak.app to get access.')
      setLoadingPlan('')
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email: userEmail,
          name: userName,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please contact hello@samyojak.app')
      }
    } catch (e) {
      console.error(e)
      alert('Something went wrong. Please contact hello@samyojak.app')
    }
    setLoadingPlan('')
  }

  const plans = PRODUCTS[billing]

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#FFFDF5' }}>
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>S</div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold" style={{ background: '#FEF3C7', border: '2px solid #FBBF24', color: '#92400E' }}>
            <Star size={14} fill="#FBBF24" /> Step 2 of 2 — Choose your plan
          </div>

          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Pick your plan. Get bonus time.
          </h1>
          <p className="text-lg mb-2" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
            Every plan includes a bonus period — pay once, get more.
          </p>

          {isIndia && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mt-2" style={{ background: '#D1FAE5', border: '2px solid #34D399', color: '#065F46' }}>
              🇮🇳 India pricing applied — special rates for Indian users
            </div>
          )}
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-full" style={{ background: '#F1F5F9', border: '2px solid #E2E8F0' }}>
            {(['weekly', 'monthly', 'yearly'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="px-6 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300"
                style={{
                  background: billing === b ? '#1E293B' : 'transparent',
                  color: billing === b ? 'white' : '#64748B',
                  fontFamily: 'Outfit',
                }}
              >
                {b}
                {b === 'yearly' && (
                  <span className="ml-1 text-xs" style={{ color: billing === b ? '#FBBF24' : '#FBBF24' }}>-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => {
            const displayPrice = isIndia ? plan.display_price_india : plan.display_price_global
            const isLoading = loadingPlan === plan.name

            return (
              <div
                key={plan.name}
                className="relative p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: plan.popular ? '#8B5CF6' : 'white',
                  border: '2px solid #1E293B',
                  boxShadow: plan.popular ? '8px 8px 0px #FBBF24' : '6px 6px 0px #E2E8F0',
                  transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black rotate-2 whitespace-nowrap"
                    style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B', fontFamily: 'Outfit' }}
                  >
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className="text-3xl mb-3">{plan.emoji}</div>

                <h3
                  className="font-black text-lg mb-1"
                  style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}
                >
                  {plan.name}
                </h3>

                <div className="mb-3">
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}
                  >
                    {displayPrice}
                  </span>
                  <span
                    className="text-sm ml-1"
                    style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}
                  >
                    /{plan.period}
                  </span>
                </div>

                <div
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{
                    background: plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5',
                    color: plan.popular ? 'white' : '#065F46',
                  }}
                >
                  🎁 {plan.bonus}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm"
                      style={{
                        color: plan.popular ? 'rgba(255,255,255,0.9)' : '#475569',
                        fontFamily: 'Plus Jakarta Sans',
                      }}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{
                          background: plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5',
                          color: plan.popular ? 'white' : '#065F46',
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan.product_id_india, plan.product_id_global, plan.name)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: plan.popular ? 'white' : '#1E293B',
                    color: plan.popular ? '#8B5CF6' : 'white',
                    border: '2px solid #1E293B',
                    fontFamily: 'Outfit',
                    boxShadow: '3px 3px 0px ' + (plan.popular ? 'rgba(0,0,0,0.15)' : '#8B5CF6'),
                  }}
                >
                  {isLoading ? 'Loading...' : (<>Select Plan <ArrowRight size={16} /></>)}
                </button>
              </div>
            )
          })}
        </div>

        <p
          className="text-center text-sm mt-8"
          style={{ color: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }}
        >
          🔒 Secure payment · Cancel anytime · Bonus time added automatically
          {isIndia && ' · Special India pricing applied'}
        </p>
      </div>
    </div>
  )
}
