// UI themes — each repaints the whole app by overriding the semantic color
// tokens (--c-*, see index.css). Light/dark values for every theme live in CSS
// keyed by `[data-theme="<id>"]`; applying a theme is just setting that
// attribute on <html>. Accent (--brand-*) stays independent of the theme.
//
// Adding a theme later = (1) add an entry here, (2) add its two token blocks in
// index.css. Shape/typography tokens (radius, pixel font, hard shadows) are
// layered on per-theme in a later step.
export const THEMES = [
  { id: 'default', label: 'Default', swatch: '#6c5ce7', dark: true },
  { id: 'pixel', label: 'Pixel', swatch: '#efe6d2', dark: true },
]

export const DEFAULT_THEME = 'default'

export function isTheme(id) {
  return THEMES.some((t) => t.id === id)
}

// Apply a theme by setting (or clearing) the data-theme attribute on <html>.
// 'default' clears the attribute so the base :root / .dark tokens apply.
export function applyTheme(id) {
  const theme = isTheme(id) ? id : DEFAULT_THEME
  const root = document.documentElement
  if (theme === DEFAULT_THEME) root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}
