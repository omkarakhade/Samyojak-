'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Star } from 'lucide-react'

const plans = {
  weekly: [
    { name: 'CRM Starter', price: '$4.99', bonus: '+1 week free', period: 'wk', features: ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'], emoji: '🌱', color: '#8B5CF6', popular: false },
    { name: 'ERP Basic', price: '$9.99', bonus: '+1 week free', period: 'wk', features: ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'], emoji: '⚡', color: '#F472B6', popular: false },
    { name: 'Business', price: '$16.99', bonus: '+1 week free', period: 'wk', features: ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'], emoji: '🚀', color: '#FBBF24', popular: true },
    { name: 'Complete', price: '$21.99', bonus: '+1 week free', period: 'wk', features: ['Everything', 'AI features', 'Unlimited users', 'API access'], emoji: '💎', color: '#34D399', popular: false },
  ],
  monthly: [
    { name: 'CRM Starter', price: '$15', bonus: '+1 month free', period: 'mo', features: ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'], emoji: '🌱', color: '#8B5CF6', popular: false },
    { name: 'ERP Basic', price: '$35', bonus: '+1 month free', period: 'mo', features: ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'], emoji: '⚡', color: '#F472B6', popular: false },
    { name: 'Business', price: '$60', bonus: '+1 month free', period: 'mo', features: ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'], emoji: '🚀', color: '#FBBF24', popular: true },
    { name: 'Complete', price: '$79', bonus: '+1 month free', period: 'mo', features: ['Everything', 'AI features', 'Unlimited users', 'API access'], emoji: '💎', color: '#34D399', popular: false },
  ],
  yearly: [
    { name: 'CRM Starter', price: '$144', bonus: '+2 months free', period: 'yr', features: ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'], emoji: '🌱', color: '#8B5CF6', popular: false },
    { name: 'ERP Basic', price: '$336', bonus: '+2 months free', period: 'yr', features: ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'], emoji: '⚡', color: '#F472B6', popular: false },
    { name: 'Business', price: '$576', bonus: '+3 months free', period: 'yr', features: ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'], emoji: '🚀', color: '#FBBF24', popular: true },
    { name: 'Complete', price: '$759', bonus: '+3 months free', period: 'yr', features: ['Everything', 'AI features', 'Unlimited users', 'API access'], emoji: '💎', color: '#34D399', popular: false },
  ],
}

export default function ChoosePlan() {
  const [billing, setBilling] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  const router = useRouter()

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
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Pick your plan. Get bonus time.</h1>
          <p className="text-lg" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>Every plan includes a bonus period — pay once, get more.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-full" style={{ background: '#F1F5F9', border: '2px solid #E2E8F0' }}>
            {(['weekly', 'monthly', 'yearly'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="px-6 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300"
                style={{ background: billing === b ? '#1E293B' : 'transparent', color: billing === b ? 'white' : '#64748B', fontFamily: 'Outfit' }}
              >
                {b}
                {b === 'yearly' && <span className="ml-1 text-xs" style={{ color: '#FBBF24' }}>-20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans[billing].map(plan => (
            <div
              key={plan.name}
              className="relative p-6 rounded-2xl"
              style={{
                background: plan.popular ? '#8B5CF6' : 'white',
                border: '2px solid #1E293B',
                boxShadow: plan.popular ? '8px 8px 0px #FBBF24' : '6px 6px 0px #E2E8F0',
                transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black rotate-2 whitespace-nowrap" style={{ background: '#FBBF24', border: '2px solid #1E293B', color: '#1E293B', fontFamily: 'Outfit' }}>
                  ⭐ MOST POPULAR
                </div>
              )}
              <div className="text-3xl mb-3">{plan.emoji}</div>
              <h3 className="font-black text-lg mb-1" style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>{plan.name}</h3>
              <div className="mb-3">
                <span className="text-4xl font-black" style={{ fontFamily: 'Outfit', color: plan.popular ? 'white' : '#1E293B' }}>{plan.price}</span>
                <span className="text-sm ml-1" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>/{plan.period}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5', color: plan.popular ? 'white' : '#065F46' }}>
                🎁 {plan.bonus}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.9)' : '#475569', fontFamily: 'Plus Jakarta Sans' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: plan.popular ? 'rgba(255,255,255,0.2)' : '#D1FAE5', color: plan.popular ? 'white' : '#065F46' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: plan.popular ? 'white' : '#1E293B', color: plan.popular ? '#8B5CF6' : 'white', border: '2px solid #1E293B', fontFamily: 'Outfit', boxShadow: '3px 3px 0px ' + (plan.popular ? 'rgba(0,0,0,0.15)' : '#8B5CF6') }}
              >
                Select Plan <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }}>
          🔒 Secure payment · Cancel anytime · Bonus time added automatically
        </p>
      </div>
    </div>
  )
}
