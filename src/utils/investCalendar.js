// Pure helpers for the investment daily-return calendar. Kept free of React and
// the store so they can be unit-tested.
//
// Snapshots are a map 'YYYY-MM-DD' -> { total, byPortfolio:{id:value}, ... } with
// values in the primary currency's minor units. The daily % for a date is the
// change in value versus the PREVIOUS day that has a value, so markets-closed /
// unopened days simply don't contribute a baseline of their own.

// Read the value for a scope ('total' or a portfolio id) out of one snapshot.
export function snapshotValue(snap, scope) {
  if (!snap) return null
  if (scope === 'total') return snap.total ?? null
  return snap.byPortfolio?.[scope] ?? null
}

// Map of date -> daily % change for the given scope, across all snapshots.
export function dailyReturns(snapshots, scope) {
  const out = {}
  const dates = Object.keys(snapshots || {}).sort()
  let prev = null
  for (const d of dates) {
    const v = snapshotValue(snapshots[d], scope)
    if (v == null) continue
    if (prev != null && prev > 0) out[d] = ((v - prev) / prev) * 100
    prev = v
  }
  return out
}

// Percent change across a single month (YYYY-MM) for a scope: first valued day
// of the month to the last. Returns null when fewer than two valued days exist.
export function monthChange(snapshots, scope, ym) {
  const dates = Object.keys(snapshots || {})
    .filter((d) => d.slice(0, 7) === ym)
    .sort()
  let first = null
  let last = null
  for (const d of dates) {
    const v = snapshotValue(snapshots[d], scope)
    if (v == null) continue
    if (first == null) first = v
    last = v
  }
  if (first == null || last == null || first <= 0 || first === last) {
    return first != null && last != null && first > 0 ? ((last - first) / first) * 100 : null
  }
  return ((last - first) / first) * 100
}

// Earliest snapshot date that has a value for the scope (for limiting how far
// back the month navigation can go). Returns 'YYYY-MM-DD' or null.
export function earliestDate(snapshots, scope) {
  const dates = Object.keys(snapshots || {}).sort()
  for (const d of dates) if (snapshotValue(snapshots[d], scope) != null) return d
  return null
}
