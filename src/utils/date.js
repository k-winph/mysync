import dayjs from 'dayjs'

// All dates are stored as ISO date strings (e.g. "2026-09-09").

/** Today as ISO date string, for form defaults. */
export function todayISO() {
  return dayjs().format('YYYY-MM-DD')
}

/** Format an ISO date for display, e.g. "9 Sep 2026". */
export function formatDate(iso) {
  if (!iso) return ''
  return dayjs(iso).format('D MMM YYYY')
}

/** Short label used in lists, e.g. "9 Sep". */
export function formatDateShort(iso) {
  if (!iso) return ''
  return dayjs(iso).format('D MMM')
}

/**
 * Return the inclusive start/end ISO dates for the month containing `iso`
 * (defaults to current month). Useful for filtering "this month".
 * @returns {{start: string, end: string, label: string}}
 */
export function getMonthRange(iso) {
  const d = iso ? dayjs(iso) : dayjs()
  return {
    start: d.startOf('month').format('YYYY-MM-DD'),
    end: d.endOf('month').format('YYYY-MM-DD'),
    label: d.format('MMMM YYYY'),
  }
}

/** True if an ISO date falls within [start, end] inclusive. */
export function isWithin(iso, start, end) {
  return iso >= start && iso <= end
}
