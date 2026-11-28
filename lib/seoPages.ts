// Content for the data-driven marketing pages: /features/<slug> (newer features) and /tax/<country> (invoicing and tax by market).
// Every claim here describes something Samyojak really does today. Tax rates were checked against government pages
// (India GST Council, GOV.UK, UAE FTA, IRAS, ATO, CRA, IRD New Zealand); US state rates are the state part only.
// Pages say plainly that rates change and that the owner should confirm with an accountant.

export interface Faq { q: string; a: string }

export interface SeoPage {
  slug: string
  title: string // <title> (keep under about 60 characters)
  description: string // meta description (under about 160 characters)
  h1: string
  intro: string
  heading: string // heading for the bullet list
  items: string[]
  steps?: { title: string; text: string }[]
  faqs: Faq[]
  related: { label: string; href: string }[]
  cta: string
}

export const FEATURE_PAGES: SeoPage[] = [
  {
    slug: 'ai-agent',
    title: 'AI Agent That Keeps Your Business Records | Samyojak',
    description: 'Tell Samyojak what happened in plain words: it prepares the invoice, lead or stock change, you confirm, and it can be undone. English, Hindi and Hinglish.',
    h1: 'The AI agent that does your data entry',
    intro: 'Type what happened, the way you would tell a colleague. Samyojak prepares the record, asks for what is missing, and saves nothing until you confirm.',
    heading: 'What the agent does',
    items: [
      'Understands plain English, Hindi and Hinglish ("Raj paid 5000", "Vidya wants 12 red dresses")',
      'Prepares invoices, leads, expenses, stock changes and more as a preview you confirm',
      'Asks for missing details like a careful clerk: customer phone, paid or unpaid, supplier, bill number, GST',
      'Undo on every saved change, including the stock it moved',
      'Remembers your habits when you say "remember", and forgets when you say "forget"',
      'Checks stock when a customer asks for items and says plainly if you cannot supply them',
    ],
    steps: [
      { title: 'Say what happened', text: 'Write it in one line, in your own words.' },
      { title: 'Check the preview', text: 'See exactly what will be added or changed, with tax worked out.' },
      { title: 'Confirm or undo', text: 'Nothing is saved until you confirm, and a saved change can be undone.' },
    ],
    faqs: [
      { q: 'Does the agent change my data without asking?', a: 'No. It only proposes changes. You see a preview and confirm before anything is saved, and you can undo afterwards.' },
      { q: 'Which languages does it understand?', a: 'English, Hindi and Hinglish. Owners often mix them, so the agent is built for that.' },
      { q: 'Is it the same as a general chatbot?', a: 'A general chatbot gives you text. Samyojak writes organised records with tax, stock effects, history and undo, so the numbers stay consistent across invoices, stock and reports.' },
    ],
    related: [
      { label: 'Photo to records', href: '/features/photo-to-records' },
      { label: 'AI assistant', href: '/features/ai-assistant' },
      { label: 'Invoicing', href: '/features/invoicing' },
    ],
    cta: 'Let the agent keep your records',
  },
  {
    slug: 'photo-to-records',
    title: 'Photo to Records: Bills and Stock Lists | Samyojak',
    description: 'Take a photo of a supplier bill, a handwritten stock list or a sales invoice. Samyojak reads it, asks for what is missing, and saves only after you confirm.',
    h1: 'Photograph a bill. Get the records.',
    intro: 'Attach a photo in the chat. Samyojak reads the items, quantities and prices, shows what it will add, and waits for your confirmation.',
    heading: 'What it reads',
    items: [
      'Supplier bills: adds the stock to Inventory and records the bill in Expenses as unpaid, with GST and bill number',
      'Handwritten or printed stock lists: adds the items and quantities to Inventory',
      'Sales invoices: keeps the lines, total and GST, then asks only who it was for',
      'Asks for what the photo did not show: supplier name, bill number, GST charged',
      'Nothing is saved until you check the numbers and confirm',
    ],
    faqs: [
      { q: 'Is the reading always correct?', a: 'No reader is perfect, which is why you see the numbers and confirm first. A flat page in good light gives the best result.' },
      { q: 'What happens to the photo?', a: 'The photo is used to read the items. What gets saved is the records you confirm.' },
    ],
    related: [
      { label: 'AI agent', href: '/features/ai-agent' },
      { label: 'Inventory', href: '/features/inventory' },
    ],
    cta: 'Try it with one of your bills',
  },
  {
    slug: 'accounting-books',
    title: 'Automatic Double-Entry Books for Small Business | Samyojak',
    description: 'Invoices, bills and payments post to double-entry books automatically. Balance sheet, trial balance, cash position, journal entries and bank reconciliation.',
    h1: 'Books that keep themselves',
    intro: 'Every invoice, bill and payment you record is posted to double-entry books in the background, so you can see where the business stands without a separate accounting tool.',
    heading: 'What is included',
    items: [
      'Automatic double-entry postings from invoices, bills and payments',
      'Balance sheet, trial balance and cash position, also by chat ("show the balance sheet")',
      'Journal entries for anything that needs a manual adjustment',
      'Bank statements and reconciliation against your records',
      'Budgets and budget versus actual',
      'GST summary and GST return figures for India (figures only, filing is on the GST portal)',
    ],
    faqs: [
      { q: 'Does Samyojak file my tax return?', a: 'No. It prepares the figures. Filing is done on your tax portal or by your accountant.' },
      { q: 'Do I need to know accounting?', a: 'No. You record what happened and the books follow. An accountant can review the journal entries.' },
    ],
    related: [
      { label: 'Invoicing', href: '/features/invoicing' },
      { label: 'Reports', href: '/features/reports' },
      { label: 'Tax invoices by country', href: '/tax' },
    ],
    cta: 'See your books without the work',
  },
  {
    slug: 'manufacturing',
    title: 'Bill of Materials and Production Jobs | Samyojak',
    description: 'Define a bill of materials, run production jobs that use up parts and add finished goods to stock, see the cost to make one unit, and log quality issues.',
    h1: 'Manufacturing, without a separate system',
    intro: 'Small makers can describe what goes into each product, run a job, and have stock follow automatically.',
    heading: 'What is included',
    items: [
      'Bills of materials: the parts and quantities for each finished product',
      'Production jobs: finishing a job uses up the parts and adds the finished goods to Inventory',
      'Undo reverses the stock movement',
      'Report of materials needed for open jobs, and cost to make one unit',
      'Quality issues log linked to your work',
      'Prompts when a material is short or a job has no bill of materials',
    ],
    faqs: [
      { q: 'Which plan includes manufacturing?', a: 'Bills of materials and production jobs are part of the Business plan. See the pricing page for details.' },
    ],
    related: [
      { label: 'Manufacturing industry', href: '/industries/manufacturing' },
      { label: 'Inventory', href: '/features/inventory' },
    ],
    cta: 'Run production from the same place as your stock',
  },
  {
    slug: 'payroll-attendance',
    title: 'Attendance, Leave and Payroll for Small Teams | Samyojak',
    description: 'Mark attendance, approve leave and expense claims, and run monthly payroll that accounts for absences and unpaid leave. Statutory deductions are estimates.',
    h1: 'Attendance, leave and payroll',
    intro: 'Keep the team side of the business next to the money side.',
    heading: 'What is included',
    items: [
      'Attendance with absent and half-day marking',
      'Leave requests and approvals',
      'Expense claims for staff',
      'Payroll report that cuts pay for absences and approved unpaid leave',
      'Run payroll once a month: salaries are recorded as paid expenses',
      'PF, ESI and TDS shown as an estimate, off unless the employee record says so',
    ],
    faqs: [
      { q: 'Are the PF, ESI and TDS amounts final?', a: 'No. They are estimates to help you plan. Confirm statutory amounts with your accountant before paying.' },
    ],
    related: [
      { label: 'HR', href: '/features/hr' },
      { label: 'Recruiting', href: '/features/recruiting' },
    ],
    cta: 'Bring HR and payroll into one place',
  },
  {
    slug: 'warehouses-batches',
    title: 'Multi-Warehouse Stock, Batches and Expiry | Samyojak',
    description: 'Hold stock in several warehouses, transfer between them, track batch, serial and expiry fields, and see stock value and what is about to expire.',
    h1: 'Stock across warehouses, batches and expiry dates',
    intro: 'For shops and distributors that keep stock in more than one place, or sell items that expire.',
    heading: 'What is included',
    items: [
      'A warehouse on every stock record, and transfers between warehouses by chat',
      'Cost price, batch number, serial number and expiry date fields',
      'Reports for stock value, stock by warehouse and items expiring soon',
      'Low-stock alerts and a reorder plan',
      'Stock reduces automatically when an invoice has line items, and undo puts it back',
    ],
    faqs: [
      { q: 'Does it track every serial number separately?', a: 'Serial number is a field on the record. Full serial-level tracking is not built yet.' },
    ],
    related: [
      { label: 'Inventory', href: '/features/inventory' },
      { label: 'QR labels', href: '/features/qr-labels' },
    ],
    cta: 'Know what you have, and where',
  },
  {
    slug: 'qr-labels',
    title: 'Free QR Product Labels for Your Stock | Samyojak',
    description: 'Print QR labels for your products from Inventory. Any phone camera reads the name, SKU and price, so a small shop does not need a second paid label app.',
    h1: 'Print QR labels for your products',
    intro: 'Generate a printable sheet of QR labels straight from Inventory.',
    heading: 'What it does',
    items: [
      'A printable label sheet from your Inventory',
      'Each QR holds the product name, SKU and price as readable text',
      'Any phone camera can read it, no special scanner',
      'Included with the plan, no extra label app to pay for',
    ],
    faqs: [
      { q: 'Does scanning open the item inside Samyojak?', a: 'Not yet. Today the QR shows the item name, SKU and price when scanned.' },
    ],
    related: [
      { label: 'Inventory', href: '/features/inventory' },
      { label: 'Warehouses and batches', href: '/features/warehouses-batches' },
    ],
    cta: 'Label your stock this afternoon',
  },
  {
    slug: 'multi-currency-tax',
    title: 'Multi-Currency Invoices With Tax by Country | Samyojak',
    description: 'Invoice in rupees, pounds, dirhams, dollars and more. Samyojak picks GST, VAT or sales tax from the country, state and items, and you can change the rate.',
    h1: 'Invoices in any currency, with the right tax',
    intro: 'Say who the customer is and where they are. Samyojak works out the tax from the country, the state or province, and what you sold, then tells you how it decided.',
    heading: 'What is included',
    items: [
      'GST, VAT or sales tax chosen by currency and country',
      'Rates by item where it matters, for example clothes under Rs 2,500 at 5% GST in India, or zero-rated food in the UK',
      'US state sales tax and Canadian provincial tax when you give the state or province',
      'When it is not sure about an item, it still adds a rate and asks you to check it',
      'Say a different rate, "including tax", or "no tax" and it follows you',
      'Foreign-currency invoices convert to your home currency in the books',
    ],
    faqs: [
      { q: 'Are the tax rates guaranteed?', a: 'No. Rates change and some items are borderline. Samyojak starts from the standard rate, tells you what it used, and you can change it. Confirm unusual cases with your accountant.' },
    ],
    related: [
      { label: 'Tax invoices by country', href: '/tax' },
      { label: 'Invoicing', href: '/features/invoicing' },
    ],
    cta: 'Invoice any customer, anywhere',
  },
]

