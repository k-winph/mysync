import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { fetchQuotes } from '../services/stockApi'
import { uniqueSymbols } from '../utils/portfolio'

// Fetch live quotes for a set of holdings and cache them on the store.
// Returns { quoteMap, loading, error, hasKey, refresh, lastFetchedAt }.
//
// Auto-fetches once on mount when an API key is set. `quoteMap` (keyed by
// uppercased symbol) holds fresh data for the session; cached lastPrice on each
// holding is what shows instantly before/without a fetch.
export function useQuotes(holdings) {
  const apiKey = useStore((s) => s.settings.stockApiKey)
  const provider = useStore((s) => s.settings.stockProvider)
  const cacheHoldingPrice = useStore((s) => s.cacheHoldingPrice)

  const [quoteMap, setQuoteMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastFetchedAt, setLastFetchedAt] = useState(null)

  // Keep latest holdings without making them a dependency (avoids refetch loops
  // when we cache prices back into the store).
  const holdingsRef = useRef(holdings)
  holdingsRef.current = holdings

  const hasKey = !!apiKey

  const refresh = useCallback(async () => {
    const current = holdingsRef.current
    const symbols = uniqueSymbols(current)
    if (!apiKey || symbols.length === 0) return
    setLoading(true)
    setError('')
    try {
      const { quotes, errors } = await fetchQuotes(symbols, { provider, apiKey })
      setQuoteMap((prev) => ({ ...prev, ...quotes }))
      const at = new Date().toISOString()
      setLastFetchedAt(at)
      // Cache each fetched price onto every holding using that symbol.
      for (const h of current) {
        const q = quotes[(h.symbol || '').toUpperCase()]
        if (q) cacheHoldingPrice(h.id, q.priceCents, at)
      }
      if (Object.keys(errors).length > 0) setError('PARTIAL')
    } catch {
      setError('FAILED')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, provider])

  // Auto-fetch once on mount when possible.
  useEffect(() => {
    if (apiKey) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { quoteMap, loading, error, hasKey, refresh, lastFetchedAt }
}
