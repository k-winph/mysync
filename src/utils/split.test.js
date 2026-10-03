import { describe, it, expect } from 'vitest'
import { computeSplit, parsePct } from './split'

const A = { id: 'a' }, B = { id: 'b' }, C = { id: 'c' }

describe('parsePct', () => {
  it('reads a percent, ignoring stray characters', () => {
    expect(parsePct('10')).toBe(10)
    expect(parsePct('7.5%')).toBe(7.5)
  })
  it('is 0 for blank / invalid input', () => {
    expect(parsePct('')).toBe(0)
    expect(parsePct(undefined)).toBe(0)
    expect(parsePct('abc')).toBe(0)
    expect(parsePct('%')).toBe(0)
    expect(parsePct('.')).toBe(0)
  })
  it('strips non-digits, so a stray minus is ignored (no negative percents)', () => {
    expect(parsePct('-5')).toBe(5)
  })
})

describe('computeSplit', () => {
  it('splits each item equally among its members', () => {
    const r = computeSplit([A, B, C], [
      { price: '900', members: ['a', 'b', 'c'] }, // 300 each
      { price: '400', members: ['a', 'b'] },      // 200 each
    ], {})
    expect(r.subtotal).toBe(130000) // ฿1,300 in satang
    expect(r.grandTotal).toBe(130000) // no charges
    expect(Math.round(r.perPerson.a)).toBe(50000) // ฿500
    expect(Math.round(r.perPerson.b)).toBe(50000)
    expect(Math.round(r.perPerson.c)).toBe(30000) // ฿300
  })

  it('tracks the value of items with nobody selected', () => {
    const r = computeSplit([A], [{ price: '250', members: [] }], {})
    expect(r.unassigned).toBe(25000)
    expect(r.perPerson.a).toBeUndefined()
  })

  it('adds service + VAT (stacked) + tip and distributes them proportionally', () => {
    // subtotal 1,300 ; service 10% = 130 ; VAT 7% of (1,300+130)=1,430 -> 100.10
    const r = computeSplit([A, B, C], [
      { price: '900', members: ['a', 'b', 'c'] },
      { price: '400', members: ['a', 'b'] },
    ], { service: '10', vat: '7' })
    expect(r.serviceAmt).toBe(13000)   // ฿130
    expect(r.vatAmt).toBe(10010)       // ฿100.10
    expect(r.tipAmt).toBe(0)
    expect(r.grandTotal).toBe(153010)  // ฿1,530.10
    // each person's share scales by grand/subtotal
    expect(Math.round(r.perPerson.a)).toBe(58850) // ฿588.50
    expect(Math.round(r.perPerson.c)).toBe(35310) // ฿353.10
    // the per-person charged totals never exceed the grand total
    const sum = Math.round(r.perPerson.a) + Math.round(r.perPerson.b) + Math.round(r.perPerson.c)
    expect(Math.abs(sum - r.grandTotal)).toBeLessThanOrEqual(2) // rounding only
  })

  it('ignores zero/blank-priced items', () => {
    const r = computeSplit([A], [{ price: '', members: ['a'] }, { price: '0', members: ['a'] }], {})
    expect(r.subtotal).toBe(0)
    expect(r.grandTotal).toBe(0)
  })
})
