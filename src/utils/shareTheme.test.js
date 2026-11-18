import { describe, it, expect } from 'vitest'
import { shareTheme, SHARE_SANS, SHARE_PIXEL_FONT } from './shareTheme'

describe('shareTheme', () => {
  it('default theme keeps the original sans font and non-pixel flag', () => {
    const light = shareTheme('default', false)
    const dark = shareTheme('default', true)
    expect(light.pixel).toBe(false)
    expect(dark.pixel).toBe(false)
    expect(light.font).toBe(SHARE_SANS)
    expect(light.border).toBeNull()
    // Background uses the accent gradient (null bg stops) for the default theme.
    expect(light.bg0).toBeNull()
    expect(dark.bg1).toBeNull()
  })

  it('default theme reproduces the exact legacy colors', () => {
    const light = shareTheme('default', false)
    expect(light.ink).toBe('#0f172a')
    expect(light.muted).toBe('#64748b')
    expect(light.cardBg).toBe('#ffffff')
    expect(light.green).toBe('#059669')
    expect(light.red).toBe('#dc2626')
    const dark = shareTheme('default', true)
    expect(dark.ink).toBe('#f1f5f9')
    expect(dark.cardBg).toBe('#161a23')
  })

  it('pixel theme uses the Silkscreen font, a border, and its own background', () => {
    const light = shareTheme('pixel', false)
    const dark = shareTheme('pixel', true)
    expect(light.pixel).toBe(true)
    expect(dark.pixel).toBe(true)
    expect(light.font).toBe(SHARE_PIXEL_FONT)
    expect(light.font.startsWith('"Silkscreen"')).toBe(true)
    expect(light.border).toBe('#241a2e')
    expect(dark.border).toBe('#0f0a18')
    // Pixel theme paints its own background (not the accent gradient).
    expect(light.bg0).toBe('#efe6d2')
    expect(dark.bg0).toBe('#1c1526')
  })

  it('unknown theme id falls back to the default palette', () => {
    expect(shareTheme('nope', false)).toEqual(shareTheme('default', false))
    expect(shareTheme(undefined, true)).toEqual(shareTheme('default', true))
  })
})
