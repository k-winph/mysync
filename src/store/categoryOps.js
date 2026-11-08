// Pure category-reassign helper, split out of the store so it can be unit-
// tested without importing zustand.
//
// Point every item that used category `fromId` at `toId` instead (used when
// merging one category into another). When `toId` is null the reference is
// cleared (the item becomes uncategorized). Touches every collection that
// carries a categoryId: transactions, debts and recurring incomes.
export function reassignCategory(state, fromId, toId) {
  const map = (arr) =>
    (arr || []).map((item) => (item.categoryId === fromId ? { ...item, categoryId: toId || '' } : item))
  return {
    transactions: map(state.transactions),
    debts: map(state.debts),
    recurringIncomes: map(state.recurringIncomes),
  }
}

// Move a category one step up/down among its "peers" — the categories that sit
// together in the add-form (same type AND same pinned state), in array order.
// Swapping only within that subgroup keeps the move visually one-step and in
// sync with how the form orders them (pinned first, then array order). Returns a
// new array, or the original when the move isn't possible (edge of the group).
export function reorderCategory(categories, id, dir) {
  const arr = [...categories]
  const idx = arr.findIndex((c) => c.id === id)
  if (idx < 0) return categories
  const t = arr[idx]
  const peers = []
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i]
    // Only reorder among visible (non-archived) peers of the same type and pin.
    if (c.type === t.type && !!c.pinned === !!t.pinned && !c.archived) peers.push(i)
  }
  const pos = peers.indexOf(idx)
  const np = dir === 'up' ? pos - 1 : pos + 1
  if (np < 0 || np >= peers.length) return categories
  const a = peers[pos]
  const b = peers[np]
  ;[arr[a], arr[b]] = [arr[b], arr[a]]
  return arr
}

// How many items reference each category id, across all collections. Used to
// warn before deleting a category that is still in use.
export function categoryUsage(state) {
  const counts = {}
  const add = (arr) => {
    for (const item of arr || []) {
      if (item.categoryId) counts[item.categoryId] = (counts[item.categoryId] || 0) + 1
    }
  }
  add(state.transactions)
  add(state.debts)
  add(state.recurringIncomes)
  return counts
}
