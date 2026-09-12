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

/** Today as a full label for the dashboard, e.g. "Fri 12 Sep 2026". */
export function todayLong() {
  return dayjs().format('ddd D MMM YYYY')
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

/** Whole days from today until an ISO date. Negative = overdue, 0 = today. */
export function daysUntil(iso) {
  if (!iso) return null
  return dayjs(iso).startOf('day').diff(dayjs().startOf('day'), 'day')
}

/**
 * Advance an ISO date by one recurrence period. Used to roll a subscription's
 * due date forward when it's paid. dayjs handles month-end clamping (e.g. Jan 31
 * + 1 month -> Feb 28). Unknown/none recurrence returns the date unchanged.
 */
export function addPeriod(iso, recurrence) {
  const d = dayjs(iso)
  if (recurrence === 'weekly') return d.add(1, 'week').format('YYYY-MM-DD')
  if (recurrence === 'monthly') return d.add(1, 'month').format('YYYY-MM-DD')
  if (recurrence === 'yearly') return d.add(1, 'year').format('YYYY-MM-DD')
  return iso
}

/** Same as getMonthRange but for the month before the given date (default now). */
export function getPrevMonthRange(iso) {
  const d = (iso ? dayjs(iso) : dayjs()).subtract(1, 'month')
  return {
    start: d.startOf('month').format('YYYY-MM-DD'),
    end: d.endOf('month').format('YYYY-MM-DD'),
    label: d.format('MMMM YYYY'),
  }
}

/**
 * Percentage change from `prev` to `curr`. Returns null when there is no
 * meaningful baseline (prev is 0), so the UI can show a dash instead of Infinity.
 */
export function percentChange(prev, curr) {
  if (!prev) return curr ? null : 0
  return Math.round(((curr - prev) / prev) * 100)
}
