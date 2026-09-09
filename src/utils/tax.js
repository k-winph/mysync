import {
  TAX_BRACKETS,
  PERSONAL_ALLOWANCE,
  EXPENSE_RATE,
  EXPENSE_CAP,
} from '../constants/taxBrackets'

// All figures here are in whole BAHT.

/** Standard expense deduction: 50% of income, capped at 100,000. */
export function expenseDeduction(income) {
  return Math.min(income * EXPENSE_RATE, EXPENSE_CAP)
}

/**
 * Compute Thai personal income tax from a full breakdown.
 * @param {object} p
 * @param {number} p.income       gross annual income (baht)
 * @param {number} p.extra        additional user deductions (baht)
 * @returns {{
 *   income:number, expense:number, personal:number, extra:number,
 *   deductions:number, taxable:number, tax:number, effectiveRate:number,
 *   breakdown: Array<{from:number,to:number,rate:number,taxable:number,tax:number}>
 * }}
 */
export function calcTax({ income = 0, extra = 0 }) {
  const expense = expenseDeduction(income)
  const deductions = PERSONAL_ALLOWANCE + expense + extra
  const taxable = Math.max(0, income - deductions)

  let remaining = taxable
  let prev = 0
  let tax = 0
  const breakdown = []

  for (const b of TAX_BRACKETS) {
    if (remaining <= 0) break
    const band = b.limit - prev // width of this bracket band
    const amountInBand = Math.min(remaining, band)
    const bandTax = amountInBand * b.rate
    if (amountInBand > 0 && b.rate > 0) {
      breakdown.push({
        from: prev,
        to: b.limit,
        rate: b.rate,
        taxable: amountInBand,
        tax: bandTax,
      })
    }
    tax += bandTax
    remaining -= amountInBand
    prev = b.limit
  }

  return {
    income,
    expense,
    personal: PERSONAL_ALLOWANCE,
    extra,
    deductions,
    taxable,
    tax: Math.round(tax),
    effectiveRate: income > 0 ? (tax / income) * 100 : 0,
    breakdown,
  }
}
