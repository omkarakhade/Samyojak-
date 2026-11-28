import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'
import MarketingFooter from '@/components/MarketingFooter'
import SeoBreadcrumb from '@/components/SeoBreadcrumb'
import SeoFaqAccordion from '@/components/SeoFaqAccordion'
import SeoCtaSection from '@/components/SeoCtaSection'

const TITLE = 'What Is ERP? Meaning, Full Form, Examples and Modules'
const DESC = 'ERP meaning in plain words: the full form (Enterprise Resource Planning), what an ERP does, its modules, real examples, who needs one and how to choose.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: 'https://www.samyojak-erp.com/learn/what-is-erp' },
  openGraph: { title: TITLE, description: DESC, url: 'https://www.samyojak-erp.com/learn/what-is-erp' },
}

const faqs = [
  { q: 'What does ERP stand for?', a: 'ERP stands for Enterprise Resource Planning. It is software that keeps sales, invoicing, inventory, purchasing, HR and accounts in one connected system.' },
  { q: 'What is the full form of ERP?', a: 'The full form of ERP is Enterprise Resource Planning. The word enterprise is historical: today small and medium businesses use ERP too.' },
  { q: 'What is an ERP system used for?', a: 'It is used to run daily operations from one place: record sales and invoices, track stock, manage vendors and purchases, pay staff, and see the numbers without copying data between spreadsheets.' },
  { q: 'What are examples of ERP software?', a: 'Well-known examples are SAP, Oracle NetSuite, Microsoft Dynamics 365, Odoo and Zoho. They differ a lot in price, setup effort and how much they suit a small business.' },
  { q: 'What modules does an ERP typically include?', a: 'Common modules are CRM (leads and customers), sales and invoicing, inventory and warehouses, purchasing, manufacturing, accounting, HR and payroll, and projects. The exact list varies by product.' },
  { q: 'Do small businesses need ERP software?', a: 'Not on day one. A small business can start with spreadsheets, but once the same data is typed in two or three places, stock or dues go wrong, or tax invoices take hours, an ERP starts to pay for itself.' },
  { q: 'What is the difference between ERP and accounting software?', a: 'Accounting software handles the books. An ERP handles the books plus the operations that feed them: sales, stock, purchasing, payroll and projects, so entries are created from the work itself.' },
  { q: 'What is an adaptive or AI ERP?', a: 'An adaptive ERP changes its fields and modules to fit how your business works, and an AI ERP lets you record things by typing a sentence or uploading a photo instead of filling forms.' },
]

const modules = [
  { name: 'CRM', does: 'Leads, customers and follow-ups, so no enquiry is forgotten.' },
  { name: 'Sales and invoicing', does: 'Quotations, orders, tax invoices, payments received and dues.' },
  { name: 'Inventory', does: 'Stock by item and warehouse, batches, expiry and reorder levels.' },
  { name: 'Purchasing', does: 'Vendors, purchase orders, bills and what you owe.' },
  { name: 'Accounting', does: 'Books built from invoices, expenses and payments: trial balance, balance sheet, tax summary.' },
  { name: 'Manufacturing', does: 'Bill of materials and production jobs that use up parts and add finished goods.' },
  { name: 'HR and payroll', does: 'Staff, attendance, leave and salary.' },
  { name: 'Projects', does: 'Work, deadlines and status for service businesses.' },
]

const signs = [
  'The same customer or item is typed into more than one sheet.',
  'Stock in the sheet and stock on the shelf never match.',
  'You chase unpaid invoices from memory.',
  'Month-end tax and books take days instead of minutes.',
  'You cannot answer how much did we sell this month without opening five files.',
]

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESC,
  dateModified: '2026-11-28',
  author: { '@type': 'Organization', name: 'Samyojak' },
  publisher: { '@type': 'Organization', name: 'Samyojak', url: 'https://www.samyojak-erp.com' },
  mainEntityOfPage: 'https://www.samyojak-erp.com/learn/what-is-erp',
}

const para = { color: '#64748B' } as const
const h2 = { fontFamily: 'Outfit', color: '#1E293B' } as const

