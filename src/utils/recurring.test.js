import { describe, it, expect } from 'vitest'
import { collectDue } from './recurring'

describe('collectDue', () => {
  it('posts every monthly occurrence up to today and returns the next future date', () => {
    const { dates, nextDate } = collectDue('2026-09-01', 'monthly', '2026-11-07')
    expect(dates).toEqual(['2026-09-01', '2026-10-01', '2026-11-01'])
    expect(nextDate).toBe('2026-12-01')
  })

  it('returns no dates when the start is in the future', () => {
    const { dates, nextDate } = collectDue('2026-12-01', 'monthly', '2026-11-07')
    expect(dates).toEqual([])
    expect(nextDate).toBe('2026-12-01')
  })

  it('includes an occurrence that falls exactly on today', () => {
    const { dates, nextDate } = collectDue('2026-11-07', 'monthly', '2026-11-07')
    expect(dates).toEqual(['2026-11-07'])
    expect(nextDate).toBe('2026-12-07')
  })

  it('handles weekly frequency', () => {
    const { dates } = collectDue('2026-11-01', 'weekly', '2026-11-20')
    expect(dates).toEqual(['2026-11-01', '2026-11-08', '2026-11-15'])
  })

  it('handles yearly frequency', () => {
    const { dates, nextDate } = collectDue('2024-03-01', 'yearly', '2026-11-07')
    expect(dates).toEqual(['2024-03-01', '2025-03-01', '2026-03-01'])
    expect(nextDate).toBe('2027-03-01')
  })

  it('never loops forever on an unknown frequency (addPeriod returns same date)', () => {
    const { dates, nextDate } = collectDue('2026-01-01', 'none', '2026-11-07')
    expect(dates).toEqual(['2026-01-01'])
    expect(nextDate).toBe('2026-01-01')
  })

  it('respects the cap', () => {
    const { dates } = collectDue('2000-01-01', 'yearly', '2026-11-07', 5)
    expect(dates.length).toBe(5)
  })
})
