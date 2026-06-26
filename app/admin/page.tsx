'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Copy, RefreshCw, Check, Link, Shield, Users, Eye } from 'lucide-react'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

const PRESET_TOKENS = [
  'samyojak2025',
  'demo-investor',
  'demo-client',
  'demo-press',
  'demo-trial',
  'product-hunt',
  'linkedin-demo',
  'reddit-demo',
]

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [demoToken, setDemoToken] = useState('samyojak2025')
  const [customToken, setCustomToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([])
  const [note, setNote] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }
      setUser(user)
      setLoading(false)

      // Load previously generated links from localStorage
      const saved = localStorage.getItem('samyojak_demo_links')
      if (saved) setGeneratedLinks(JSON.parse(saved))
    })
  }, [router])

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin
    return 'https://samyojak.vercel.app'
  }

  const generateLink = (token: string) => {
    const base = getBaseUrl()
    return `${base}/demo?token=${token}`
  }

  const copyLink = (token: string) => {
    const link = generateLink(token)
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      // Save to history
      const entry = `${link}${note ? ` (${note})` : ''} — ${new Date().toLocaleDateString()}`
      const updated = [entry, ...generatedLinks.slice(0, 9)]
      setGeneratedLinks(updated)
      localStorage.setItem('samyojak_demo_links', JSON.stringify(updated))
    })
  }

  const generateRandom = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const token = 'demo-' + Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
    setCustomToken(token)
    setDemoToken(token)
  }

  const whatsappShare = (token: string) => {
    const link = generateLink(token)
    const msg = encodeURIComponent(
      `Hi! Here is a demo link to try Samyojak ERP — the ERP that adapts to you.\n\n` +
      `🔗 ${link}\n\n` +
      `You can explore CRM, Invoices, Inventory, HR, Projects, BI Dashboard, and AI. No login needed.`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const linkedinShare = (token: string) => {
    const link = generateLink(token)
    const msg = encodeURIComponent(link)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${msg}`, '_blank')
  }

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#FEE2E2', border: '2px solid #EF4444' }}>
            <Shield size={20} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Admin Panel
            </h2>
            <p className="text-gray-500 text-sm">Only visible to omkarakhade083@gmail.com</p>
          </div>
        </div>

        {/* DEMO LINK GENERATOR — MAIN FEATURE */}
        <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6"
          style={{ border: '2px solid #8B5CF6', boxShadow: '6px 6px 0px #8B5CF6' }}>
          <div className="flex items-center gap-2 mb-5">
            <Link size={20} style={{ color: '#8B5CF6' }} />
            <h3 className="font-black text-lg dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Demo Link Generator
            </h3>
          </div>

          {/* Quick tokens */}
          <p className="text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300"
            style={{ fontFamily: 'Outfit' }}>
            Quick Select Token
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_TOKENS.map(token => (
              <button key={token}
                onClick={() => setDemoToken(token)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                style={{
                  background: demoToken === token ? '#8B5CF6' : '#EDE9FE',
                  color: demoToken === token ? 'white' : '#8B5CF6',
                  border: `2px solid ${demoToken === token ? '#8B5CF6' : '#C4B5FD'}`,
                }}>
                {token}
              </button>
            ))}
          </div>

          {/* Custom token */}
          <p className="text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300"
            style={{ fontFamily: 'Outfit' }}>
            Or Type Custom Token
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customToken}
              onChange={e => { setCustomToken(e.target.value); setDemoToken(e.target.value) }}
              placeholder="e.g. client-john-doe"
              className="flex-1 border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
            />
            <button onClick={generateRandom}
              className="px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity flex items-center gap-2"
              style={{ background: '#F1F5F9', color: '#64748B' }}>
              <RefreshCw size={14} /> Random
            </button>
          </div>

          {/* Note */}
          <p className="text-xs font-bold uppercase tracking-wide mb-2 dark:text-gray-300"
            style={{ fontFamily: 'Outfit' }}>
            Note (optional — for your records)
          </p>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Sent to Rahul Sharma on LinkedIn"
            className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
          />

          {/* Generated link preview */}
          <div className="p-3 rounded-xl mb-4 flex items-center gap-2"
            style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
            <Eye size={14} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500 flex-1 truncate font-mono">
              {generateLink(demoToken || 'samyojak2025')}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => copyLink(demoToken || 'samyojak2025')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-all"
              style={{ background: copied ? '#34D399' : '#8B5CF6' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => whatsappShare(demoToken || 'samyojak2025')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: '#25D366' }}>
              📱 WhatsApp
            </button>
            <button
              onClick={() => linkedinShare(demoToken || 'samyojak2025')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: '#0A66C2' }}>
              💼 LinkedIn
            </button>
            <a
              href={generateLink(demoToken || 'samyojak2025')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
              style={{ background: '#F1F5F9', color: '#64748B' }}>
              <Eye size={15} /> Preview
            </a>
          </div>
        </div>

        {/* Link history */}
        {generatedLinks.length > 0 && (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
            style={{ border: '2px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Recently Generated Links
              </h3>
              <button
                onClick={() => {
                  setGeneratedLinks([])
                  localStorage.removeItem('samyojak_demo_links')
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {generatedLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <p className="text-xs text-gray-500 flex-1 truncate font-mono">{link}</p>
                  <button
                    onClick={() => {
                      const url = link.split(' ')[0]
                      navigator.clipboard.writeText(url)
                    }}
                    className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0">
                    <Copy size={12} className="text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How demo works */}
        <div className="p-4 rounded-2xl" style={{ background: '#EDE9FE', border: '1.5px solid #8B5CF6' }}>
          <h4 className="font-black text-sm mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            How the demo link works
          </h4>
          <div className="space-y-1.5">
            {[
              'Person opens the link — no login required',
              'They see the full ERP dashboard with demo data',
              'They can explore CRM, Invoices, Inventory, HR, Projects, BI, AI',
              'They cannot delete or corrupt real user data',
              'You change the token here to revoke access instantly',
              'Each token = one shareable link = one audience segment',
            ].map(s => (
              <p key={s} className="text-xs flex items-start gap-1.5" style={{ color: '#64748B' }}>
                <span style={{ color: '#8B5CF6' }}>→</span> {s}
              </p>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
