// Collapse a day's transaction list so that the portions of a split purchase
// (transactions sharing a `splitGroupId`) become a single group item. Used by
// the Records list to show one row per split. A group with only one portion
// present (e.g. the others filtered out) is unwrapped back to a plain tx.
//
// A group item is: { __group:true, splitGroupId, rep, type, date, note, tags,
// parts:[tx...], total }. Plain transactions pass through unchanged. Order is
// preserved by first appearance.
export function groupDaySplits(items) {
  const out = []
  const idx = {}
  for (const t of items) {
    const gid = t.splitGroupId
    if (gid) {
      if (idx[gid] === undefined) {
        idx[gid] = out.length
        out.push({ __group: true, splitGroupId: gid, parts: [t] })
      } else {
        out[idx[gid]].parts.push(t)
      }
    } else {
      out.push(t)
    }
  }
  return out.map((x) => {
    if (!x.__group) return x
    if (x.parts.length === 1) return x.parts[0]
    const first = x.parts[0]
    return {
      __group: true,
      splitGroupId: x.splitGroupId,
      rep: first,
      type: first.type,
      date: first.date,
      note: first.note || '',
      tags: first.tags || [],
      parts: x.parts,
      total: x.parts.reduce((s, p) => s + p.amount, 0),
    }
  })
}
