'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

const steps = [
  { title: 'Welcome to Samyojak! 🎉', desc: 'Your all-in-one business coordinator. Let us show you around in 60 seconds.' },
  { title: 'Your Command Center 📊', desc: 'The dashboard shows all key business metrics live — leads, revenue, invoices, and projects at a glance.' },
  { title: 'Revenue Matrix 📈', desc: 'See your revenue growth month by month. Watch your business scale efficiently.' },
  { title: 'Lead Velocity 🚀', desc: 'Track how fast your leads are growing week over week.' },
  { title: 'CRM — Your Sales Engine 👥', desc: 'Capture leads, track your sales pipeline, and never miss a follow-up again.' },
  { title: 'AI Lead Scoring 🤖', desc: 'Every lead gets an AI score 0-100 based on source, status, deal value, and follow-up date. Focus on the best leads first.' },
  { title: 'Invoicing with GST 📄', desc: 'Create GST-compliant invoices in seconds. Choose 5%, 12%, 18%, or 28% GST rate automatically.' },
  { title: 'WhatsApp Integration 💬', desc: 'Send invoices directly to clients via WhatsApp with one click. No app switching needed.' },
  { title: 'Inventory with QR Codes 📦', desc: 'Every product gets a free auto-generated QR code. Scan with any phone camera — no hardware needed.' },
  { title: 'Low Stock Alerts ⚠️', desc: 'Get automatic alerts when products fall below reorder level. Never run out of stock again.' },
  { title: 'HR Management 👔', desc: 'Manage employees, track attendance, and process payroll all in one place.' },
  { title: 'Projects Kanban 🎯', desc: 'Track all projects from Planning to Done with a beautiful Kanban board.' },
  { title: 'GST Reports 📊', desc: 'Automatic GSTR-1 format reports with full tax breakdown by rate. Export to CSV anytime.' },
  { title: 'Global Search ⌘K', desc: 'Press Ctrl+K or Cmd+K from anywhere to instantly search across all leads, invoices, and products.' },
  { title: 'Quick Add Button ⚡', desc: 'The floating + button lets you add leads, invoices, products, employees, or projects from any page instantly.' },
  { title: 'Dark Mode 🌙', desc: 'Toggle dark mode from the header. Your preference is saved automatically across sessions.' },
  { title: 'Export Your Data 📥', desc: 'Every module has CSV export. Your data always belongs to you — download anytime.' },
  { title: "You're All Set! 🚀", desc: 'Samyojak is ready to help coordinate everything and run anything. Start by adding your first lead!' },
]

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === '/dashboard') {
      const done = localStorage.getItem('samyojak-tour-done')
      if (!done) {
        setTimeout(() => setShow(true), 1500)
      }
    }
  }, [pathname])

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1)
    else finish()
  }

  const back = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const finish = () => {
    localStorage.setItem('samyojak-tour-done', 'true')
    setShow(false)
  }

  if (!show) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 flex-wrap flex-1 mr-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? 'bg-blue-600 w-6' :
                  i < step ? 'bg-blue-300 w-2' : 'bg-gray-200 dark:bg-white/20 w-2'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{step + 1} of {steps.length}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{current.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">{current.desc}</p>

        <div className="flex items-center gap-3">
          <button onClick={finish} className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2">
            Skip
          </button>
          {step > 0 && (
            <button
              onClick={back}
              className="flex-1 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            {isLast ? "Let's Go! 🚀" : 'Next →'}
          </button>
        </div>

        {isLast && (
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => { finish(); router.push('/crm') }}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700"
            >
              Add First Lead
            </button>
            <button
              onClick={() => { finish(); router.push('/invoices') }}
              className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-purple-700"
            >
              Create Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
