// Default categories seeded on first launch. Users can add/remove their own.
// `icon` values are lucide-react icon names (resolved in CategoryIcon).
// `color` is used for charts (phase 2) and category chips.
export const DEFAULT_CATEGORIES = [
  // --- Expenses ---
  { name: 'Food', type: 'expense', icon: 'utensils', color: '#f97316' },
  { name: 'Transport', type: 'expense', icon: 'bus', color: '#0ea5e9' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
  { name: 'Bills', type: 'expense', icon: 'receipt', color: '#eab308' },
  { name: 'Health', type: 'expense', icon: 'heart-pulse', color: '#ef4444' },
  { name: 'Entertainment', type: 'expense', icon: 'gamepad-2', color: '#8b5cf6' },
  { name: 'Home', type: 'expense', icon: 'house', color: '#14b8a6' },
  { name: 'Other', type: 'expense', icon: 'ellipsis', color: '#64748b' },
  // --- Income ---
  { name: 'Salary', type: 'income', icon: 'wallet', color: '#22c55e' },
  { name: 'Bonus', type: 'income', icon: 'gift', color: '#10b981' },
  { name: 'Investment', type: 'income', icon: 'trending-up', color: '#0d9488' },
  { name: 'Other Income', type: 'income', icon: 'circle-plus', color: '#84cc16' },
]
