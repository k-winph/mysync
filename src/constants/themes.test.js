import { describe, it, expect } from 'vitest'
import { THEMES, DEFAULT_THEME, isTheme } from './themes'

describe('themes', () => {
  it('includes the default and pixel themes with required fields', () => {
    const ids = THEMES.map((t) => t.id)
    expect(ids).toContain('default')
    expect(ids).toContain('pixel')
    for (const t of THEMES) {
      expect(typeof t.id).toBe('string')
      expect(typeof t.label).toBe('string')
      expect(typeof t.swatch).toBe('string')
    }
  })

  it('DEFAULT_THEME is a real theme', () => {
    expect(isTheme(DEFAULT_THEME)).toBe(true)
  })

  it('isTheme validates ids (unknown / undefined -> false)', () => {
    expect(isTheme('pixel')).toBe(true)
    expect(isTheme('bogus')).toBe(false)
    expect(isTheme(undefined)).toBe(false)
  })
})
