// Pure tag-rewrite helper, split out of the store so it can be unit-tested
// without importing zustand (which touches localStorage at module load).
//
// Replace one tag name with another across every collection where a tag can
// appear (transactions, debts, recurring incomes). When `to` is null the tag is
// removed. De-duplicates so an item never lists the same tag twice after a merge.
export function rewriteTagName(state, from, to) {
  const map = (arr) =>
    (arr || []).map((item) => {
      const tags = item.tags || []
      if (!tags.includes(from)) return item
      const next = []
      for (const t of tags) {
        const name = t === from ? to : t
        if (name && !next.includes(name)) next.push(name)
      }
      return { ...item, tags: next }
    })
  return {
    transactions: map(state.transactions),
    debts: map(state.debts),
    recurringIncomes: map(state.recurringIncomes),
  }
}
