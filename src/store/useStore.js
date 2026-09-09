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
  stockProvider: 'finnhub',
  stockApiKey: '', // user's own free API key, stored on-device only
}

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [],
      tags: [], // managed tag list: [{ id, name, ... }]
      debts: [], // [{ id, creditor, amount(satang), dueDate, isPaid, note, ... }]
      portfolios: [], // [{ id, name, type:'stock', note, ... }]
      holdings: [], // [{ id, portfolioId, symbol, shares, avgCost(cents), currency, lastPrice, lastPriceAt, ... }]
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

      // --- Debts -----------------------------------------------------------
      addDebt: (data) =>
        set((s) => ({ debts: [...s.debts, withStamps({ isPaid: false, ...data })] })),

      updateDebt: (id, patch) =>
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: now() } : d)),
        })),

      deleteDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      toggleDebtPaid: (id) =>
        set((s) => ({
          debts: s.debts.map((d) =>
            d.id === id ? { ...d, isPaid: !d.isPaid, updatedAt: now() } : d
          ),
        })),

      // --- Portfolios & holdings ------------------------------------------
      addPortfolio: (data) =>
        set((s) => ({ portfolios: [...s.portfolios, withStamps({ type: 'stock', ...data })] })),

      updatePortfolio: (id, patch) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: now() } : p
          ),
        })),

      // Deleting a portfolio also removes its holdings (no orphans).
      deletePortfolio: (id) =>
        set((s) => ({
          portfolios: s.portfolios.filter((p) => p.id !== id),
          holdings: s.holdings.filter((h) => h.portfolioId !== id),
        })),

      addHolding: (data) =>
        set((s) => ({
          holdings: [...s.holdings, withStamps({ lastPrice: null, lastPriceAt: null, ...data })],
        })),

      updateHolding: (id, patch) =>
        set((s) => ({
          holdings: s.holdings.map((h) =>
            h.id === id ? { ...h, ...patch, updatedAt: now() } : h
          ),
        })),

      deleteHolding: (id) => set((s) => ({ holdings: s.holdings.filter((h) => h.id !== id) })),

      // Cache the latest fetched quote (price + today's change) so it can show
      // instantly next open — including on the dashboard, which never calls the API.
      cacheHoldingPrice: (id, quote, at) =>
        set((s) => ({
          holdings: s.holdings.map((h) =>
            h.id === id
              ? {
                  ...h,
                  lastPrice: quote.priceCents,
                  lastChangeCents: quote.changeCents ?? null,
                  lastChangePct: quote.changePct ?? null,
                  lastPriceAt: at,
                }
              : h
          ),
        })),

      // --- Settings --------------------------------------------------------
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      markBackupNow: () =>
        set((s) => ({ settings: { ...s.settings, lastBackupAt: now() } })),

      // --- Import / restore ------------------------------------------------
      // Replace transactions and categories from an imported backup.
      // Settings are intentionally left as-is (device-specific).
      replaceData: ({ transactions, categories, tags, debts, portfolios, holdings }) =>
        set((s) => ({
          transactions: Array.isArray(transactions) ? transactions : [],
          categories: Array.isArray(categories) ? categories : s.categories,
          tags: Array.isArray(tags) ? tags : s.tags,
          debts: Array.isArray(debts) ? debts : s.debts,
          portfolios: Array.isArray(portfolios) ? portfolios : s.portfolios,
          holdings: Array.isArray(holdings) ? holdings : s.holdings,
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
        debts: s.debts,
        portfolios: s.portfolios,
        holdings: s.holdings,
        settings: s.settings,
      }),
    }
  )
)

// --- Selectors (stable helpers) ---------------------------------------------
export const selectCategoryById = (id) => (s) =>
  s.categories.find((c) => c.id === id) || null
