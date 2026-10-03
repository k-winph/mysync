import { describe, it, expect } from 'vitest'
import { formatMoney, parseMoney, satangToInput } from './money'

describe('formatMoney', () => {
  it('formats satang as baht with a narrow symbol', () => {
    expect(formatMoney(123450)).toBe('฿1,234.50')
  })
  it('always shows two decimals', () => {
    expect(formatMoney(100)).toBe('฿1.00')
    expect(formatMoney(0)).toBe('฿0.00')
  })
  it('handles negative amounts', () => {
    expect(formatMoney(-5000)).toBe('-฿50.00')
  })
  it('treats null/undefined as zero', () => {
    expect(formatMoney(null)).toBe('฿0.00')
    expect(formatMoney(undefined)).toBe('฿0.00')
  })
  it('respects other currencies', () => {
    expect(formatMoney(100, 'USD')).toBe('$1.00')
  })
  it('falls back to a plain number + code for a malformed currency code', () => {
    // A 2-letter code is not a valid ISO 4217 code, so Intl throws and we
    // fall back to "<amount> <code>".
    expect(formatMoney(100, 'ZZ')).toBe('1.00 ZZ')
  })
})

describe('parseMoney', () => {
  it('parses a formatted string into integer satang', () => {
    expect(parseMoney('1,234.5')).toBe(123450)
  })
  it('strips a currency symbol', () => {
    expect(parseMoney('฿50')).toBe(5000)
  })
  it('treats a whole number as baht', () => {
    expect(parseMoney('1234')).toBe(123400)
  })
  it('accepts a numeric input directly (as baht)', () => {
    expect(parseMoney(12.34)).toBe(1234)
  })
  it('returns 0 for empty or invalid text', () => {
    expect(parseMoney('')).toBe(0)
    expect(parseMoney('abc')).toBe(0)
    expect(parseMoney(null)).toBe(0)
  })
  it('rounds to the nearest satang (no float drift)', () => {
    expect(parseMoney('0.1')).toBe(10)
    expect(parseMoney('19.999')).toBe(2000)
  })
})

describe('satangToInput', () => {
  it('renders a plain decimal string for editing', () => {
    expect(satangToInput(12350)).toBe('123.50')
  })
  it('returns an empty string for a falsy amount', () => {
    expect(satangToInput(0)).toBe('')
    expect(satangToInput(undefined)).toBe('')
  })
  it('round-trips with parseMoney', () => {
    expect(parseMoney(satangToInput(99999))).toBe(99999)
  })
})
