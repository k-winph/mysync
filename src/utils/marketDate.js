// Resolve the "trading day" a captured portfolio price belongs to, by the
// reference market's own timezone.
//
// Why: US holdings viewed from Thailand close in the early hours of the NEXT
// Thai calendar day (the US session runs ~21:30→04:00 Thai time, shifting an
// hour with US daylight-saving). Keying a snapshot by the device's local date
// therefore stamps a price with the day you *looked*, not the day it is from —
// a refresh at 7am Thursday Thai carries Wednesday's US close but lands on
// Thursday. Keying by the exchange's own date fixes that, and Intl computes the
// exchange date with DST handled automatically (no hard-coded market hours).
import dayjs from 'dayjs'

// market key -> IANA timezone. `local` means "use the device's own timezone",
// which is the right choice for Thai (SET) holdings.
export const MARKET_TZ = {
  us: 'America/New_York',
  local: null,
}

// The ISO date (YYYY-MM-DD) that `date` falls on in the reference market.
export function marketDate(date = new Date(), market = 'us') {
  const tz = MARKET_TZ[market] ?? null
  if (!tz) return dayjs(date).format('YYYY-MM-DD') // device-local date
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)
    const g = (t) => parts.find((p) => p.type === t)?.value
    return `${g('year')}-${g('month')}-${g('day')}`
  } catch {
    // Very old engine without IANA tz support — fall back to the local date.
    return dayjs(date).format('YYYY-MM-DD')
  }
}