export default function WhatIsErpPage() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <MarketingNav />

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SeoBreadcrumb items={[{ label: 'Learn', href: '/learn' }, { label: 'What Is ERP?' }]} />
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={h2}>
            What Is ERP? Meaning, Full Form and Examples
          </h1>

          <div className="rounded-2xl p-6 mb-8" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
            <p className="text-lg font-semibold" style={{ color: '#1E293B' }}>
              ERP means Enterprise Resource Planning. It is business software that keeps sales,
              invoices, stock, purchases, accounts and staff in one connected system, so each piece of
              information is entered once and shows up everywhere it is needed.
            </p>
          </div>

          <p className="text-lg mb-6" style={para}>
            Without an ERP, a sales lead sits in one spreadsheet, the invoice in another tool and the
            stock count in a third. Someone has to copy numbers between them, and the copies drift
            apart. An ERP gives the business a single source of truth: when you bill a customer, stock
            goes down, the amount due goes up, and the books update by themselves.
          </p>

          <h2 className="text-2xl font-black mt-10 mb-4" style={h2}>ERP full form and meaning</h2>
          <p className="text-lg mb-6" style={para}>
            ERP stands for Enterprise Resource Planning. Resource means the things a business runs on:
            money, stock, people, time and orders. Planning means seeing and organising them together.
            The word enterprise comes from the early days when only large companies could afford it.
            Today small and medium businesses use ERP too, and cloud software has made it far cheaper
            to start.
          </p>

          <h2 className="text-2xl font-black mt-10 mb-4" style={h2}>What an ERP does: the main modules</h2>
          <div className="grid gap-3 mb-8">
            {modules.map(m => (
              <div key={m.name} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
                <p className="font-bold" style={{ color: '#1E293B' }}>{m.name}</p>
                <p className="text-sm" style={para}>{m.does}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black mt-10 mb-4" style={h2}>Examples of ERP software</h2>
          <p className="text-lg mb-4" style={para}>
            SAP and Oracle NetSuite are built mainly for large companies. Microsoft Dynamics 365 sits in
            the middle. Odoo and Zoho are popular with smaller businesses. They differ in price, setup
            time and how much you must configure before you can use them. See the side-by-side pages
            for details:
          </p>
          <p className="mb-8">
            <Link href="/alternatives" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP alternatives →</Link>{' '}
            <Link href="/compare/samyojak-vs-zoho" className="text-sm font-bold hover:underline ml-3" style={{ color: '#8B5CF6' }}>Samyojak vs Zoho →</Link>
          </p>

          <h2 className="text-2xl font-black mt-10 mb-4" style={h2}>Signs you have outgrown spreadsheets</h2>
          <ul className="mb-8 list-disc pl-6 space-y-2 text-lg" style={para}>
            {signs.map(s => <li key={s}>{s}</li>)}
          </ul>
          <p className="text-lg mb-8" style={para}>
            If two or three of these are true, an ERP will save you time. Our{' '}
            <Link href="/learn/erp-vs-spreadsheet" className="font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP vs spreadsheet guide</Link>{' '}
            compares them honestly, and{' '}
            <Link href="/learn/how-to-choose-an-erp" className="font-bold hover:underline" style={{ color: '#8B5CF6' }}>how to choose an ERP</Link>{' '}
            lists what to check before you buy.
          </p>

          <h2 className="text-2xl font-black mt-10 mb-4" style={h2}>The modern version: adaptive and AI ERP</h2>
          <p className="text-lg mb-4" style={para}>
            Older ERPs ask you to bend your business to their forms. An adaptive ERP bends to you, and an
            AI ERP lets you type or photograph what happened instead of filling screens. For example,
            type the sale in one sentence, or upload a photo of a bill, and the invoice, stock change and
            tax are created for you to confirm.
          </p>
          <p className="mb-2">
            <Link href="/learn/what-is-adaptive-erp" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is adaptive ERP? →</Link>
          </p>
          <p className="mb-2">
            <Link href="/features/ai-agent" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Record by chat with the AI agent →</Link>
          </p>
          <p className="mb-2">
            <Link href="/features/photo-to-records" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Turn a photo of a bill into records →</Link>
          </p>
          <p className="mb-8">
            <Link href="/tax" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>GST, VAT and sales tax by country →</Link>
          </p>
        </div>
      </section>

      <section className="px-6 pb-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto py-16">
          <h2 className="text-2xl font-black mb-6" style={h2}>Frequently asked questions</h2>
          <SeoFaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3">
          <Link href="/learn/what-is-crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>What is CRM? →</Link>
          <Link href="/learn/erp-vs-crm" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>ERP vs CRM →</Link>
          <Link href="/learn/how-does-erp-work" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>How does ERP work? →</Link>
          <Link href="/pricing" className="text-sm font-bold hover:underline" style={{ color: '#8B5CF6' }}>Pricing →</Link>
        </div>
      </section>

      <SeoCtaSection heading="Try an ERP you can talk to" subheading="Import your sheet or type your first sale. You are running in minutes." />
      <MarketingFooter />
    </div>
  )
}
