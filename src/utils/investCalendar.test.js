import { describe, it, expect } from 'vitest'
import { snapshotValue, dailyReturns, monthChange, earliestDate } from './investCalendar'

const snaps = {
  '2026-11-02': { total: 10000, byPortfolio: { a: 6000, b: 4000 } },
  '2026-11-03': { total: 10500, byPortfolio: { a: 6300, b: 4200 } }, // +5%
  '2026-11-04': { total: 10290, byPortfolio: { a: 6300 } },          // total -2%
  '2026-11-05': { total: 11319, byPortfolio: { a: 6930, b: 4389 } }, // +10%
}

describe('snapshotValue', () => {
  it('reads total and per-portfolio values', () => {
    expect(snapshotValue(snaps['2026-11-02'], 'total')).toBe(10000)
    expect(snapshotValue(snaps['2026-11-02'], 'a')).toBe(6000)
    expect(snapshotValue(snaps['2026-11-04'], 'b')).toBeNull()
    expect(snapshotValue(undefined, 'total')).toBeNull()
  })
})

describe('dailyReturns', () => {
  it('computes % vs the previous valued day for total', () => {
    const r = dailyReturns(snaps, 'total')
    expect(r['2026-11-02']).toBeUndefined() // first day has no baseline
    expect(r['2026-11-03']).toBeCloseTo(5, 5)
    expect(r['2026-11-04']).toBeCloseTo(-2, 5)
    expect(r['2026-11-05']).toBeCloseTo(10, 5)
  })

  it('skips gaps for a scope and compares to the last valued day', () => {
    // Portfolio b has no value on 11-04, so 11-05 compares to 11-03: 4200 -> 4389 = +4.5%
    const r = dailyReturns(snaps, 'b')
    expect(r['2026-11-04']).toBeUndefined()
    expect(r['2026-11-05']).toBeCloseTo(4.5, 5)
  })
})

describe('monthChange', () => {
  it('measures first to last valued day of the month', () => {
    // total: 10000 -> 11319 = +13.19%
    expect(monthChange(snaps, 'total', '2026-11')).toBeCloseTo(13.19, 2)
  })
  it('returns null when the month has no data', () => {
    expect(monthChange(snaps, 'total', '2026-10')).toBeNull()
  })
})

describe('earliestDate', () => {
  it('finds the first valued day for a scope', () => {
    expect(earliestDate(snaps, 'total')).toBe('2026-11-02')
    expect(earliestDate(snaps, 'b')).toBe('2026-11-02')
    expect(earliestDate({}, 'total')).toBeNull()
  })
})
