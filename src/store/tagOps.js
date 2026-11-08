// Pure tag-rewrite helper, split out of the store so it can be unit-tested
// without importing zustand (which touches localStorage at module load).
//
// Replace one tag name with another across every collection where a tag can
// appear (transactions, debts, recurring incomes). When `to` is null the tag is
// removed. De-duplicates so an item never lists the same tag twice after a merge.
// Move a tag one step up/down in the managed list (which is also the order the
// chips show in the form and filter). Returns a new array, or the original when
// the move isn't possible.
export function reorderTag(tags, id, dir) {
  const arr = [...tags]
  const idx = arr.findIndex((t) => t.id === id)
  if (idx < 0) return tags
  const np = dir === 'up' ? idx - 1 : idx + 1
  if (np < 0 || np >= arr.length) return tags
  ;[arr[idx], arr[np]] = [arr[np], arr[idx]]
  return arr
}

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
