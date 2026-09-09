// Foreign-exchange rates for converting holdings into the primary currency.
// Free, no API key, CORS-enabled. We try several providers in order so a single
// outage/block doesn't disable conversion. All return rates expressed PER base
// (e.g. base THB → { USD: 0.0274 } meaning 1 THB = 0.0274 USD).

const PROVIDERS = [
  (base) => `https://api.frankfurter.dev/v1/latest?base=${base}`,
  (base) => `https://api.frankfurter.app/latest?from=${base}`,
  (base) => `https://open.er-api.com/v6/latest/${base}`,
]

/**
 * Fetch conversion rates FROM `base` to the needed `symbols`.
 * Returns all available rates (per base); callers pick what they need.
 * @returns {Promise<Record<string, number>>}
 */
export async function fetchRates(base, symbols) {
  const need = [...new Set(symbols)].filter((c) => c && c !== base)
  if (need.length === 0) return {}
  for (const build of PROVIDERS) {
    try {
      const res = await fetch(build(base))
      if (!res.ok) continue
      const data = await res.json()
      if (data && data.rates && Object.keys(data.rates).length) return data.rates
    } catch {
      // try the next provider
    }
  }
  throw new Error('FX_UNAVAILABLE')
}
