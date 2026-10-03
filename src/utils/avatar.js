// Deterministic avatar color + initial for a person, so each name keeps the same
// color everywhere it appears (chips, item toggles, results, share image).
// Colors are picked to read well on white text in both light and dark themes.
const AVATAR_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// Stable color keyed by the person's id (falls back to name) so it never shifts
// when they rename someone or reorder the list.
export function avatarColor(seed) {
  return AVATAR_COLORS[hash(String(seed || '')) % AVATAR_COLORS.length]
}

// First visible character, uppercased (works for Thai and Latin names).
export function avatarInitial(name) {
  const t = (name || '').trim()
  return t ? t[0].toUpperCase() : '?'
}
