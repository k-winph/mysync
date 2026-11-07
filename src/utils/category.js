// Categories offered in a picker for a given transaction type: drop archived
// ones, keep type-matching (or 'both'), and float pinned categories to the top
// while preserving their relative order (Array.prototype.sort is stable).
export function pickableCategories(categories, type) {
  return categories
    .filter((c) => (c.type === type || c.type === 'both') && !c.archived)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
}
