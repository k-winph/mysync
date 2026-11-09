import { describe, it, expect } from 'vitest'
import { autoSeasonType, resolveSeasonType } from './season'

const d = (month) => new Date(2026, month - 1, 15)

describe('autoSeasonType', () => {
  it('maps months to effects', () => {
    expect(autoSeasonType(d(1))).toBe('snow')
    expect(autoSeasonType(d(12))).toBe('snow')
    expect(autoSeasonType(d(2))).toBe('hearts')
    expect(autoSeasonType(d(3))).toBe('sakura')
    expect(autoSeasonType(d(4))).toBe('sakura')
    expect(autoSeasonType(d(5))).toBe('sakura')
    expect(autoSeasonType(d(7))).toBe('rain')
    expect(autoSeasonType(d(10))).toBe('rain')
    expect(autoSeasonType(d(11))).toBe('leaves')
  })
})

describe('resolveSeasonType', () => {
  it('off / falsy returns null', () => {
    expect(resolveSeasonType('off')).toBeNull()
    expect(resolveSeasonType(undefined)).toBeNull()
  })
  it('auto uses the month mapping', () => {
    expect(resolveSeasonType('auto', d(7))).toBe('rain')
  })
  it('an explicit valid type passes through; an invalid one is null', () => {
    expect(resolveSeasonType('snow', d(7))).toBe('snow')
    expect(resolveSeasonType('bogus', d(7))).toBeNull()
  })
})
