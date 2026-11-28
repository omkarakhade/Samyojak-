'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, Printer, MessageCircle } from 'lucide-react'
import { GENERATOR_CONFIG, computeInvoice, money, type InvoiceLine } from '@/lib/freeInvoice'

const heading = { fontFamily: 'Outfit', color: '#1E293B' } as const
const input = 'w-full px-3 py-2 rounded-xl text-sm outline-none border-2 border-slate-200 focus:border-violet-400 bg-white'
const SITE = 'https://www.samyojak-erp.com/?utm_source=free-invoice&utm_medium=generator'

/** Free invoice maker for one country. Works in the browser, nothing is saved or sent anywhere. */
export default function FreeInvoiceGenerator({ slug, country }: { slug: string; country: string }) {
  const cfg = GENERATOR_CONFIG[slug]
  const [seller, setSeller] = useState('')
  const [client, setClient] = useState('')
  const [number, setNumber] = useState('INV-001')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rate, setRate] = useState(String(cfg?.rate ?? 0))
  const [lines, setLines] = useState<{ desc: string; qty: string; price: string }[]>([{ desc: '', qty: '1', price: '' }])

  if (!cfg) return null

  const parsed: InvoiceLine[] = lines.map(l => ({ desc: l.desc, qty: parseFloat(l.qty), price: parseFloat(l.price) }))
  const t = computeInvoice(parsed, parseFloat(rate))
  const used = parsed.filter(l => l.desc.trim() && l.qty > 0 && l.price >= 0)

  const setLine = (i: number, k: 'desc' | 'qty' | 'price', v: string) =>
    setLines(prev => prev.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)))

  const waText = [
    'Invoice ' + number + (seller ? ' from ' + seller : ''),
    ...used.map(l => `${l.desc} x${l.qty} @ ${money(cfg.currency, l.price)}`),
    `${cfg.taxLabel} (${t.rate}%): ${money(cfg.currency, t.tax)}`,
    'Total: ' + money(cfg.currency, t.total),
    '',
    'Made with Samyojak, the ERP/CRM that adapts to you: ' + SITE,
  ].join('\n')

  return (
    <section className="px-6 pb-16">
      <style>{`@media print { body * { visibility: hidden } #free-invoice, #free-invoice * { visibility: visible } #free-invoice { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important } }`}</style>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-black mb-2" style={heading}>Free {cfg.taxLabel} invoice maker for {country}</h2>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          Fill it in, then print or save as PDF, or send it on WhatsApp. No signup, and nothing is stored.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="no-print space-y-3 p-5 rounded-2xl" style={{ background: 'white', border: '2px solid #E2E8F0' }}>
            <input className={input} placeholder="Your business name" value={seller} onChange={e => setSeller(e.target.value)} aria-label="Your business name" />
            <input className={input} placeholder="Customer name" value={client} onChange={e => setClient(e.target.value)} aria-label="Customer name" />
            <div className="grid grid-cols-2 gap-3">
              <input className={input} placeholder="Invoice number" value={number} onChange={e => setNumber(e.target.value)} aria-label="Invoice number" />
              <input className={input} type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Date" />
            </div>
            <p className="text-xs font-bold pt-1" style={{ color: '#475569' }}>Items</p>
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-6 gap-2">
                <input className={input + ' col-span-3'} placeholder="Item" value={l.desc} onChange={e => setLine(i, 'desc', e.target.value)} aria-label="Item" />
                <input className={input} inputMode="decimal" placeholder="Qty" value={l.qty} onChange={e => setLine(i, 'qty', e.target.value)} aria-label="Quantity" />
                <input className={input + ' col-span-2'} inputMode="decimal" placeholder="Price" value={l.price} onChange={e => setLine(i, 'price', e.target.value)} aria-label="Price" />
              </div>
            ))}
            <button type="button" onClick={() => setLines(p => [...p, { desc: '', qty: '1', price: '' }])}
              className="text-sm font-bold inline-flex items-center gap-1" style={{ color: '#8B5CF6' }}>
              <Plus size={14} /> Add item
            </button>
            <div>
              <label className="text-xs font-bold" style={{ color: '#475569' }}>{cfg.taxLabel} rate %</label>
              <input className={input} inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} aria-label="Tax rate percent" />
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{cfg.rateNote} Rates change; confirm with your accountant.</p>
            </div>
          </div>

          <div>
            <div id="free-invoice" className="p-6 rounded-2xl" style={{ background: 'white', border: '2px solid #1E293B' }}>
              <div className="flex justify-between gap-4 mb-4">
                <div>
                  <p className="text-xl font-black" style={heading}>{cfg.taxLabel === 'Sales tax' ? 'Invoice' : cfg.taxLabel + ' invoice'}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{number} · {date}</p>
                </div>
                <p className="text-sm font-bold text-right" style={{ color: '#1E293B' }}>{seller || 'Your business'}</p>
              </div>
              <p className="text-xs mb-3" style={{ color: '#64748B' }}>Bill to: <span className="font-bold" style={{ color: '#1E293B' }}>{client || 'Customer'}</span></p>
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="text-left text-xs" style={{ color: '#64748B' }}><th>Item</th><th>Qty</th><th className="text-right">Amount</th></tr>
                </thead>
                <tbody>
                  {used.length === 0 && <tr><td colSpan={3} className="py-2 text-xs" style={{ color: '#94A3B8' }}>Add an item to see it here.</td></tr>}
                  {used.map((l, i) => (
                    <tr key={i}><td>{l.desc}</td><td>{l.qty}</td><td className="text-right">{money(cfg.currency, l.qty * l.price)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="text-sm space-y-1 border-t pt-3" style={{ borderColor: '#E2E8F0' }}>
                <p className="flex justify-between"><span>Subtotal</span><span>{money(cfg.currency, t.subtotal)}</span></p>
                <p className="flex justify-between"><span>{cfg.taxLabel} ({t.rate}%)</span><span>{money(cfg.currency, t.tax)}</span></p>
                <p className="flex justify-between font-black text-base"><span>Total</span><span>{money(cfg.currency, t.total)}</span></p>
              </div>
              <p className="text-xs mt-4" style={{ color: '#94A3B8' }}>Made with Samyojak · The ERP/CRM that adapts to you · samyojak-erp.com</p>
            </div>

            <div className="no-print flex flex-wrap gap-3 mt-4">
              <button type="button" onClick={() => window.print()}
                className="px-4 py-2 rounded-full text-sm font-black inline-flex items-center gap-2"
                style={{ background: '#F1F5F9', border: '2px solid #1E293B', color: '#1E293B' }}>
                <Printer size={14} /> Print or save as PDF
              </button>
              <a href={'https://wa.me/?text=' + encodeURIComponent(waText)} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-sm font-black inline-flex items-center gap-2"
                style={{ background: '#DCFCE7', border: '2px solid #1E293B', color: '#166534' }}>
                <MessageCircle size={14} /> Send on WhatsApp
              </a>
            </div>

            <div className="no-print mt-6 p-5 rounded-2xl" style={{ background: '#F5F3FF', border: '2px solid #DDD6FE' }}>
              <p className="font-black mb-1" style={heading}>Want this saved, with unpaid ones chased for you?</p>
              <p className="text-sm mb-3" style={{ color: '#64748B' }}>
                Samyojak keeps every invoice, works out stock and tax, and lets you create the next one by typing a sentence. 14 days free.
              </p>
              <Link href="/signup" className="px-5 py-2 rounded-full text-sm font-black text-white inline-flex items-center gap-2"
                style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
                Keep my invoices <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
