import type { NominaResult } from '../types'

const round2 = (value: number): number => Math.round(value * 100) / 100

export const calculateNomina = (salary: number): NominaResult => {
  const safeSalary = Number.isFinite(salary) && salary > 0 ? salary : 0
  const afp = safeSalary * 0.0287
  const sfs = safeSalary * 0.0304
  const taxable = Math.max(safeSalary - afp - sfs, 0)

  const annualTaxable = taxable * 12
  let annualIsr = 0

  if (annualTaxable > 867123) {
    annualIsr = 79776 + (annualTaxable - 867123) * 0.25
  } else if (annualTaxable > 624329) {
    annualIsr = 31216 + (annualTaxable - 624329) * 0.2
  } else if (annualTaxable > 416220) {
    annualIsr = (annualTaxable - 416220) * 0.15
  }

  const isr = annualIsr / 12
  const totalDeductions = afp + sfs + isr
  const netSalary = safeSalary - totalDeductions

  return {
    salary: round2(safeSalary),
    afp: round2(afp),
    sfs: round2(sfs),
    taxable: round2(taxable),
    isr: round2(isr),
    totalDeductions: round2(totalDeductions),
    netSalary: round2(netSalary)
  }
}

export const formatRD = (amount: number): string =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

