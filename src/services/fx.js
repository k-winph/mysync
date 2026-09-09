// Foreign-exchange rates for converting holdings into the primary currency.
// Uses frankfurter.app — free, no API key, CORS-enabled. Rates are ECB
// reference rates (updated daily) — fine for a personal net-worth view.

/**
 * Fetch conversion rates FROM `base` TO each of `symbols`.
 * @returns {Promise<Record<string, number>>} e.g. { USD: 0.0274, EUR: 0.025 }
 *   meaning 1 <base> = 0.0274 USD. Empty object if nothing to fetch.
 */
export async function fetchRates(base, symbols) {
  const list = [...new Set(symbols)].filter((c) => c && c !== base)
  if (list.length === 0) return {}
  const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${list.join(',')}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('FX_HTTP_' + res.status)
  const data = await res.json()
  return data.rates || {}
}
