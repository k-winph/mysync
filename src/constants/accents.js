// Accent-color presets. Each holds the five brand shades as space-separated RGB
// channels (what Tailwind's `rgb(var(--brand-x) / <alpha>)` expects). Applying an
// accent = writing these onto <html> as CSS variables (see applyAccent).
export const ACCENTS = [
  { id: 'indigo', label: 'Indigo', swatch: '#4f46e5',
    shades: { 50: '238 242 255', 100: '224 231 255', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202' } },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed',
    shades: { 50: '245 243 255', 100: '237 233 254', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217' } },
  { id: 'sky', label: 'Sky', swatch: '#0284c7',
    shades: { 50: '240 249 255', 100: '224 242 254', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161' } },
  { id: 'emerald', label: 'Emerald', swatch: '#059669',
    shades: { 50: '236 253 245', 100: '209 250 229', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87' } },
  { id: 'rose', label: 'Rose', swatch: '#e11d48',
    shades: { 50: '255 241 242', 100: '255 228 230', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60' } },
  { id: 'amber', label: 'Amber', swatch: '#d97706',
    shades: { 50: '255 251 235', 100: '254 243 199', 500: '245 158 11', 600: '217 119 6', 700: '180 83 9' } },
]

export const DEFAULT_ACCENT = 'indigo'

// Write the chosen accent's shades onto <html> as --brand-* variables.
export function applyAccent(id) {
  const accent = ACCENTS.find((a) => a.id === id) || ACCENTS.find((a) => a.id === DEFAULT_ACCENT)
  const root = document.documentElement
  for (const [shade, rgb] of Object.entries(accent.shades)) {
    root.style.setProperty(`--brand-${shade}`, rgb)
  }
}
