// Stock price service with a swappable provider layer.
// Prices come back in MINOR units (cents) to match the rest of the app.
//
// Adding a provider later = add an entry to PROVIDERS with a `quote(symbol, key)`
// that returns { priceCents, changeCents, changePct } (or throws). Nothing else
// in the app needs to change.

// --- Finnhub -----------------------------------------------------------------
// Free tier, CORS-friendly. US stocks work well; Thai (SET) symbols use a
// ".BK" suffix (e.g. PTT.BK) but coverage on the free plan is limited.
async function finnhubQuote(symbol, apiKey) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(apiKey)}`
  const res = await fetch(url)
  if (res.status === 401 || res.status === 403) throw new Error('AUTH')
  if (res.status === 429) throw new Error('RATE_LIMIT')
  if (!res.ok) throw new Error('HTTP_' + res.status)
  const data = await res.json()
  // Finnhub returns c=0 for unknown symbols.
  if (!data || !data.c) throw new Error('NO_DATA')
  return {
    priceCents: Math.round(data.c * 100),
    changeCents: data.d != null ? Math.round(data.d * 100) : null,
    changePct: data.dp != null ? data.dp : null,
  }
}

export const PROVIDERS = {
  finnhub: {
    id: 'finnhub',
    label: 'Finnhub',
    keyUrl: 'https://finnhub.io/register',
    quote: finnhubQuote,
  },
}

export const DEFAULT_PROVIDER = 'finnhub'

/** Fetch a single quote. Returns { priceCents, changeCents, changePct }. */
export async function getQuote(symbol, { provider = DEFAULT_PROVIDER, apiKey } = {}) {
  if (!apiKey) throw new Error('NO_KEY')
  const p = PROVIDERS[provider] || PROVIDERS[DEFAULT_PROVIDER]
  return p.quote(symbol.trim(), apiKey)
}

/**
 * Fetch quotes for many symbols. Runs sequentially with a small gap to stay
 * within free-tier rate limits. Returns { quotes: {SYM: quote}, errors: {SYM: code} }.
 */
export async function fetchQuotes(symbols, opts = {}) {
  const quotes = {}
  const errors = {}
  for (const sym of symbols) {
    try {
      quotes[sym.toUpperCase()] = await getQuote(sym, opts)
    } catch (e) {
      errors[sym.toUpperCase()] = e.message || 'ERROR'
    }
    // Gentle pacing between calls.
    await new Promise((r) => setTimeout(r, 120))
  }
  return { quotes, errors }
}
