// Portfolio math. All money is in MINOR units (cents of the holding's own
// currency): avgCost and lastPrice are cents, shares may be fractional.
// A "quote" is transient live data from the API: { priceCents, changeCents, changePct }.
//
// Design note: current price, today's change, market value, gain/loss and
// portfolio/grand totals are all COMPUTED here and never stored (per spec §6).
// Only lastPrice / lastPriceAt are cached on the holding for instant display.

/** Metrics for one holding given an optional fresh quote.
 * Falls back to the cached price/change on the holding so pages that don't
 * fetch (e.g. the dashboard) still show today's change and market value. */
export function holdingMetrics(h, quote) {
  const priceCents = quote?.priceCents ?? h.lastPrice ?? null
  const hasPrice = priceCents != null
  const changeCents = quote?.changeCents ?? h.lastChangeCents ?? null
  const changePct = quote?.changePct ?? h.lastChangePct ?? null
  const cost = h.shares * h.avgCost
  const value = hasPrice ? h.shares * priceCents : null
  const gain = hasPrice ? value - cost : null
  const gainPct = hasPrice && cost > 0 ? (gain / cost) * 100 : null
  const todayChange = changeCents != null ? h.shares * changeCents : null
  return { priceCents, hasPrice, cost, value, gain, gainPct, todayChange, changePct }
}

/**
 * Totals for a set of holdings, grouped by currency (we never fake FX).
 * When a holding has no price, its cost is used as a fallback for `value`
 * so a total can still be shown; `gain`/`todayChange` only aggregate priced ones.
 * @returns {Array<{currency,value,cost,gain,todayChange,hasTodayChange,priced,total}>}
 */
export function totalsByCurrency(holdings, quoteMap = {}) {
  const groups = {}
  for (const h of holdings) {
    const cur = h.currency || 'THB'
    const g = (groups[cur] ||= {
      currency: cur,
      value: 0,
      cost: 0,
      gain: 0,
      todayChange: 0,
      hasTodayChange: false,
      priced: 0,
      total: 0,
    })
    const m = holdingMetrics(h, quoteMap[(h.symbol || '').toUpperCase()])
    g.total += 1
    g.cost += m.cost
    g.value += m.hasPrice ? m.value : m.cost
    if (m.hasPrice) {
      g.gain += m.gain
      g.priced += 1
    }
    if (m.todayChange != null) {
      g.todayChange += m.todayChange
      g.hasTodayChange = true
    }
  }
  return Object.values(groups).map((g) => ({
    ...g,
    gainPct: g.cost > 0 ? (g.gain / g.cost) * 100 : 0,
    // Today's % relative to yesterday's close (value - todayChange).
    todayPct:
      g.hasTodayChange && g.value - g.todayChange > 0
        ? (g.todayChange / (g.value - g.todayChange)) * 100
        : 0,
  }))
}

/** Numeric total value across holdings (all currencies summed). Used only for
 * rough proportion/share calculations on the dashboard donut. */
export function sumValue(holdings, quoteMap = {}) {
  return totalsByCurrency(holdings, quoteMap).reduce((s, g) => s + g.value, 0)
}

/**
 * Combine one metric (value/cost/gain/todayChange) across per-currency groups
 * into the primary currency using convert(). Also returns the native amounts of
 * any non-primary currencies, for showing a smaller secondary figure.
 * `ok` is false when a needed rate is missing → callers show natives only.
 * @returns {{ primaryMinor:number, natives:Array<{minor,currency}>, ok:boolean }}
 */
export function combineToPrimary(groups, field, convert, primary) {
  let primaryMinor = 0
  let ok = true
  const natives = []
  for (const g of groups) {
    const c = g.currency === primary ? g[field] : convert(g[field], g.currency)
    if (c == null) ok = false
    else primaryMinor += c
    if (g.currency !== primary && g[field]) natives.push({ minor: g[field], currency: g.currency })
  }
  return { primaryMinor, natives, ok }
}

/** Wrap a single amount as a combineToPrimary-shaped result (for one holding). */
export function singleToPrimary(minor, currency, convert, primary) {
  const c = currency === primary ? minor : convert(minor, currency)
  return {
    primaryMinor: c == null ? minor : c,
    natives: currency !== primary ? [{ minor, currency }] : [],
    ok: c != null,
  }
}

/** Unique, uppercased symbols across holdings (for batch quote fetches). */
export function uniqueSymbols(holdings) {
  return [...new Set(holdings.map((h) => (h.symbol || '').toUpperCase()).filter(Boolean))]
}
