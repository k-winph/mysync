/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // toggle dark theme by adding `dark` class on <html>
  theme: {
    extend: {
      colors: {
        // Brand accent is driven by CSS variables (space-separated RGB channels)
        // so the user can switch the theme color at runtime. Defaults + presets
        // live in src/index.css and src/constants/accents.js.
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
        },
        // Semantic neutral tokens — also CSS-variable driven, so a whole UI
        // theme (default, pixel, …) can repaint the app's surfaces/text/borders
        // at runtime (see applyTheme + constants/themes.js). Default values
        // mirror the old slate palette per light/dark, so nothing changes look.
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',       // page background
        surface: 'rgb(var(--c-surface) / <alpha-value>)',     // cards / sheets
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)', // subtle fills / hovers
        'surface-3': 'rgb(var(--c-surface-3) / <alpha-value>)', // stronger fills
        'surface-4': 'rgb(var(--c-surface-4) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',             // primary text
        'ink-2': 'rgb(var(--c-ink-2) / <alpha-value>)',       // secondary text
        muted: 'rgb(var(--c-muted) / <alpha-value>)',         // muted text
        faint: 'rgb(var(--c-faint) / <alpha-value>)',         // faint text
        line: 'rgb(var(--c-line) / <alpha-value>)',           // default border
        'line-2': 'rgb(var(--c-line-2) / <alpha-value>)',     // subtle border / divide
        'line-3': 'rgb(var(--c-line-3) / <alpha-value>)',     // input border
        'line-strong': 'rgb(var(--c-line-strong) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
