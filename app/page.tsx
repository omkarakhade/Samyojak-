'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Check } from 'lucide-react'

const prices = {
  weekly: ['$4.99', '$9.99', '$16.99', '$21.99'],
  monthly: ['$15', '$35', '$60', '$79'],
  yearly: ['$144', '$336', '$576', '$759'],
}

const plans = ['CRM Starter', 'ERP Basic', 'Business', 'Complete']

const planFeatures = [
  ['CRM & Leads', 'Follow-ups', 'Up to 5 users', 'Email support'],
  ['Inventory', 'Invoicing', 'GST reports', 'Up to 10 users'],
  ['CRM + ERP + HR', 'Projects', 'Up to 25 users', 'Priority support'],
  ['Everything', 'AI features', 'Unlimited users', 'API access'],
]

const comparison = [
  ['Flat pricing', true, false, false],
  ['Setup in minutes', true, false, false],
  ['QR codes free', true, false, false],
  ['GST ready India', true, false, false],
  ['Weekly plans', true, false, false],
  ['WhatsApp invoices', true, false, false],
  ['AI lead scoring', true, false, false],
  ['Mobile first', true, false, false],
]

export default function Home() {
  const [billing, setBilling] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-white font-bold text-xl">Samyojak</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-white/70 hover:text-white text-sm hidden md:block">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Start Free
          </Link>
        </div>
      </nav>

      <section className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
            <span className="text-blue-400 text-sm">Now live · Built for Indian businesses</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            One System.<br />
            <span className="text-blue-500">Every Operation.</span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            The all-in-one ERP built for modern businesses. CRM, Invoicing, Inventory, HR, and Projects unified in one premium workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/login"
              className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="text-white/40 text-sm mb-2">
            Buy any weekly plan · Get 7 extra days free · 14 days total
          </p>
          <p className="text-green-400 text-xs mb-16">🎁 No credit card required to start</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white/40 text-xs ml-2">Samyojak · Live preview</span>
              <span className="ml-auto text-green-400 text-xs">● System Online</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Leads', value: '1,284', change: '+12%' },
                { label: 'Revenue', value: '₹48.2K', change: '+24%' },
                { label: 'Open Invoices', value: '37', change: '-3%' },
                { label: 'Active Projects', value: '12', change: '+2' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4 text-left">
                  <p className="text-white/50 text-xs mb-1">{item.label}</p>
                  <p className="text-white text-2xl font-bold">{item.value}</p>
                  <p className="text-green-400 text-xs mt-1">{item.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 text-center">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-6">TRUSTED BY 500+ GROWING TEAMS</p>
        <div className="flex justify-center gap-8 flex-wrap px-6">
          {['NORTHWIND', 'ACME CO', 'STELLAR', 'VERTEX', 'HORIZON', 'QUANTUM'].map(name => (
            <span key={name} className="text-gray-300 font-semibold text-sm">{name}</span>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything your business runs on</h2>
            <p className="text-gray-500">Six modules. Zero context-switching. One source of truth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'CRM', desc: 'Capture leads, AI scoring 0-100, pipeline tracking, follow-up reminders.', icon: '👥' },
              { title: 'Invoicing', desc: 'GST invoices, Stripe payments, WhatsApp sending, PDF download.', icon: '📄' },
              { title: 'Inventory', desc: 'Products with free QR codes, low stock alerts, CSV export.', icon: '📦' },
              { title: 'HR', desc: 'Employee management, attendance tracking, payroll calculator.', icon: '👔' },
              { title: 'Projects', desc: 'Kanban board, task management, deadline tracking.', icon: '🎯' },
              { title: 'GST Reports', desc: 'Auto GSTR-1 format, monthly breakdown by tax rate, PDF export.', icon: '📊' },
            ].map(f => (
              <div key={f.title} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Why Samyojak beats the rest</h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-gray-600 font-medium text-sm">Feature</th>
                  <th className="p-4 text-center text-blue-600 font-bold text-sm">Samyojak</th>
                  <th className="p-4 text-center text-gray-400 font-medium text-sm">Zoho</th>
                  <th className="p-4 text-center text-gray-400 font-medium text-sm">Odoo</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([feature, s, z, o]) => (
                  <tr key={String(feature)} className="border-t">
                    <td className="p-4 text-gray-700 text-sm">{String(feature)}</td>
                    <td className="p-4 text-center text-lg">{s ? '✅' : '❌'}</td>
                    <td className="p-4 text-center text-lg">{z ? '✅' : '❌'}</td>
                    <td className="p-4 text-center text-lg">{o ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24 px-6" id="pricing">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 mb-2">Buy any weekly plan and get 7 extra days free.</p>
          <p className="text-green-600 text-sm font-medium mb-8">🎁 That is 14 days for the price of 7!</p>

          <div className="flex justify-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mx-auto mb-12">
            {(['weekly', 'monthly', 'yearly'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  billing === b ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {b}
                {b === 'weekly' && <span className="ml-1 text-green-500 text-xs">+7 free</span>}
                {b === 'yearly' && <span className="ml-1 text-green-500 text-xs">-20%</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div
                key={plan}
                className={`rounded-2xl p-6 border-2 ${
                  i === 2 ? 'border-blue-600 bg-blue-600' : 'border-gray-200 bg-white'
                }`}
              >
                {i === 2 && (
                  <div className="text-xs font-bold text-blue-200 mb-2 uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-bold text-lg ${i === 2 ? 'text-white' : 'text-gray-900'}`}>
                  {plan}
                </h3>
                <div className="mt-3 mb-4">
                  <span className={`text-4xl font-black ${i === 2 ? 'text-white' : 'text-gray-900'}`}>
                    {prices[billing][i]}
                  </span>
                  <span className={`text-sm ${i === 2 ? 'text-blue-200' : 'text-gray-500'}`}>
                    /{billing === 'weekly' ? 'wk' : billing === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {billing === 'weekly' && (
                  <div className={`text-xs font-bold px-3 py-1 rounded-full mb-4 text-center ${i === 2 ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    🎁 +7 Days Free
                  </div>
                )}
                <ul className="space-y-2 mb-6">
                  {planFeatures[i].map(f => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${i === 2 ? 'text-blue-100' : 'text-gray-600'}`}
                    >
                      <Check size={14} className={i === 2 ? 'text-blue-200' : 'text-green-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    i === 2
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#0A1628] py-12 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-xl">Samyojak</span>
        </div>
        <p className="text-white/40 text-sm mb-4">Coordinate Everything. Run Anything.</p>
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/privacy" className="text-white/30 text-xs hover:text-white/60">Privacy Policy</Link>
          <Link href="/terms" className="text-white/30 text-xs hover:text-white/60">Terms of Service</Link>
        </div>
        <p className="text-white/20 text-xs">© 2026 Samyojak. All rights reserved.</p>
      </footer>
    </div>
  )
}
