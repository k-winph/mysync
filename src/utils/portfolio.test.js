import { describe, it, expect } from 'vitest'
import {
  holdingMetrics, totalsByCurrency, combineToPrimary, sumField, singleToPrimary,
} from './portfolio'

describe('holdingMetrics', () => {
  it('computes cost, value, gain and gain% from a cached price', () => {
    const m = holdingMetrics({ shares: 100, avgCost: 12000, lastPrice: 15000 })
    expect(m.cost).toBe(1200000)
    expect(m.value).toBe(1500000)
    expect(m.gain).toBe(300000)
    expect(m.gainPct).toBeCloseTo(25)
    expect(m.hasPrice).toBe(true)
  })
  it('prefers a fresh quote over the cached price', () => {
    const m = holdingMetrics(
      { shares: 100, avgCost: 12000, lastPrice: 15000 },
      { priceCents: 16000, changeCents: 1000, changePct: 6.67 }
    )
    expect(m.value).toBe(1600000)
    expect(m.gain).toBe(400000)
    expect(m.todayChange).toBe(100000)
  })
  it('returns nulls for value/gain when there is no price', () => {
    const m = holdingMetrics({ shares: 10, avgCost: 5000 })
    expect(m.hasPrice).toBe(false)
    expect(m.cost).toBe(50000)
    expect(m.value).toBeNull()
    expect(m.gain).toBeNull()
    expect(m.gainPct).toBeNull()
  })
})

describe('totalsByCurrency', () => {
  it('groups by currency and falls back to cost for unpriced holdings', () => {
    const groups = totalsByCurrency([
      { currency: 'THB', shares: 100, avgCost: 12000, lastPrice: 15000 }, // priced
      { currency: 'THB', shares: 10, avgCost: 5000 },                     // unpriced
    ])
    expect(groups).toHaveLength(1)
    const g = groups[0]
    expect(g.currency).toBe('THB')
    expect(g.cost).toBe(1250000)
    expect(g.value).toBe(1550000) // 1.5M priced + 50k cost fallback
    expect(g.gain).toBe(300000)   // only the priced holding
    expect(g.priced).toBe(1)
    expect(g.total).toBe(2)
    expect(g.gainPct).toBeCloseTo(24) // 300k / 1.25M
  })
  it('keeps currencies separate (never fakes FX)', () => {
    const groups = totalsByCurrency([
      { currency: 'THB', shares: 1, avgCost: 10000, lastPrice: 10000 },
      { currency: 'USD', shares: 1, avgCost: 20000, lastPrice: 20000 },
    ])
    expect(groups.map((g) => g.currency).sort()).toEqual(['THB', 'USD'])
  })
})

describe('combineToPrimary', () => {
  const groups = [
    { currency: 'THB', value: 1000000 },
    { currency: 'USD', value: 50000 },
  ]
  it('converts foreign groups into the primary currency', () => {
    // 1 USD = 35 THB -> convert(minor, from) = minor * 35 here
    const convert = (minor, from) => (from === 'USD' ? minor * 35 : minor)
    const r = combineToPrimary(groups, 'value', convert, 'THB')
    expect(r.primaryMinor).toBe(1000000 + 50000 * 35)
    expect(r.ok).toBe(true)
    expect(r.natives).toEqual([{ minor: 50000, currency: 'USD' }])
  })
  it('flags ok=false when a rate is missing', () => {
    const convert = (minor, from) => (from === 'USD' ? null : minor)
    const r = combineToPrimary(groups, 'value', convert, 'THB')
    expect(r.ok).toBe(false)
    expect(r.primaryMinor).toBe(1000000) // only the convertible part added
  })
})

describe('sumField & singleToPrimary', () => {
  it('sums a field across groups', () => {
    expect(sumField([{ gain: 100 }, { gain: 250 }, {}], 'gain')).toBe(350)
  })
  it('returns the amount unchanged when already in the primary currency', () => {
    const r = singleToPrimary(1000, 'THB', () => null, 'THB')
    expect(r.primaryMinor).toBe(1000)
    expect(r.ok).toBe(true)
  })
  it('falls back to the native amount when a rate is missing', () => {
    const r = singleToPrimary(1000, 'USD', () => null, 'THB')
    expect(r.primaryMinor).toBe(1000)
    expect(r.ok).toBe(false)
  })
})
