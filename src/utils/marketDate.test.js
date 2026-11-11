import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import { marketDate } from './marketDate'

describe('marketDate (us)', () => {
  it('maps a Thai-morning instant back to the US trading day', () => {
    // 2026-11-11 00:00 UTC = 2026-11-10 19:00 America/New_York (EST, UTC-5).
    // i.e. ~7am Thai on the 11th → the US close belongs to the 10th.
    expect(marketDate(new Date('2026-11-11T00:00:00Z'), 'us')).toBe('2026-11-10')
  })

  it('keeps a US-daytime instant on the same US date', () => {
    // 2026-01-15 18:00 UTC = 13:00 EST on the 15th.
    expect(marketDate(new Date('2026-01-15T18:00:00Z'), 'us')).toBe('2026-01-15')
  })

  it('accounts for daylight-saving (same UTC wall clock, different US date)', () => {
    // 04:30 UTC: EST (UTC-5) → 23:30 previous day; EDT (UTC-4) → 00:30 same day.
    expect(marketDate(new Date('2026-11-11T04:30:00Z'), 'us')).toBe('2026-11-10') // EST
    expect(marketDate(new Date('2026-07-11T04:30:00Z'), 'us')).toBe('2026-07-11') // EDT
  })
})

describe('marketDate (local)', () => {
  it('passes through to the device-local date', () => {
    const d = new Date('2026-07-11T04:30:00Z')
    expect(marketDate(d, 'local')).toBe(dayjs(d).format('YYYY-MM-DD'))
  })

  it('an unknown market falls back to local', () => {
    const d = new Date('2026-07-11T04:30:00Z')
    expect(marketDate(d, 'bogus')).toBe(dayjs(d).format('YYYY-MM-DD'))
  })

  it('an undefined market defaults to US (so existing users without the setting get it)', () => {
    // Existing stores have no `investMarket`, so the store passes undefined —
    // the default parameter must resolve to the US date, not local.
    expect(marketDate(new Date('2026-11-11T00:00:00Z'), undefined)).toBe('2026-11-10')
  })
})
