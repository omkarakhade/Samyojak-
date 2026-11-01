'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, FileText, Package, UserCheck, FolderOpen,
  BarChart3, Brain, FileCheck, RefreshCw, UserPlus,
  ArrowRight, X, Check
} from 'lucide-react'

const STEPS = [
  {
    step: 1,
    icon: Users,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    title: 'Start with Leads',
    desc: 'Add your first lead manually or import your entire CRM from Zoho, Salesforce, or any CSV. Every column preserved.',
    action: 'Go to Leads',
    href: '/crm',
  },
  {
    step: 2,
    icon: FileCheck,
    color: '#34D399',
    bg: '#D1FAE5',
    title: 'Create a Quotation',
    desc: 'Build a professional sales quote with line items and tax. Download PDF or convert to invoice in one click.',
    action: 'Create Quote',
    href: '/quotations',
    badge: '🆕',
  },
  {
    step: 3,
    icon: FileText,
    color: '#F472B6',
    bg: '#FCE7F3',
    title: 'Send an Invoice',
    desc: 'Create an invoice with automatic GST, VAT, or HST calculation. Send via WhatsApp. Mark paid when collected.',
    action: 'Create Invoice',
    href: '/invoices',
  },
  {
    step: 4,
    icon: Package,
    color: '#FBBF24',
    bg: '#FEF3C7',
    title: 'Add Your Products',
    desc: 'Track inventory with auto QR codes, low stock alerts, and reorder levels. Import from any POS or Excel.',
    action: 'Add Product',
    href: '/inventory',
  },
  {
    step: 5,
    icon: UserCheck,
    color: '#34D399',
    bg: '#D1FAE5',
    title: 'Set Up Your Team',
    desc: 'Add employees, salaries, departments. Total payroll calculated automatically. Import from any HR software.',
    action: 'Add Employee',
    href: '/hr',
  },
  {
    step: 6,
    icon: UserPlus,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    title: 'Track Hiring',
    desc: 'Manage candidates from Applied to Hired with a visual Kanban pipeline. Never lose track of a great candidate.',
    action: 'Open Recruiting',
    href: '/recruiting',
    badge: '🆕',
  },
  {
    step: 7,
    icon: FolderOpen,
    color: '#F472B6',
    bg: '#FCE7F3',
    title: 'Manage Projects',
    desc: 'Track client projects with deadlines and status columns — Planning, In Progress, Review, Done.',
    action: 'Open Projects',
    href: '/projects',
  },
  {
    step: 8,
    icon: BarChart3,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    title: 'View BI Dashboard',
    desc: 'Live charts across all modules — revenue trends, pipeline, payroll, inventory stock levels.',
    action: 'View Charts',
    href: '/bi',
    badge: '🆕',
  },
  {
    step: 9,
    icon: Brain,
    color: '#FBBF24',
    bg: '#FEF3C7',
    title: 'Ask AI About Your Business',
    desc: 'AI reads your live data and answers specific questions. "Which leads need follow-up?" "Any overdue invoices?"',
    action: 'Open Dashboard',
    href: '/dashboard',
    planRequired: 'Complete',
  },
]

interface Props {
  onDismiss: () => void
}

export default function OnboardingTour({ onDismiss }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1

  const markComplete = () => {
    if (!completed.includes(currentStep)) {
      setCompleted(prev => [...prev, currentStep])
    }
    if (!isLast) setCurrentStep(prev => prev + 1)
    else onDismiss()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a2740] rounded-2xl w-full max-w-lg"
        style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Getting Started — {currentStep + 1} of {STEPS.length}
            </p>
            <h3 className="font-black text-lg dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Welcome to Samyojak
            </h3>
          </div>
          <button onClick={onDismiss}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 px-5 pt-4">
          {STEPS.map((_, i) => (
            <div key={i}
              onClick={() => setCurrentStep(i)}
              className="flex-1 h-1.5 rounded-full cursor-pointer transition-all"
              style={{
                background: completed.includes(i) ? '#34D399' : i === currentStep ? '#8B5CF6' : '#E2E8F0',
              }} />
          ))}
        </div>

        {/* Step content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: step.bg, border: `2px solid ${step.color}` }}>
              <step.icon size={26} style={{ color: step.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-xl dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  {step.title}
                </h4>
                {step.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ background: '#D1FAE5', color: '#065F46' }}>
                    {step.badge}
                  </span>
                )}
                {step.planRequired && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ background: '#FEF3C7', color: '#92400E' }}>
                    Complete plan
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                {step.desc}
              </p>
            </div>
          </div>

          {/* Completed steps */}
          {completed.length > 0 && (
            <div className="mb-4 p-3 rounded-xl"
              style={{ background: '#F0FDF4', border: '1.5px solid #34D399' }}>
              <p className="text-xs font-bold text-green-700 mb-1">✅ Completed so far:</p>
              <div className="flex flex-wrap gap-1">
                {completed.map(i => (
                  <span key={i} className="text-xs text-green-600 flex items-center gap-0.5">
                    <Check size={10} /> {STEPS[i].title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 border border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors dark:text-white">
                ← Back
              </button>
            )}
            <Link href={step.href}
              onClick={markComplete}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: step.color }}>
              {step.action} <ArrowRight size={16} />
            </Link>
            <button onClick={markComplete}
              className="px-4 py-2.5 border border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors dark:text-white">
              {isLast ? 'Finish' : 'Skip →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
