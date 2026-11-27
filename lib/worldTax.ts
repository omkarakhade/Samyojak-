// Sales tax / VAT / GST knowledge for every market Samyojak serves, so invoices get a sensible rate by country,
// by where the customer is (state or province) and by what was sold. Rates were checked against government and
// tax-authority pages (UK GOV.UK, UAE FTA, Singapore IRAS, Australia ATO, Canada CRA, India GST Council) and the Tax Foundation
// list for Europe. Countries and US states marked "unchecked" come from general knowledge: the owner is asked to confirm them.
// This is a starting point, never tax advice: the owner can always say a different rate, "including tax" or "no tax".

import { parseLineItems } from '@/lib/lineItems'
import { suggestInvoiceRate } from '@/lib/indiaGst'

type ItemRule = {
  re: RegExp | RegExp[] // every regex in a list must match
  rate: number | 'base' // 'base' means the normal rate of the place
  label: string
  confirm?: boolean
}

interface System {
  name: string // shown on the invoice
  label: string // short label
  rate: number // standard rate, percent
  rules: ItemRule[]
}

const BASIC_FOOD = /\b(bread|milk|eggs?|cheese|butter|rice|flour|fruits?|vegetables?|meat|chicken|fish|pasta|cereals?|lentils|beans|potatoes|onions?)\b/i
const TREATS = /\b(confectionery|sweets?|candy|chocolates?|crisps|chips|ice cream|soft drinks?|cola|energy drinks?|takeaway|take-away|restaurant|hot food|snacks?|alcohol|beer|wine|whisky|vodka|cakes?|biscuits?)\b/i
const KIDS = /\b(kids?|child(ren)?('?s)?|baby|babies|infant|toddler)\b/i
const CLOTHES = /\b(clothes|clothing|shoes?|dress(es)?|shirts?|t-?shirts?|jeans|trousers|coats?|jackets?|sweaters?|socks|uniforms?|footwear)\b/i
const PRESCRIPTION = /\b(prescription|prescribed|medicines?|drugs?)\b/i
const HEALTH_EDU = /\b(medical|healthcare|hospital|doctor|dental|consultation|tuition|school fees|education|course fees|training course)\b/i
const RENT_HOME = /\b(residential (rent|lease|property)|house rent|flat rent|apartment rent|home rent)\b/i
const FINANCIAL = /\b(insurance|loan interest|bank charges?|banking fees?)\b/i
const INVESTMENT_METAL = /\b(investment (gold|silver|platinum)|gold bars?|gold bullion|silver bars?)\b/i

const SYSTEMS: Record<string, System> = {
  UK: {
    name: 'VAT (UK)', label: 'VAT', rate: 20,
    rules: [
      { re: TREATS, rate: 20, label: 'sweets, snacks, soft drinks and restaurant or takeaway food are 20%' },
      { re: [KIDS, CLOTHES], rate: 0, label: "children's clothes and shoes are 0%" },
      { re: BASIC_FOOD, rate: 0, label: 'most food is 0%' },
      { re: /\b(books?|newspapers?|magazines?|journals?)\b/i, rate: 0, label: 'books and newspapers are 0%' },
      { re: /\b(sanitary|tampons?|menstrual)\b/i, rate: 0, label: 'sanitary products are 0%' },
      { re: PRESCRIPTION, rate: 0, label: 'medicines dispensed on prescription are 0% (other medicines are 20%)', confirm: true },
      { re: /\b(domestic (gas|electricity|fuel)|heating oil|child car seats?|car seats?|nicotine (patches|gum))\b/i, rate: 5, label: 'home energy and child car seats are 5%', confirm: true },
      { re: [HEALTH_EDU], rate: 0, label: 'health and education services are exempt (no VAT charged)', confirm: true },
      { re: FINANCIAL, rate: 0, label: 'insurance and finance are exempt (no VAT charged)', confirm: true },
    ],
  },
  UAE: {
    name: 'VAT (UAE)', label: 'VAT', rate: 5,
    rules: [
      { re: [HEALTH_EDU], rate: 0, label: 'some healthcare and education is 0%', confirm: true },
      { re: INVESTMENT_METAL, rate: 0, label: 'investment gold, silver and platinum are 0%', confirm: true },
      { re: RENT_HOME, rate: 0, label: 'residential rent is exempt (no VAT charged)', confirm: true },
      { re: FINANCIAL, rate: 0, label: 'some financial services and life insurance are exempt', confirm: true },
    ],
  },
  SG: {
    name: 'GST (Singapore)', label: 'GST', rate: 9,
    rules: [
      { re: RENT_HOME, rate: 0, label: 'residential property rent and sale are exempt (no GST charged)', confirm: true },
      { re: FINANCIAL, rate: 0, label: 'financial services are exempt (no GST charged)', confirm: true },
      { re: INVESTMENT_METAL, rate: 0, label: 'investment precious metals are exempt', confirm: true },
    ],
  },
  AU: {
    name: 'GST (Australia)', label: 'GST', rate: 10,
    rules: [
      { re: TREATS, rate: 10, label: 'sweets, snacks, soft drinks, cakes and restaurant food have 10% GST' },
      { re: BASIC_FOOD, rate: 0, label: 'basic food is GST-free', confirm: true },
      { re: PRESCRIPTION, rate: 0, label: 'prescription medicines are GST-free', confirm: true },
      { re: [HEALTH_EDU], rate: 0, label: 'most health and education services are GST-free', confirm: true },
      { re: /\b(childcare|child care)\b/i, rate: 0, label: 'approved childcare is GST-free', confirm: true },
      { re: RENT_HOME, rate: 0, label: 'residential rent has no GST', confirm: true },
      { re: FINANCIAL, rate: 0, label: 'financial supplies have no GST', confirm: true },
    ],
  },
  CA: {
    name: 'GST/HST (Canada)', label: 'GST', rate: 5,
    rules: [
      { re: TREATS, rate: 'base', label: 'snacks, candy, drinks and restaurant food are taxed' },
      { re: BASIC_FOOD, rate: 0, label: 'basic groceries are zero-rated', confirm: true },
      { re: PRESCRIPTION, rate: 0, label: 'prescription drugs are zero-rated', confirm: true },
      { re: [HEALTH_EDU], rate: 0, label: 'most health and education services are exempt', confirm: true },
      { re: RENT_HOME, rate: 0, label: 'long-term residential rent is exempt', confirm: true },
      { re: FINANCIAL, rate: 0, label: 'financial services are exempt', confirm: true },
    ],
  },
  NZ: {
    name: 'GST (New Zealand)', label: 'GST', rate: 15,
    rules: [
      { re: RENT_HOME, rate: 0, label: 'residential rent is exempt (no GST charged)', confirm: true },
      { re: FINANCIAL, rate: 0, label: 'financial services are exempt (no GST charged)', confirm: true },
    ],
  },
  EU: { name: 'VAT (EU)', label: 'VAT', rate: 20, rules: [] },
  US: { name: 'Sales tax (US)', label: 'Sales tax', rate: 0, rules: [] },
  OTHER: { name: 'VAT / GST', label: 'VAT', rate: 0, rules: [] },
}

const CURRENCY_SYSTEM: Record<string, string> = { GBP: 'UK', AED: 'UAE', SGD: 'SG', AUD: 'AU', CAD: 'CA', NZD: 'NZ', EUR: 'EU', USD: 'US' }

// Standard rate by country. Europe is from the Tax Foundation list; the rest is marked unchecked.
const COUNTRIES: Record<string, { rate: number; checked: boolean; name?: string }> = {
  austria: { rate: 20, checked: true }, belgium: { rate: 21, checked: true }, bulgaria: { rate: 20, checked: true },
  croatia: { rate: 25, checked: true }, cyprus: { rate: 19, checked: true }, 'czech republic': { rate: 21, checked: true },
  czechia: { rate: 21, checked: true }, denmark: { rate: 25, checked: true }, estonia: { rate: 24, checked: true },
  finland: { rate: 25.5, checked: true }, france: { rate: 20, checked: true }, germany: { rate: 19, checked: true },
  greece: { rate: 24, checked: true }, hungary: { rate: 27, checked: true }, iceland: { rate: 24, checked: true },
  ireland: { rate: 23, checked: true }, italy: { rate: 22, checked: true }, latvia: { rate: 21, checked: true },
  lithuania: { rate: 21, checked: true }, luxembourg: { rate: 17, checked: true }, malta: { rate: 18, checked: true },
  netherlands: { rate: 21, checked: true }, norway: { rate: 25, checked: true }, poland: { rate: 23, checked: true },
  portugal: { rate: 23, checked: true }, romania: { rate: 21, checked: true }, slovakia: { rate: 23, checked: true },
  slovenia: { rate: 22, checked: true }, spain: { rate: 21, checked: true }, sweden: { rate: 25, checked: true },
  switzerland: { rate: 8.1, checked: true }, turkey: { rate: 20, checked: true }, ukraine: { rate: 20, checked: true },
  // checked against official pages
  'united kingdom': { rate: 20, checked: true }, uk: { rate: 20, checked: true }, england: { rate: 20, checked: true },
  scotland: { rate: 20, checked: true }, wales: { rate: 20, checked: true },
  'united arab emirates': { rate: 5, checked: true }, uae: { rate: 5, checked: true }, dubai: { rate: 5, checked: true }, 'abu dhabi': { rate: 5, checked: true },
  singapore: { rate: 9, checked: true }, australia: { rate: 10, checked: true }, canada: { rate: 5, checked: true },
  'new zealand': { rate: 15, checked: true },
  // general knowledge, not re-checked: the owner is asked to confirm
  'saudi arabia': { rate: 15, checked: false }, oman: { rate: 5, checked: false }, bahrain: { rate: 10, checked: false },
  israel: { rate: 18, checked: false }, japan: { rate: 10, checked: false }, 'south korea': { rate: 10, checked: false },
  china: { rate: 13, checked: false }, thailand: { rate: 7, checked: false }, philippines: { rate: 12, checked: false },
  indonesia: { rate: 11, checked: false }, vietnam: { rate: 10, checked: false }, pakistan: { rate: 18, checked: false },
  bangladesh: { rate: 15, checked: false }, 'sri lanka': { rate: 18, checked: false }, nepal: { rate: 13, checked: false },
  'south africa': { rate: 15, checked: false }, kenya: { rate: 16, checked: false }, nigeria: { rate: 7.5, checked: false },
  egypt: { rate: 14, checked: false }, mexico: { rate: 16, checked: false },
}

// US state base sales tax (state part only; counties and cities usually add more). Not re-checked.
const US_STATES: Record<string, number> = {
  alabama: 4, alaska: 0, arizona: 5.6, arkansas: 6.5, california: 7.25, colorado: 2.9, connecticut: 6.35, delaware: 0,
  florida: 6, georgia: 4, hawaii: 4, idaho: 6, illinois: 6.25, indiana: 7, iowa: 6, kansas: 6.5, kentucky: 6, louisiana: 5,
  maine: 5.5, maryland: 6, massachusetts: 6.25, michigan: 6, minnesota: 6.875, mississippi: 7, missouri: 4.225, montana: 0,
  nebraska: 5.5, nevada: 6.85, 'new hampshire': 0, 'new jersey': 6.625, 'new mexico': 4.875, 'new york': 4, 'north carolina': 4.75,
  'north dakota': 5, ohio: 5.75, oklahoma: 4.5, oregon: 0, pennsylvania: 6, 'rhode island': 7, 'south carolina': 6, 'south dakota': 4.2,
  tennessee: 7, texas: 6.25, utah: 6.1, vermont: 6, virginia: 5.3, washington: 6.5, 'west virginia': 6, wisconsin: 5, wyoming: 4,
}

// Canadian provinces: GST plus provincial tax, as one rate on the invoice.
const CA_PROVINCES: Record<string, { rate: number; note: string }> = {
  alberta: { rate: 5, note: 'GST only' }, 'british columbia': { rate: 12, note: 'GST 5% + PST 7%' },
  manitoba: { rate: 12, note: 'GST 5% + PST 7%' }, 'new brunswick': { rate: 15, note: 'HST 15%' },
  'newfoundland and labrador': { rate: 15, note: 'HST 15%' }, newfoundland: { rate: 15, note: 'HST 15%' },
  'nova scotia': { rate: 14, note: 'HST 14%' }, ontario: { rate: 13, note: 'HST 13%' },
  'prince edward island': { rate: 15, note: 'HST 15%' }, quebec: { rate: 14.975, note: 'GST 5% + QST 9.975%' },
  saskatchewan: { rate: 11, note: 'GST 5% + PST 6%' }, yukon: { rate: 5, note: 'GST only' },
  'northwest territories': { rate: 5, note: 'GST only' }, nunavut: { rate: 5, note: 'GST only' },
}

export const COUNTRY_CURRENCY: Record<string, string> = {
  uk: 'GBP', 'united kingdom': 'GBP', england: 'GBP', scotland: 'GBP', wales: 'GBP',
  uae: 'AED', 'united arab emirates': 'AED', dubai: 'AED', 'abu dhabi': 'AED',
  singapore: 'SGD', australia: 'AUD', canada: 'CAD', 'new zealand': 'NZD',
  us: 'USD', usa: 'USD', 'united states': 'USD', america: 'USD',
  germany: 'EUR', france: 'EUR', italy: 'EUR', spain: 'EUR', netherlands: 'EUR', ireland: 'EUR', belgium: 'EUR', austria: 'EUR', portugal: 'EUR',
}

const lower = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
const num = (v: unknown) => {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const matches = (re: RegExp | RegExp[], name: string) => (Array.isArray(re) ? re.every(r => r.test(name)) : re.test(name))

function systemFor(currency: string, country: string): string | null {
  if (country) {
    if (['india', 'bharat'].includes(country)) return 'INDIA'
    if (['united kingdom', 'uk', 'england', 'scotland', 'wales', 'northern ireland'].includes(country)) return 'UK'
    if (['united arab emirates', 'uae', 'dubai', 'abu dhabi', 'sharjah'].includes(country)) return 'UAE'
    if (country === 'singapore') return 'SG'
    if (country === 'australia') return 'AU'
    if (country === 'canada') return 'CA'
    if (country === 'new zealand') return 'NZ'
    if (['united states', 'usa', 'us', 'america', 'united states of america'].includes(country)) return 'US'
    if (COUNTRIES[country]?.checked && COUNTRIES[country].rate > 0 && ['EUR'].includes(currency)) return 'EU'
    if (COUNTRIES[country]) return COUNTRIES[country].checked && !CURRENCY_SYSTEM[currency] ? 'EU' : 'OTHER'
    return CURRENCY_SYSTEM[currency] || null
  }
  if (currency === 'INR' || !currency) return 'INDIA'
  return CURRENCY_SYSTEM[currency] || null
}

export interface TaxSuggestion {
  rate: number
  system: string
  label: string
  note: string
}

/**
 * Works out the tax rate for an invoice made by chat, from the country or currency, the state or province, and the items sold.
 * Returns null when nothing is known, so the normal default stays. Never overrides a rate the owner named.
 */
export function suggestTax(rec: Record<string, any>): TaxSuggestion | null {
  if (rec['Tax Rate'] !== undefined && String(rec['Tax Rate']).trim() !== '') return null
  if (rec['Tax Amount'] !== undefined && String(rec['Tax Amount']).trim() !== '') return null

  const currency = String(rec['Currency'] ?? '').trim().toUpperCase()
  const country = lower(rec['Country'])
  const sysId = systemFor(currency, country)
  if (!sysId) return null

  if (sysId === 'INDIA') {
    const g = suggestInvoiceRate({ ...rec, Currency: currency === 'INR' ? '' : currency })
    return g ? { rate: g.rate, system: 'GST (India)', label: 'GST', note: g.note } : null
  }

  const sys = SYSTEMS[sysId]
  const place = lower(rec['State'] ?? rec['Province'])
  const notes: string[] = []
  let base = sys.rate
  let name = sys.name
  let baseWhy = ''

  if (sysId === 'US') {
    const st = US_STATES[place]
    if (st !== undefined) { base = st; baseWhy = `${rec['State'] ?? rec['Province']} state sales tax is ${st}% (city or county tax may add more, so please check)` }
    else notes.push('Sales tax in the US depends on the state, and sometimes the city. I used no tax. Tell me the customer\'s state and I will use its rate.')
  } else if (sysId === 'CA') {
    const p = CA_PROVINCES[place]
    if (p) { base = p.rate; name = `${p.note} (Canada)`; baseWhy = `in ${rec['Province'] ?? rec['State']} it is ${p.note}` }
    else notes.push('I used the 5% federal GST. Some provinces add HST or provincial tax (Ontario 13%, BC 12%, Quebec 14.975%). Tell me the province and I will use it.')
  } else if (sysId === 'EU' || sysId === 'OTHER') {
    const c = COUNTRIES[country]
    if (c) {
      base = c.rate
      baseWhy = `the standard VAT rate in ${rec['Country']} is ${c.rate}%`
      if (!c.checked) notes.push(`I am not fully sure of ${rec['Country']}'s current rate: please check ${c.rate}% and tell me if it is different.`)
      if (sysId === 'EU') notes.push('Food, books, medicines and some other things can have a lower VAT rate in your country. Tell me if one of these items should.')
    } else if (sysId === 'EU') {
      notes.push('VAT is different in each European country (Germany 19%, France 20%, Italy 22%, Spain 21%). I used 20%. Tell me the customer\'s country and I will use its rate.')
    } else return null
  }

  // What was sold can change the rate (zero-rated food, exempt services, and so on).
  const lines = parseLineItems(rec['Line Items'])
  const amount = num(rec['Amount'])
  const totalQty = lines.reduce((s, l) => s + (l.qty > 0 ? l.qty : 1), 0)
  let matched = 0
  let tax = 0
  let value = 0
  const used = new Map<number, string>()
  const unsure: string[] = []
  for (const l of lines) {
    const qty = l.qty > 0 ? l.qty : 1
    let price = l.price
    if (!(price > 0) && lines.length === 1 && amount > 0) price = amount / totalQty
    const rule = sys.rules.find(r => matches(r.re, l.name))
    const rate = rule ? (rule.rate === 'base' ? base : rule.rate) : base
    if (rule) {
      matched++
      if (!used.has(rate)) used.set(rate, rule.label)
      if (rule.confirm && !unsure.includes(l.name)) unsure.push(l.name)
    } else if (!used.has(base)) used.set(base, `other items are ${base}%`)
    const v = price > 0 ? qty * price : 0
    value += v
    tax += (v * rate) / 100
  }

  let rate = base
  if (matched > 0) {
    if (used.size === 1) rate = Array.from(used.keys())[0]
    else if (value > 0) rate = Math.round((tax / value) * 10000) / 100
    const why = Array.from(used.values()).join('; ')
    const rateText = used.size === 1 ? `${rate}%` : `about ${rate}% in all (mixed rates)`
    notes.unshift(`I used ${sys.label} ${rateText}: ${why}.`)
    if (unsure.length) notes.push(`I am not fully sure about ${unsure.slice(0, 3).join(', ')}: please check the rate and tell me if it should be different.`)
  } else if (baseWhy) {
    notes.unshift(`I used ${rate}% because ${baseWhy}.`)
  }

  if (notes.length === 0) notes.push(`I used the standard ${sys.label} rate of ${rate}%.`)
  notes.push('Say a different rate if yours is not that, "including tax" if the amount you gave is the final price, or "no tax" for none.')
  return { rate, system: name, label: sys.label, note: notes.join(' ') }
}

/** A short guide to every market's tax, for the question-answering assistant. */
export const WORLD_TAX_GUIDE = `TAX IN OTHER COUNTRIES (standard rates; tell the owner to confirm with an accountant for their case):
- UK: VAT 20%. Most food, children's clothes and shoes, books, newspapers and prescription medicines 0%; home energy and child car seats 5%; insurance, finance, education and health exempt.
- UAE: VAT 5%. Exports and international transport 0%; some healthcare and education 0%; first sale of homes 0%; residential rent, local passenger transport and some financial services exempt. Basic food is NOT exempt.
- Singapore: GST 9% (since 2024). Exports and international services 0%; financial services, residential property and investment gold, silver and platinum exempt. Food is taxed.
- Australia: GST 10%. Basic food, most health and education, childcare and exports are GST-free; sweets, snacks, soft drinks and restaurant food are taxed; financial supplies and residential rent carry no GST.
- Canada: GST 5%, plus provincial tax: Ontario 13% HST, BC 12% (GST+PST 7%), Manitoba 12%, Saskatchewan 11%, Quebec 14.975% (GST+QST 9.975%), Nova Scotia 14% HST, New Brunswick, Newfoundland and PEI 15% HST, Alberta and the territories 5%. Basic groceries and prescription drugs are zero-rated.
- New Zealand: GST 15% on almost everything, food included; exports 0%; financial services and residential rent exempt.
- USA: no federal sales tax. Each state sets its own (about 0% to 7.25%) and cities or counties add more. Alaska, Delaware, Montana, New Hampshire and Oregon have no state sales tax. Groceries and prescriptions are exempt in most states; clothing is exempt in a few (for example Pennsylvania, New Jersey, Minnesota); most services are not taxed. Always ask the state.
- Europe standard VAT: Germany 19, France 20, Italy 22, Spain 21, Netherlands 21, Belgium 21, Austria 20, Ireland 23, Portugal 23, Poland 23, Sweden 25, Denmark 25, Finland 25.5, Norway 25, Greece 24, Switzerland 8.1. Reduced rates for food, books and medicines differ by country.
- Other (less certain): Saudi Arabia 15, Japan 10, South Korea 10, South Africa 15, Mexico 16, Pakistan 18, Bangladesh 15, Sri Lanka 18, Nepal 13, Kenya 16, Nigeria 7.5, Egypt 14, Thailand 7, Philippines 12, Indonesia 11.
- Selling abroad (exports) is usually 0% and buying has input tax that can be claimed back, but the rules differ by country: ask the owner to confirm with an accountant.`

/** A very short brief for the recording agent (the code works out the rate, so the agent only needs to name where the customer is). */
export const TAX_BRIEF = `TAX: the system picks the tax rate by country, state or province and the items sold, so do not guess rates. When the owner names the customer's country, state or province ("invoice Klaus in Germany", "Texas customer", "Ontario client"), put "Country" and, if given, "State" on the Invoices record. Only put "Tax Rate" when the owner states one. India GST: clothes and shoes up to Rs 2,500 each are 5%, above 18%; phones, laptops and TVs 18%; most services 18%. GST on sales is collected from customers; GST on purchases (shown on supplier bills) is claimed back.`
