import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uuid } from '../utils/id'
import { DEFAULT_CATEGORIES } from '../constants/categories'

// Single source of truth for the whole app, persisted to localStorage.
// Kept as ONE store on purpose: the app is small and cross-slice reads
// (e.g. dashboard needs transactions + categories) are simpler this way.

const STORAGE_KEY = 'mysync-store'
const STORE_VERSION = 1

const now = () => new Date().toISOString()

const withStamps = (obj) => ({
  id: uuid(),
  createdAt: now(),
  updatedAt: now(),
  ...obj,
})

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  primaryCurrency: 'THB',
  hideBalances: false,
  pinEnabled: false,
  pinHash: null,
  lastBackupAt: null,
}

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [],
      tags: [], // managed tag list: [{ id, name, ... }]
      settings: { ...DEFAULT_SETTINGS },

      // --- Seeding ---------------------------------------------------------
      // Called once on app mount. Seeds default categories only if none exist,
      // so we never overwrite the user's own categories on later launches.
      seedDefaults: () => {
        if (get().categories.length > 0) return
        const seeded = DEFAULT_CATEGORIES.map((c) => withStamps({ ...c, isDefault: true }))
        set({ categories: seeded })
      },

      // --- Transactions ----------------------------------------------------
      addTransaction: (data) =>
        set((s) => ({ transactions: [withStamps(data), ...s.transactions] })),

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: now() } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      // --- Categories ------------------------------------------------------
      addCategory: (data) =>
        set((s) => ({
          categories: [...s.categories, withStamps({ ...data, isDefault: false })],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: now() } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // --- Tags (managed list) --------------------------------------------
      // Add a tag by name, ignoring blanks and case-insensitive duplicates.
      // Returns the tag name so callers can immediately select it.
      addTag: (rawName) => {
        const name = (rawName || '').trim()
        if (!name) return null
        const exists = get().tags.some(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        )
        if (!exists) set((s) => ({ tags: [...s.tags, withStamps({ name })] }))
        return name
      },

      deleteTag: (id) =>
        set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      // Make sure every tag name used by a transaction exists in the managed
      // list. Run on mount so existing data and CSV imports (which only carry
      // tag names) still show those tags as selectable chips.
      syncTagsFromTransactions: () =>
        set((s) => {
          const known = new Set(s.tags.map((t) => t.name.toLowerCase()))
          const additions = []
          for (const tx of s.transactions) {
            for (const name of tx.tags || []) {
              const key = name.toLowerCase()
              if (name && !known.has(key)) {
                known.add(key)
                additions.push(withStamps({ name }))
              }
            }
          }
          return additions.length ? { tags: [...s.tags, ...additions] } : {}
        }),

      // --- Settings --------------------------------------------------------
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      markBackupNow: () =>
        set((s) => ({ settings: { ...s.settings, lastBackupAt: now() } })),

      // --- Import / restore ------------------------------------------------
      // Replace transactions and categories from an imported backup.
      // Settings are intentionally left as-is (device-specific).
      replaceData: ({ transactions, categories, tags }) =>
        set((s) => ({
          transactions: Array.isArray(transactions) ? transactions : [],
          categories: Array.isArray(categories) ? categories : s.categories,
          tags: Array.isArray(tags) ? tags : s.tags,
        })),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      // Only persist data, not action functions (zustand handles this, but we
      // keep it explicit for clarity and future-proofing).
      partialize: (s) => ({
        transactions: s.transactions,
        categories: s.categories,
        tags: s.tags,
        settings: s.settings,
      }),
    }
  )
)

// --- Selectors (stable helpers) ---------------------------------------------
export const selectCategoryById = (id) => (s) =>
  s.categories.find((c) => c.id === id) || null
