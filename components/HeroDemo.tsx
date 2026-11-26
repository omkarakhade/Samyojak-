'use client'

import { useEffect, useRef, useState } from 'react'
import { Brain, MessageSquare, LayoutDashboard, FileText, Package } from 'lucide-react'

// A looping product preview for the homepage: the chat opens, then a cursor moves to Dashboard and clicks it.
// All figures are an example, not real data. With "reduce motion" on, it shows the chat view only.

type View = 'chat' | 'dash'

const MENU = [
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'dash', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'inv', label: 'Invoices', icon: FileText },
  { key: 'stock', label: 'Inventory', icon: Package },
] as const

const ITEM_H = 40
const MENU_TOP = 14
const SIDEBAR_W = 92
const itemCenterY = (i: number) => MENU_TOP + i * ITEM_H + 18

export default function HeroDemo() {
  const [view, setView] = useState<View>('chat')
  const [step, setStep] = useState(0) // how much of the chat is shown (0-4)
  const [cursor, setCursor] = useState({ x: 250, y: 300, show: false, click: false })
  const [still, setStill] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    let reduce = false
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { /* ignore */ }
    if (reduce) {
      setStill(true)
      setStep(4)
      return
    }

    const at = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)) }

    const cycle = () => {
      setView('chat')
      setStep(0)
      setCursor({ x: 250, y: 300, show: false, click: false })
      at(400, () => setStep(1))
      at(1500, () => setStep(2))
      at(2700, () => setStep(3))
      at(3900, () => setStep(4))
      // the cursor appears and travels to Dashboard
      at(5200, () => setCursor({ x: 250, y: 300, show: true, click: false }))
      at(5500, () => setCursor({ x: SIDEBAR_W / 2 + 10, y: itemCenterY(1) + 6, show: true, click: false }))
      at(6700, () => setCursor(c => ({ ...c, click: true })))
      at(6900, () => { setView('dash'); setCursor(c => ({ ...c, click: false })) })
      at(7600, () => setCursor(c => ({ ...c, show: false })))
      // and back to the chat
      at(11800, () => setCursor({ x: 250, y: 280, show: true, click: false }))
      at(12000, () => setCursor({ x: SIDEBAR_W / 2 + 10, y: itemCenterY(0) + 6, show: true, click: false }))
      at(13000, () => setCursor(c => ({ ...c, click: true })))
      at(13200, () => { setView('chat'); setStep(4); setCursor(c => ({ ...c, click: false })) })
      at(13800, () => setCursor(c => ({ ...c, show: false })))
      at(15200, cycle)
    }
    cycle()
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [])

  const activeKey = view === 'chat' ? 'chat' : 'dash'

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        border: '2px solid #E2E8F0',
        boxShadow: '0 32px 80px rgba(139,92,246,0.12), 0 8px 24px rgba(0,0,0,0.08), 8px 8px 0px #8B5CF620',
      }}
      aria-label="Example of the Samyojak chat and dashboard">

      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 mx-4 px-4 py-1.5 rounded-full text-xs text-center"
          style={{ background: 'white', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
          www.samyojak-erp.com/{view === 'chat' ? 'ai' : 'dashboard'}
        </div>
      </div>

      <div className="relative flex" style={{ height: 400, background: '#FAFBFF' }}>
        {/* menu */}
        <div style={{ width: SIDEBAR_W, background: '#F1F5F9', borderRight: '1.5px solid #E2E8F0', paddingTop: MENU_TOP }}>
          {MENU.map(m => {
            const Icon = m.icon
            const active = m.key === activeKey
            return (
              <div key={m.key} className="flex items-center gap-2 mx-2 px-2 rounded-lg text-xs font-semibold transition-colors duration-300"
                style={{
                  height: ITEM_H - 6,
                  marginBottom: 6,
                  background: active ? '#8B5CF6' : 'transparent',
                  color: active ? 'white' : '#64748B',
                }}>
                <Icon size={14} />
                {m.label}
              </div>
            )
          })}
        </div>

        {/* content */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 p-4 space-y-3 transition-opacity duration-500"
            style={{ opacity: view === 'chat' ? 1 : 0, pointerEvents: 'none' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Example conversation</p>

            <div className="flex justify-end transition-all duration-500" style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'none' : 'translateY(8px)' }}>
              <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: '#8B5CF6', color: 'white' }}>Who has not paid me?</div>
            </div>

            <div className="p-3 rounded-xl transition-all duration-500" style={{ background: 'white', border: '1.5px solid #E2E8F0', opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'none' : 'translateY(8px)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: '#8B5CF6' }}>Unpaid invoices</p>
              {[
                { c: 'Sharma Traders', a: '45,000', d: 'Due 12 Nov' },
                { c: 'Brightline Studio', a: '18,500', d: 'Due 20 Nov' },
              ].map(r => (
                <div key={r.c} className="grid grid-cols-3 text-xs mb-1" style={{ color: '#1E293B' }}>
                  <span className="font-semibold truncate">{r.c}</span>
                  <span>{r.a}</span>
                  <span style={{ color: '#64748B' }}>{r.d}</span>
                </div>
              ))}
              <p className="text-xs mt-1 font-bold" style={{ color: '#1E293B' }}>2 unpaid · 63,500</p>
            </div>

            <div className="flex justify-end transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'none' : 'translateY(8px)' }}>
              <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: '#8B5CF6', color: 'white' }}>Paid rent 20k today</div>
            </div>

            <div className="p-3 rounded-xl transition-all duration-500" style={{ background: '#0F172A', border: '1.5px solid rgba(139,92,246,0.4)', opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? 'none' : 'translateY(8px)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#8B5CF6' }}>
                  <Brain size={11} className="text-white" />
                </div>
                <span className="text-xs font-bold" style={{ color: '#C4B5FD' }}>Samyojak</span>
              </div>
              <p className="text-xs mb-2" style={{ color: '#C4B5FD' }}>
                I am ready to add 1 record to Expenses: Rent, 20,000, Paid. Please review and confirm.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#34D399', color: '#064E3B' }}>Confirm</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #334155' }}>Cancel</span>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 p-4 transition-opacity duration-500"
            style={{ opacity: view === 'dash' ? 1 : 0, pointerEvents: 'none' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>Example dashboard</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { l: 'Billed', v: '1,24,000', c: '#8B5CF6' },
                { l: 'Unpaid', v: '63,500', c: '#F472B6' },
                { l: 'Low stock', v: '3 items', c: '#FBBF24' },
              ].map(k => (
                <div key={k.l} className="p-2.5 rounded-xl" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
                  <p className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>{k.l}</p>
                  <p className="text-sm font-black" style={{ color: k.c, fontFamily: 'Outfit' }}>{k.v}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: '#8B5CF6' }}>Revenue by month</p>
              <div className="flex items-end gap-2" style={{ height: 110 }}>
                {[38, 52, 44, 68, 60, 86].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md"
                    style={{
                      height: view === 'dash' ? `${h}%` : '4%',
                      background: i === 5 ? '#8B5CF6' : '#DDD6FE',
                      transition: `height 700ms ease ${i * 90}ms`,
                    }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] mt-1" style={{ color: '#94A3B8' }}>
                {['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>
            <p className="text-xs mt-3 font-semibold" style={{ color: '#64748B' }}>Same records, shown as a picture.</p>
          </div>
        </div>

        {/* cursor */}
        {!still && (
          <div className="absolute pointer-events-none"
            style={{
              left: cursor.x,
              top: cursor.y,
              opacity: cursor.show ? 1 : 0,
              transition: 'left 1000ms cubic-bezier(.4,0,.2,1), top 1000ms cubic-bezier(.4,0,.2,1), opacity 300ms',
              zIndex: 5,
            }}>
            <div style={{
              width: 22, height: 22,
              transform: cursor.click ? 'scale(0.82)' : 'scale(1)',
              transition: 'transform 150ms',
            }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#1E293B" stroke="white" strokeWidth="1.5">
                <path d="M4 3l7 17 2.5-7L21 10.5z" />
              </svg>
            </div>
            {cursor.click && (
              <span className="absolute rounded-full"
                style={{ left: -8, top: -8, width: 32, height: 32, border: '2px solid #8B5CF6', opacity: 0.6 }} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
