// Money is stored everywhere as an integer number of "satang" (1/100 of a baht)
// to avoid floating point drift. We only divide by 100 for display.

const DEFAULT_CURRENCY = 'THB'

// Currencies offered in the primary-currency picker (Settings). Any ISO 4217
// code works with Intl; this is just the curated shortlist.
export const CURRENCIES = ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD', 'CNY']

/**
 * Format an integer minor-unit amount (satang / cents) into a money string.
 * Uses `narrowSymbol` so any currency shows its short symbol (฿, $, €, ¥, £…)
 * regardless of locale.
 * @param {number} minor integer amount in minor units (1/100)
 * @param {string} currency ISO currency code, default THB
 * @returns {string} e.g. "฿1,234.50"
 */
export function formatMoney(minor, currency = DEFAULT_CURRENCY) {
  const value = (minor || 0) / 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    // Unknown currency code — fall back to a plain number + code.
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }
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
