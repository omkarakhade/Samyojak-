// Indian payroll deductions: PF, ESI and an ESTIMATE of income tax (TDS) on salary.
// Rates are kept in one place and dated, so they are easy to update. Checked November 2026:
//  - PF: 12% of wages up to a Rs 15,000 monthly ceiling, for the employee and again for the employer.
//  - ESI: applies while gross pay is Rs 21,000 a month or less; 0.75% employee, 3.25% employer.
//  - TDS: new tax regime slabs, Rs 75,000 standard deduction, no tax up to Rs 12 lakh taxable, 4% cess.
// TDS here is a planning estimate (no other income, no exemptions), not a substitute for a CA.
// Each deduction is OFF unless the person's HR record says Yes in PF, ESI or TDS.

export const RATES = {
  asOf: '2026-11',
  pfCeiling: 15000,
  pfEmployee: 0.12,
  pfEmployer: 0.12,
  esiCeiling: 21000,
  esiEmployee: 0.0075,
  esiEmployer: 0.0325,
  standardDeduction: 75000,
  rebateLimit: 1200000,
  cess: 0.04,
  slabs: [
    { upTo: 400000, rate: 0 },
    { upTo: 800000, rate: 0.05 },
    { upTo: 1200000, rate: 0.1 },
    { upTo: 1600000, rate: 0.15 },
    { upTo: 2000000, rate: 0.2 },
    { upTo: 2400000, rate: 0.25 },
    { upTo: Infinity, rate: 0.3 },
  ],
}

const yes = (v: unknown) => /^(yes|y|true|on|applicable|1)$/i.test(String(v ?? '').trim())
const rupee = (n: number) => Math.round(n)

/** Yearly income tax (new regime) on a yearly gross salary, including cess. */
export function annualTax(grossYear: number): number {
  const taxable = Math.max(0, grossYear - RATES.standardDeduction)
  let tax = 0
  let prev = 0
  for (const s of RATES.slabs) {
    if (taxable > prev) tax += (Math.min(taxable, s.upTo) - prev) * s.rate
    prev = s.upTo
  }
  if (taxable <= RATES.rebateLimit) tax = 0
  else tax = Math.min(tax, taxable - RATES.rebateLimit) // marginal relief just above the limit
  return tax * (1 + RATES.cess)
}

export interface Deductions {
  pfEmployee: number
  pfEmployer: number
  esiEmployee: number
  esiEmployer: number
  tds: number
}

/**
 * `earned` is the pay for the month after absent days. `salary` is the full monthly salary:
 * ESI eligibility and the yearly tax are based on it, not on one month's cut pay.
 */
export function deductionsFor(person: Record<string, any>, earned: number, salary: number): Deductions {
  const out: Deductions = { pfEmployee: 0, pfEmployer: 0, esiEmployee: 0, esiEmployer: 0, tds: 0 }
  if (yes(person['PF'] ?? person['PF Applicable'])) {
    const wages = Math.min(earned, RATES.pfCeiling)
    out.pfEmployee = rupee(wages * RATES.pfEmployee)
    out.pfEmployer = rupee(wages * RATES.pfEmployer)
  }
  if (yes(person['ESI'] ?? person['ESI Applicable']) && salary <= RATES.esiCeiling) {
    out.esiEmployee = Math.ceil(earned * RATES.esiEmployee)
    out.esiEmployer = Math.ceil(earned * RATES.esiEmployer)
  }
  if (yes(person['TDS'] ?? person['TDS Applicable'])) {
    out.tds = rupee(annualTax(salary * 12) / 12)
  }
  return out
}
