import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { fetchRates } from '../services/fx'

const MAX_AGE = 12 * 60 * 60 * 1000 // refetch rates at most twice a day

// Provides convert(minor, fromCurrency) -> minor in the primary currency.
// Fetches rates for the given currencies once, caches them in the store (so
// they show instantly next time and survive offline). Returns null from convert
// when a rate isn't available yet — callers fall back to the native amount.
export function useFx(currencies, primary) {
  const cached = useStore((s) => s.fx)
  const setFx = useStore((s) => s.setFx)

  const initial = cached && cached.base === primary ? cached.rates : {}
  const [rates, setRates] = useState(initial)

  const foreign = [...new Set(currencies)].filter((c) => c && c !== primary)
  const key = foreign.sort().join(',')

  useEffect(() => {
    if (foreign.length === 0) return
    // Use fresh cache if it already covers every needed currency.
    if (
      cached &&
      cached.base === primary &&
      cached.at &&
      Date.now() - Date.parse(cached.at) < MAX_AGE &&
      foreign.every((c) => cached.rates?.[c] != null)
    ) {
      setRates(cached.rates)
      return
    }
    fetchRates(primary, foreign)
      .then((r) => {
        setRates(r)
        setFx({ base: primary, rates: r, at: new Date().toISOString() })
      })
      .catch(() => {
        // keep whatever cached rates we have; convert() will fall back to native
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, key])

  const convert = useCallback(
    (minor, from) => {
      if (from === primary) return minor
      const r = rates?.[from]
      if (!r) return null
      return Math.round(minor / r) // 1 `from` = 1/r primary
    },
    [rates, primary]
  )

  return { convert }
}
