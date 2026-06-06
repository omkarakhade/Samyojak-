'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Copy, Check, Users, DollarSign, Gift, Share2 } from 'lucide-react'

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ referrals: 0, earned: 0, pending: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const referralCode = user?.email
    ? 'SAM-' + user.email.split('@')[0].toUpperCase().slice(0, 6)
    : 'SAM-XXXXXX'

  const referralLink = `https://samyojak.vercel.app/signup?ref=${referralCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Hey! I've been using Samyojak — an all-in-one ERP for businesses. CRM, invoicing, inventory, HR and more. Try it out: ${referralLink}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank')
  }

  const shareTwitter = () => {
    const msg = encodeURIComponent(`Just found an amazing all-in-one ERP for businesses — CRM, invoicing, inventory, HR all in one place 🚀 Try Samyojak: ${referralLink}`)
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, '_blank')
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Referral Program 🎁
          </h2>
          <p className="text-gray-500 mt-1">Share Samyojak and earn commission on every paying customer you refer</p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Share2, title: 'Share Your Link', desc: 'Share your unique referral link with anyone', color: '#8B5CF6', bg: '#EDE9FE', step: '1' },
            { icon: Users, title: 'They Sign Up', desc: 'Your referral signs up and subscribes to any plan', color: '#F472B6', bg: '#FCE7F3', step: '2' },
            { icon: DollarSign, title: 'You Earn 30%', desc: 'Get 30% commission on their first payment', color: '#34D399', bg: '#D1FAE5', step: '3' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl p-5 relative" style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: '#1E293B' }}>
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: item.bg, border: `2px solid ${item.color}` }}>
                <item.icon size={22} strokeWidth={2.5} style={{ color: item.color }} />
              </div>
              <h3 className="font-black mb-1" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{item.title}</h3>
              <p className="text-sm" style={{ color: '#64748B' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Commission Structure */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '2px solid #1E293B', boxShadow: '6px 6px 0px #FBBF24' }}>
          <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            💰 Commission Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { plan: 'Any Weekly Plan', commission: '30%', example: 'Earn $1.50-$6.60 per referral', color: '#8B5CF6' },
              { plan: 'Any Monthly Plan', commission: '30%', example: 'Earn $4.50-$23.70 per referral', color: '#F472B6' },
              { plan: 'Any Yearly Plan', commission: '30%', example: 'Earn $43-$227 per referral', color: '#34D399' },
            ].map(item => (
              <div key={item.plan} className="p-4 rounded-xl text-center" style={{ background: '#F8FAFC', border: `2px solid ${item.color}` }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>{item.plan}</p>
                <p className="text-4xl font-black mb-1" style={{ fontFamily: 'Outfit', color: item.color }}>{item.commission}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{item.example}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: '#94A3B8' }}>
            Commissions paid out monthly via bank transfer or UPI once you reach ₹500 minimum
          </p>
        </div>

        {/* Your Referral Link */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
          <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            🔗 Your Referral Link
          </h3>
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: '#F8FAFC', border: '2px solid #E2E8F0' }}>
            <code className="flex-1 text-sm truncate" style={{ color: '#8B5CF6', fontFamily: 'monospace' }}>
              {referralLink}
            </code>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: copied ? '#34D399' : '#8B5CF6', color: 'white', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold" style={{ color: '#64748B' }}>Your code:</span>
            <span className="px-3 py-1 rounded-full text-sm font-black" style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
              {referralCode}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#25D366', color: 'white', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}
            >
              📱 Share on WhatsApp
            </button>
            <button
              onClick={shareLinkedIn}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#0A66C2', color: 'white', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}
            >
              💼 Share on LinkedIn
            </button>
            <button
              onClick={shareTwitter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#1DA1F2', color: 'white', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}
            >
              🐦 Share on Twitter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Referrals', value: stats.referrals, icon: Users, color: '#8B5CF6' },
            { label: 'Total Earned', value: `$${stats.earned}`, icon: DollarSign, color: '#34D399' },
            { label: 'Pending Payout', value: `$${stats.pending}`, icon: Gift, color: '#FBBF24' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 text-center" style={{ border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #E2E8F0' }}>
              <s.icon size={24} className="mx-auto mb-2" style={{ color: s.color }} />
              <p className="text-2xl font-black mb-1" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div className="p-4 rounded-xl" style={{ background: '#FEF3C7', border: '2px solid #FBBF24' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#92400E', fontFamily: 'Outfit' }}>📋 Referral Terms</h4>
          <ul className="space-y-1">
            {[
              'You earn 30% commission on the first payment of each referred customer',
              'Referral must sign up using your link or enter your code at signup',
              'Minimum payout is ₹500 — paid monthly via UPI or bank transfer',
              'Self-referrals are not allowed',
              'Commission is tracked automatically when your code is used',
            ].map((term, i) => (
              <li key={i} className="text-xs flex items-start gap-2" style={{ color: '#92400E' }}>
                <span>•</span><span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  )
}
