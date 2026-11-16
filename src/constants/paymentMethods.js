// Default payment methods seeded on first launch (or the first launch after
// this feature ships, for existing users). Seeded in the app's current language
// so a Thai user sees Thai names; after that they are plain, editable strings
// just like categories. `key` is a stable, language-independent id used to pick
// the form's default and nothing else. `isDefaultPick` marks the one the form
// pre-selects for a new entry. `icon` is a kebab-case lucide name (see
// CategoryIcon). Methods are NOT split by income/expense — one list serves both.
export const DEFAULT_PAYMENT_METHODS = {
  en: [
    { key: 'cash', name: 'Cash', icon: 'banknote' },
    { key: 'transfer', name: 'Transfer', icon: 'arrow-left-right', isDefaultPick: true },
    { key: 'credit', name: 'Credit card', icon: 'credit-card' },
  ],
  th: [
    { key: 'cash', name: 'เงินสด', icon: 'banknote' },
    { key: 'transfer', name: 'เงินโอน', icon: 'arrow-left-right', isDefaultPick: true },
    { key: 'credit', name: 'บัตรเครดิต', icon: 'credit-card' },
  ],
}

// Icons offered when creating/editing a custom method (kebab-case lucide names).
export const METHOD_ICONS = [
  'banknote', 'arrow-left-right', 'credit-card', 'wallet', 'smartphone',
  'qr-code', 'landmark', 'piggy-bank', 'coins', 'gift', 'badge-dollar-sign', 'circle-dollar-sign',
]
