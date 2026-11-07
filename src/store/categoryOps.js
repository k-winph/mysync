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
