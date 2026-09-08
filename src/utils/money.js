// Money is stored everywhere as an integer number of "satang" (1/100 of a baht)
// to avoid floating point drift. We only divide by 100 for display.

const DEFAULT_CURRENCY = 'THB'

// Map currency -> Intl locale + code. Extend as more currencies are added (phase 3).
const CURRENCY_META = {
  THB: { locale: 'th-TH', code: 'THB' },
  USD: { locale: 'en-US', code: 'USD' },
}

/**
 * Format an integer satang amount into a human-readable money string.
 * @param {number} satang integer amount in satang
 * @param {string} currency currency code, default THB
 * @returns {string} e.g. "฿1,234.50"
 */
export function formatMoney(satang, currency = DEFAULT_CURRENCY) {
  const meta = CURRENCY_META[currency] || CURRENCY_META[DEFAULT_CURRENCY]
  const baht = (satang || 0) / 100
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency: meta.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(baht)
}

/**
 * Parse user text input into an integer satang amount.
 * Accepts "1,234.5", "1234", "฿50" etc. Returns 0 for empty/invalid.
 * @param {string|number} text
 * @returns {number} integer satang
 */
export function parseMoney(text) {
  if (typeof text === 'number') return Math.round(text * 100)
  if (!text) return 0
  // Strip everything except digits, minus and dot.
  const cleaned = String(text).replace(/[^0-9.-]/g, '')
  const value = parseFloat(cleaned)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

/**
 * Convert integer satang -> a plain decimal string for editing in an input,
 * without the currency symbol. e.g. 12350 -> "123.50"
 */
export function satangToInput(satang) {
  if (!satang) return ''
  return (satang / 100).toFixed(2)
}
