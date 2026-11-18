// Palette + typography for the shareable canvas cards (month summary, bill
// split). Pure/data-only so it can be unit-tested without a canvas. Keyed by the
// UI theme id (see constants/themes.js) and light/dark mode.
//
// The 'default' theme returns the ORIGINAL hard-coded colors exactly, so existing
// share images render byte-for-byte unchanged. The 'pixel' theme repaints the
// card to match the in-app Pixel look: cream-paper / deep-plum palette, the
// Silkscreen display font, and square corners with a chunky outline (the canvas
// code reads `pixel`/`border` to switch shape + shadow). Accent stays independent
// of the theme, so the caller's accent color is layered on top either way.

export const SHARE_SANS =
  '-apple-system, system-ui, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif'
// Silkscreen first (Latin glyphs → pixel); the sans stack after it keeps Thai and
// any missing glyphs legible via per-glyph fallback.
export const SHARE_PIXEL_FONT =
  '"Silkscreen", -apple-system, system-ui, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif'

// Return the drawing palette for a share card.
//   uiTheme: 'default' | 'pixel' (unknown falls back to 'default')
//   dark:    boolean (dark mode)
// Fields:
//   pixel   – true for the Pixel theme (square corners + hard outline/shadow)
//   font    – font stack for all text
//   ink/muted/green/red – text colors
//   cardBg  – the floating card fill
//   panelBg – subtle inset panels (stocks block, charges block)
//   track   – progress-bar background
//   divider – thin separator lines
//   border  – outline color (Pixel only; null for the default soft-shadow card)
//   bg0/bg1 – full-bleed background gradient stops; null means "use the accent
//             gradient" (default theme keeps its accent-tinted background)
export function shareTheme(uiTheme, dark) {
  if (uiTheme === 'pixel') {
    return dark
      ? {
          pixel: true,
          font: SHARE_PIXEL_FONT,
          ink: '#f3ecff',
          muted: '#9b8fb5',
          green: '#4ade80',
          red: '#f87171',
          cardBg: '#2a2036',
          panelBg: '#352a44',
          track: 'rgba(255,255,255,0.10)',
          divider: 'rgba(255,255,255,0.10)',
          border: '#0f0a18',
          bg0: '#1c1526',
          bg1: '#120d1a',
        }
      : {
          pixel: true,
          font: SHARE_PIXEL_FONT,
          ink: '#241a2e',
          muted: '#7a6e86',
          green: '#2f9e44',
          red: '#e03131',
          cardBg: '#fffdf6',
          panelBg: '#e9e1cf',
          track: '#ddd3bb',
          divider: '#d6ccb6',
          border: '#241a2e',
          bg0: '#efe6d2',
          bg1: '#ddd0b0',
        }
  }
  // 'default' theme — exact original values (share output unchanged).
  return dark
    ? {
        pixel: false,
        font: SHARE_SANS,
        ink: '#f1f5f9',
        muted: '#94a3b8',
        green: '#34d399',
        red: '#f87171',
        cardBg: '#161a23',
        panelBg: 'rgba(255,255,255,0.05)',
        track: 'rgba(255,255,255,0.08)',
        divider: 'rgba(255,255,255,0.09)',
        border: null,
        bg0: null,
        bg1: null,
      }
    : {
        pixel: false,
        font: SHARE_SANS,
        ink: '#0f172a',
        muted: '#64748b',
        green: '#059669',
        red: '#dc2626',
        cardBg: '#ffffff',
        panelBg: '#f6f7fb',
        track: '#eef1f5',
        divider: '#e7e9f0',
        border: null,
        bg0: null,
        bg1: null,
      }
}

// Ensure the Silkscreen faces (400 + 700) are loaded before drawing to a canvas,
// so Pixel-theme text renders in the pixel font instead of a fallback. No-op for
// non-pixel themes and in environments without the Font Loading API.
export async function ensureShareFont(pal) {
  if (!pal.pixel || typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all([
      document.fonts.load("400 32px 'Silkscreen'"),
      document.fonts.load("700 32px 'Silkscreen'"),
    ])
  } catch {
    /* fallback font is acceptable */
  }
}
