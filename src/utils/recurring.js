import { addPeriod } from './date'

// Pure scheduling helper for recurring items (currently recurring incomes).
// Given a start date and frequency, return every occurrence whose date is on or
// before `today` (the ones that should have been posted), plus the next future
// date. Capped so a bad/zero-advance frequency can never loop forever.
//
// Example: start 2026-09-01, monthly, today 2026-11-07
//   -> { dates: ['2026-09-01','2026-10-01','2026-11-01'], nextDate: '2026-12-01' }
export function collectDue(startDate, frequency, today, cap = 120) {
  const dates = []
  let next = startDate
  if (!next) return { dates, nextDate: next }
  let guard = 0
  while (next <= today && guard < cap) {
    dates.push(next)
    const advanced = addPeriod(next, frequency)
    if (advanced === next) break // 'none'/unknown frequency — avoid an infinite loop
    next = advanced
    guard += 1
  }
  return { dates, nextDate: next }
}
