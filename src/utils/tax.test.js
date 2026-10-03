import { describe, it, expect } from 'vitest'
import { calcTax, expenseDeduction } from './tax'

describe('expenseDeduction', () => {
  it('is 50% of income below the cap', () => {
    expect(expenseDeduction(100000)).toBe(50000)
  })
  it('is capped at 100,000', () => {
    expect(expenseDeduction(500000)).toBe(100000)
    expect(expenseDeduction(10000000)).toBe(100000)
  })
})

describe('calcTax', () => {
  it('returns zero tax for zero income', () => {
    const r = calcTax({ income: 0 })
    expect(r.tax).toBe(0)
    expect(r.taxable).toBe(0)
    expect(r.effectiveRate).toBe(0)
  })

  it('leaves income within the allowances untaxed', () => {
    // 150k income -> expense 75k + personal 60k = 135k deductions -> taxable 15k,
    // which sits in the 0% band.
    const r = calcTax({ income: 150000 })
    expect(r.tax).toBe(0)
    expect(r.taxable).toBe(15000)
  })

  it('applies the progressive bands correctly', () => {
    // income 500k: expense cap 100k + personal 60k = 160k -> taxable 340k
    // 0-150k @0 = 0 ; 150-300k @5% = 7,500 ; 300-340k @10% = 4,000 -> 11,500
    const r = calcTax({ income: 500000 })
    expect(r.taxable).toBe(340000)
    expect(r.tax).toBe(11500)
    expect(r.effectiveRate).toBeCloseTo(2.3)
    // breakdown skips the 0% band, so two taxed bands remain
    expect(r.breakdown).toHaveLength(2)
    expect(r.breakdown[1]).toMatchObject({ to: 500000, rate: 0.1, taxable: 40000, tax: 4000 })
  })

  it('reaches the top 35% bracket on very high income', () => {
    const r = calcTax({ income: 6000000 })
    expect(r.taxable).toBe(5840000)
    expect(r.tax).toBe(1559000)
  })

  it('reduces tax when extra deductions are added', () => {
    const base = calcTax({ income: 500000 }).tax
    const withExtra = calcTax({ income: 500000, extra: 50000 }).tax
    expect(withExtra).toBeLessThan(base)
  })
})
