// "X alternative" pages for people already comparing tools. Written to be fair: each says when the other tool is the better
// choice, and only describes what Samyojak really does today. Competitor facts are kept general; plans and prices change,
// so the pages tell readers to check the other vendor's current plans.

import type { SeoPage } from '@/lib/seoPages'

const common = (name: string) => [
  'Record a sale, an expense or stock by typing a sentence, and confirm before it is saved',
  'Take a photo of a supplier bill or invoice and the lines are read for you to check',
  'Bring your existing spreadsheet as it is, with no column mapping',
  'Invoices reduce stock, and the books (balance sheet, trial balance, cash) build themselves from what you record',
  'GST, VAT or sales tax by item and country, with the rate shown and editable',
  'Send an invoice or a payment reminder to the customer on WhatsApp',
  `A 14-day free trial, so you can try your own data next to ${name}`,
]

const faqFor = (name: string, stay: string): { q: string; a: string }[] => [
  { q: `When should I stay with ${name}?`, a: stay },
  { q: `Can I try Samyojak without leaving ${name}?`, a: `Yes. Start the 14-day free trial, import a spreadsheet export of your customers or items, and run a few real invoices next to ${name} before you decide.` },
  { q: 'Does Samyojak file my tax return?', a: 'No. It prepares invoices and the tax figures. Filing is done on your tax authority portal or by your accountant.' },
]

export const ALT_PAGES: SeoPage[] = [
  {
    slug: 'tally',
    title: 'Tally Alternative for Small Businesses | Samyojak',
    description: 'Looking for a Tally alternative? Samyojak lets you record by typing or a photo, imports your spreadsheet as it is, and picks GST by item. Try it free for 14 days.',
    h1: 'A Tally alternative for small businesses',
    intro: 'Tally is a long-established accounting product used widely in India. If you mainly want to stop typing everything in by hand and run billing, stock and dues from one place, here is how Samyojak differs.',
    heading: 'What Samyojak does differently',
    items: common('Tally'),
    faqs: faqFor('Tally', 'If your accountant works in Tally, you need deep statutory accounting and audit reports, or you must file returns from the same tool, Tally is the safer choice. Samyojak is built for running day-to-day billing, stock and dues without bookkeeping effort, not for replacing a full accounting practice.'),
    related: [{ label: 'GST invoicing in India', href: '/tax/india' }, { label: 'All alternatives', href: '/alternatives' }],
    cta: 'Try Samyojak next to Tally',
  },
  {
    slug: 'vyapar',
    title: 'Vyapar Alternative for Small Businesses | Samyojak',
    description: 'Comparing billing apps like Vyapar? Samyojak adds an AI agent that records by chat or photo, plus books, payroll and manufacturing. Try 14 days free.',
    h1: 'A Vyapar alternative that records for you',
    intro: 'Vyapar is a popular billing and accounting app for small businesses. If your needs have grown past invoices into stock, purchasing, payroll or production, or you want to record by chat instead of forms, here is what Samyojak offers.',
    heading: 'What Samyojak adds',
    items: [...common('Vyapar'), 'Purchasing, manufacturing with bills of materials, payroll and attendance in the same workspace'],
    faqs: faqFor('Vyapar', 'If you only need simple billing on a phone, work mostly offline, or are happy with what you have, there is no need to move. Check Vyapar current plans and compare with ours before deciding.'),
    related: [{ label: 'GST invoicing in India', href: '/tax/india' }, { label: 'All alternatives', href: '/alternatives' }],
    cta: 'Try Samyojak next to Vyapar',
  },
  {
    slug: 'mybillbook',
    title: 'myBillBook Alternative | Samyojak',
    description: 'A myBillBook alternative with an AI agent: record sales and stock by typing or photo, import any spreadsheet, GST by item. Free for 14 days.',
    h1: 'A myBillBook alternative with an AI agent',
    intro: 'myBillBook is a GST billing app aimed at small shops and traders. If you want billing plus an assistant that does the data entry and notices what is missing, here is how Samyojak compares.',
    heading: 'What Samyojak does differently',
    items: common('myBillBook'),
    faqs: faqFor('myBillBook', 'If simple GST billing on your phone already covers everything and your team is used to it, stay. Switch only when entering data by hand, chasing dues or tracking stock starts costing you time.'),
    related: [{ label: 'GST invoicing in India', href: '/tax/india' }, { label: 'All alternatives', href: '/alternatives' }],
    cta: 'Try Samyojak next to myBillBook',
  },
  {
    slug: 'zoho-books',
    title: 'Zoho Books Alternative for Small Business | Samyojak',
    description: 'Zoho Books alternative: one workspace with an AI agent, stock, payroll and manufacturing, flat pricing and no per-user fees. Try Samyojak free for 14 days.',
    h1: 'A Zoho Books alternative with stock, payroll and an AI agent',
    intro: 'Zoho Books is a well-known accounting product, and Zoho sells related apps for stock, CRM and more. If you would rather have one workspace where you can talk to the system and import your own sheet, here is how Samyojak is different.',
    heading: 'What Samyojak does differently',
    items: [...common('Zoho Books'), 'Flat plans with no per-user fees'],
    faqs: faqFor('Zoho Books', 'If you already use several Zoho apps and want them connected, or need its deeper accounting reports and integrations, staying in the Zoho family makes sense. Check the current Zoho plans and compare.'),
    related: [{ label: 'Samyojak vs Zoho', href: '/compare/samyojak-vs-zoho' }, { label: 'All alternatives', href: '/alternatives' }],
    cta: 'Try Samyojak next to Zoho Books',
  },
  {
    slug: 'quickbooks',
    title: 'QuickBooks Alternative for Small Business | Samyojak',
    description: 'QuickBooks alternative with an AI agent: record by chat or photo, VAT and sales tax by item, stock and payroll in one place. Try 14 days free.',
    h1: 'A QuickBooks alternative for small businesses',
    intro: 'QuickBooks is a widely used accounting product, strong where it is built around local tax rules and an accountant ecosystem. If you want to run billing, stock and dues by simply telling the system what happened, here is what Samyojak offers.',
    heading: 'What Samyojak does differently',
    items: common('QuickBooks'),
    faqs: faqFor('QuickBooks', 'If your accountant works in QuickBooks, you rely on its payroll or bank connections in your country, or you need its local compliance features, stay with it. Samyojak prepares figures but does not file returns.'),
    related: [{ label: 'Tax by country', href: '/tax' }, { label: 'All alternatives', href: '/alternatives' }],
    cta: 'Try Samyojak next to QuickBooks',
  },
]