export interface TaxPage extends SeoPage {
  country: string
  rates: string[]
}

const taxFaq = (name: string): Faq => ({
  q: `Does Samyojak file my ${name} return?`,
  a: 'No. It prepares invoices and figures. Filing is done through your tax authority or with your accountant.',
})

export const TAX_PAGES: TaxPage[] = [
  {
    slug: 'india', country: 'India', title: 'GST Invoice Software for India | Samyojak',
    description: 'Create GST invoices for India by chatting. Samyojak picks 5%, 18% or other GST rates by item, separates sales and purchase GST, and prepares your figures.',
    h1: 'GST invoicing for Indian businesses',
    intro: 'GST in India changed on 22 September 2025: the main rates are now 5% and 18%. Samyojak applies the rate by what you sold and tells you why.',
    heading: 'How Samyojak helps',
    rates: [
      'Main rates: 5% and 18%; some basic foods 0%; gold jewellery 3%; cold drinks, tobacco and pan masala 40%',
      'Clothes and footwear: 5% up to Rs 2,500 per piece or pair, 18% above',
      'Phones, laptops, TVs, air conditioners, furniture and cement: 18%',
      'GST on a sale (output tax) is collected from the customer; GST on a purchase (input tax) can be claimed back',
    ],
    items: [
      'Picks the GST rate from the items on the invoice and shows the reason',
      'Mixed rates on one invoice are blended so the tax total is right',
      'Asks you to check items it is unsure about, such as medicines and vehicles',
      'Supplier bills record the GST you can claim back',
      'GST summary and GST return figures for filing (no portal filing)',
    ],
    faqs: [
      { q: 'What is the GST on a dress?', a: 'Clothes and footwear are 5% up to Rs 2,500 per piece and 18% above that, under the rates in force since 22 September 2025.' }, taxFaq('GST'),
    ],
    related: [{ label: 'Accounting and books', href: '/features/accounting-books' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next GST invoice by chatting',
  },
  {
    slug: 'united-kingdom', country: 'United Kingdom', title: 'VAT Invoice Software for UK Businesses | Samyojak',
    description: 'Create UK VAT invoices by chatting. Samyojak uses 20% standard VAT, 0% for most food and children’s clothes, and tells you what it applied.',
    h1: 'VAT invoicing for UK businesses',
    intro: 'The standard UK VAT rate is 20%, with a 5% reduced rate and a 0% zero rate for many everyday goods.',
    heading: 'How Samyojak helps',
    rates: [
      'Standard rate 20%',
      'Reduced rate 5%: for example home energy and child car seats',
      'Zero rate 0%: most food, children’s clothes and shoes, books and newspapers, prescription medicines',
      'Sweets, snacks, soft drinks and restaurant or takeaway food are 20%',
    ],
    items: [
      'Applies 20%, 5% or 0% from what you sold, and says which',
      'Invoices in pounds follow UK VAT by default',
      'You can say "including VAT" or a different rate',
      'Items it is unsure about are flagged for you to confirm',
    ],
    faqs: [{ q: 'Is bread zero-rated in the UK?', a: 'Most food is zero-rated, but hot food, takeaway, sweets and snacks are standard-rated. Check borderline products.' }, taxFaq('VAT')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next VAT invoice by chatting',
  },
  {
    slug: 'uae', country: 'United Arab Emirates', title: 'VAT Invoice Software for UAE Businesses | Samyojak',
    description: 'Create UAE VAT invoices by chatting. Samyojak applies 5% VAT, handles zero-rated cases for you to confirm, and invoices in dirhams.',
    h1: 'VAT invoicing for UAE businesses',
    intro: 'The UAE charges 5% VAT on most goods and services.',
    heading: 'How Samyojak helps',
    rates: [
      'Standard rate 5%',
      'Zero-rated: exports and some healthcare and education, investment precious metals',
      'Exempt: residential rent and some financial services',
      'Basic food is not exempt in the UAE',
    ],
    items: [
      'Invoices in dirhams use 5% VAT by default',
      'Zero-rated and exempt cases are flagged for you to confirm',
      'Say a different rate, "including VAT" or "no VAT" and it follows',
    ],
    faqs: [{ q: 'Is food VAT-free in the UAE?', a: 'No. Basic food is taxed at 5% in the UAE.' }, taxFaq('VAT')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next UAE VAT invoice by chatting',
  },
  {
    slug: 'singapore', country: 'Singapore', title: 'GST Invoice Software for Singapore | Samyojak',
    description: 'Create Singapore GST invoices by chatting. Samyojak applies 9% GST, flags exempt and zero-rated cases, and invoices in Singapore dollars.',
    h1: 'GST invoicing for Singapore businesses',
    intro: 'Singapore’s GST rate is 9% since 1 January 2024.',
    heading: 'How Samyojak helps',
    rates: [
      'Standard rate 9%',
      'Zero-rated: exports and international services',
      'Exempt: financial services, residential property, investment precious metals',
      'Food is taxed in Singapore',
    ],
    items: ['Invoices in Singapore dollars use 9% GST by default', 'Exempt and zero-rated cases are flagged for you to confirm', 'Change the rate any time by saying so'],
    faqs: [{ q: 'What is the GST rate in Singapore?', a: '9%, in force since 1 January 2024.' }, taxFaq('GST')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next Singapore GST invoice by chatting',
  },
  {
    slug: 'australia', country: 'Australia', title: 'GST Invoice Software for Australia | Samyojak',
    description: 'Create Australian GST invoices by chatting. Samyojak applies 10% GST, flags GST-free food, health and education, and invoices in Australian dollars.',
    h1: 'GST invoicing for Australian businesses',
    intro: 'Australia’s GST is 10%, with a long list of GST-free items.',
    heading: 'How Samyojak helps',
    rates: [
      'Standard rate 10%',
      'GST-free: basic food, most health and education, approved childcare, exports',
      'Taxed: sweets, snacks, soft drinks, cakes and restaurant food',
      'No GST on financial supplies and residential rent',
    ],
    items: ['Invoices in Australian dollars use 10% GST by default', 'GST-free items are applied and flagged for you to confirm', 'Say a different rate or "no tax" and it follows'],
    faqs: [{ q: 'Is bread GST-free in Australia?', a: 'Basic food is GST-free, but cakes, sweets, snacks and restaurant food are taxed. Check borderline products.' }, taxFaq('GST')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next Australian GST invoice by chatting',
  },
  {
    slug: 'canada', country: 'Canada', title: 'GST/HST Invoice Software for Canada | Samyojak',
    description: 'Create Canadian invoices by chatting. Samyojak uses 5% GST plus provincial tax or HST when you name the province, for example Ontario 13%.',
    h1: 'GST and HST invoicing for Canadian businesses',
    intro: 'Canada charges federal GST of 5%, and each province adds its own tax or uses a combined HST.',
    heading: 'How Samyojak helps',
    rates: [
      'Alberta and the territories: 5% GST only',
      'Ontario: 13% HST. New Brunswick, Newfoundland and Labrador, PEI: 15% HST. Nova Scotia: 14% HST',
      'British Columbia: GST 5% + PST 7% (12%). Manitoba: GST 5% + PST 7% (12%). Saskatchewan: GST 5% + PST 6% (11%)',
      'Quebec: GST 5% + QST 9.975% (14.975%)',
      'Basic groceries and prescription drugs are zero-rated',
    ],
    items: ['Say the province and Samyojak uses the combined rate', 'Without a province it uses 5% and tells you to name it', 'Zero-rated and exempt cases are flagged for you to confirm'],
    faqs: [{ q: 'What tax applies in Ontario?', a: '13% HST (federal and provincial combined).' }, taxFaq('GST/HST')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next Canadian invoice by chatting',
  },
  {
    slug: 'united-states', country: 'United States', title: 'Sales Tax Invoice Software for US Businesses | Samyojak',
    description: 'Create US invoices by chatting. Samyojak uses the state sales tax when you name the state, and reminds you that city or county tax may add more.',
    h1: 'Sales tax invoicing for US businesses',
    intro: 'The US has no federal sales tax. Each state sets its own, and cities or counties often add more.',
    heading: 'How Samyojak helps',
    rates: [
      'State rates run from 0% to about 7.25% (state part only)',
      'No state sales tax: Alaska, Delaware, Montana, New Hampshire, Oregon',
      'Groceries and prescriptions are exempt in most states; most services are not taxed',
      'Local taxes can add to the state rate, so check your city or county',
    ],
    items: ['Say the customer’s state, for example "Texas", and it uses the state rate (Texas 6.25%)', 'Without a state it asks, and uses no tax until you say', 'Reminds you that local tax may add more'],
    faqs: [{ q: 'Does Samyojak handle city and county sales tax?', a: 'It uses the state rate and reminds you to check local tax. Tell it a different rate and it follows.' }, taxFaq('sales tax')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next US invoice by chatting',
  },
  {
    slug: 'new-zealand', country: 'New Zealand', title: 'GST Invoice Software for New Zealand | Samyojak',
    description: 'Create New Zealand GST invoices by chatting. Samyojak applies 15% GST and invoices in New Zealand dollars.',
    h1: 'GST invoicing for New Zealand businesses',
    intro: 'New Zealand charges 15% GST on almost everything, food included.',
    heading: 'How Samyojak helps',
    rates: ['Standard rate 15%', 'Exports are zero-rated', 'Financial services and residential rent are exempt'],
    items: ['Invoices in New Zealand dollars use 15% GST by default', 'Exempt cases are flagged for you to confirm', 'Say a different rate or "no tax" and it follows'],
    faqs: [{ q: 'Is food GST-free in New Zealand?', a: 'No. GST applies to almost all goods and services, including food.' }, taxFaq('GST')],
    related: [{ label: 'Multi-currency and tax', href: '/features/multi-currency-tax' }, { label: 'Tax by country', href: '/tax' }],
    cta: 'Make your next New Zealand GST invoice by chatting',
  },
]
