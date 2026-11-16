// Small pure helpers for payment methods, kept out of the store/React so they
// can be unit-tested.

// The method a brand-new entry should pre-select: the one flagged isDefaultPick
// (seeded as "Transfer"), else the first method, else '' (meaning "unset").
export function defaultMethodId(methods) {
  if (!Array.isArray(methods) || methods.length === 0) return ''
  const pick = methods.find((m) => m.isDefaultPick)
  return (pick || methods[0]).id
}

// Look up a method by id (null-safe).
export function methodById(methods, id) {
  if (!id || !Array.isArray(methods)) return null
  return methods.find((m) => m.id === id) || null
}

// Move a method one step up/down in the managed list. Returns a new array, or
// the original when the move isn't possible (edge of the list).
export function reorderMethod(methods, id, dir) {
  const arr = [...(methods || [])]
  const idx = arr.findIndex((m) => m.id === id)
  if (idx < 0) return methods
  const np = dir === 'up' ? idx - 1 : idx + 1
  if (np < 0 || np >= arr.length) return methods
  ;[arr[idx], arr[np]] = [arr[np], arr[idx]]
  return arr
}
