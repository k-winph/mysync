import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uuid } from '../utils/id'
import { DEFAULT_CATEGORIES } from '../constants/categories'
import { todayISO, addPeriod } from '../utils/date'

// Single source of truth for the whole app, persisted to localStorage.
// Kept as ONE store on purpose: the app is small and cross-slice reads
// (e.g. dashboard needs transactions + categories) are simpler this way.

const STORAGE_KEY = 'mysync-store'
const STORE_VERSION = 2

const now = () => new Date().toISOString()

const withStamps = (obj) => ({
  id: uuid(),
  createdAt: now(),
  updatedAt: now(),
  ...obj,
})

// Build an expense transaction from a debt (used when a debt or a period/
// installment is paid). Falls back to the first expense category if the debt
// has none, so the created expense is never left uncategorized-and-broken.
const expenseFromDebt = (d, categories) => {
  const catId =
    d.categoryId || categories.find((c) => c.type === 'expense' || c.type === 'both')?.id || ''
  return withStamps({
    type: 'expense',
    amount: d.amount,
    categoryId: catId,
    tags: d.tags || [],
    note: d.note || d.creditor,
    date: todayISO(),
  })
}

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
  debtNotify: false, // fire a local notification for due/overdue debts on app open
  lastDebtNotifyAt: null, // YYYY-MM-DD of the last debt notification (once per day)
  biometricEnabled: false, // unlock with fingerprint/Face (WebAuthn), needs PIN as fallback
  biometricCredId: null, // stored WebAuthn credential id (base64url)
  onboarded: false, // has the first-run welcome been dismissed?
  haptics: true, // light vibration on important taps (save/pay/confirm/delete)
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
      fx: null, // cached FX rates: { base, rates: {CUR: perBase}, at } for converting to primary currency
      savingsGoals: [], // [{ id, name, targetAmount(satang), currentAmount(satang), deadline|null, ... }]
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
      // Three kinds (field `kind`):
      //  - 'once'        : a one-off debt. Pay once -> logs an expense, done.
      //  - 'recurring'   : rent / bills / subscriptions. No end, no balance.
      //                    Pay a cycle -> logs an expense + rolls dueDate forward.
      //  - 'installment' : a loan you pay off (car/house). Has totalInstallments;
      //                    each payment logs an expense, advances the count + date,
      //                    and finishes (isPaid=true) once all installments are paid.
      addDebt: (data) =>
        set((s) => ({
          debts: [
            ...s.debts,
            withStamps({
              kind: 'once',
              isPaid: false,
              frequency: 'monthly',
              totalInstallments: 0,
              paidInstallments: 0,
              categoryId: '',
              tags: [],
              ...data,
            }),
          ],
        })),

      updateDebt: (id, patch) =>
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: now() } : d)),
        })),

      deleteDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      // Pay a one-time debt: create a matching expense (amount/category/tags from
      // the debt), mark it paid, and remember the created transaction so unpaying
      // can remove it. No-op if the debt is already paid.
      payDebt: (id) =>
        set((s) => {
          const d = s.debts.find((x) => x.id === id)
          if (!d || d.isPaid) return {}
          const tx = expenseFromDebt(d, s.categories)
          return {
            transactions: [tx, ...s.transactions],
            debts: s.debts.map((x) =>
              x.id === id ? { ...x, isPaid: true, paidTxId: tx.id, updatedAt: now() } : x
            ),
          }
        }),

      // Reverse payDebt for a one-time debt: delete the linked expense (if any)
      // and mark it unpaid again.
      unpayDebt: (id) =>
        set((s) => {
          const d = s.debts.find((x) => x.id === id)
          if (!d || !d.isPaid) return {}
          return {
            transactions: d.paidTxId
              ? s.transactions.filter((t) => t.id !== d.paidTxId)
              : s.transactions,
            debts: s.debts.map((x) =>
              x.id === id ? { ...x, isPaid: false, paidTxId: null, updatedAt: now() } : x
            ),
          }
        }),

      // Pay one cycle of a recurring bill: log an expense and advance the due
      // date. History isn't reversible (each cycle is a real expense).
      payRecurring: (id) =>
        set((s) => {
          const d = s.debts.find((x) => x.id === id)
          if (!d) return {}
          const tx = expenseFromDebt(d, s.categories)
          return {
            transactions: [tx, ...s.transactions],
            debts: s.debts.map((x) =>
              x.id === id ? { ...x, dueDate: addPeriod(x.dueDate, x.frequency), updatedAt: now() } : x
            ),
          }
        }),

      // Pay one installment of a loan: log an expense, bump the paid count and
      // roll the due date. When the last installment is paid, mark it finished
      // (isPaid=true) so it drops out of the outstanding total.
      payInstallment: (id) =>
        set((s) => {
          const d = s.debts.find((x) => x.id === id)
          if (!d || d.kind !== 'installment' || d.paidInstallments >= d.totalInstallments) return {}
          const tx = expenseFromDebt(d, s.categories)
          const nextPaid = d.paidInstallments + 1
          const done = nextPaid >= d.totalInstallments
          return {
            transactions: [tx, ...s.transactions],
            debts: s.debts.map((x) =>
              x.id === id
                ? {
                    ...x,
                    paidInstallments: nextPaid,
                    isPaid: done,
                    dueDate: done ? x.dueDate : addPeriod(x.dueDate, x.frequency),
                    updatedAt: now(),
                  }
                : x
            ),
          }
        }),

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

      // Cache FX rates for converting holdings to the primary currency.
      setFx: (fx) => set({ fx }),

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

      // --- Savings goals ---------------------------------------------------
      addGoal: (data) =>
        set((s) => ({ savingsGoals: [...s.savingsGoals, withStamps({ currentAmount: 0, ...data })] })),

      updateGoal: (id, patch) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: now() } : g
          ),
        })),

      deleteGoal: (id) =>
        set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) })),

      // Add (or, with a negative delta, withdraw) money to a goal; never below 0.
      addToGoal: (id, deltaCents) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Math.max(0, g.currentAmount + deltaCents), updatedAt: now() }
              : g
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
      replaceData: ({ transactions, categories, tags, debts, portfolios, holdings, savingsGoals }) =>
        set((s) => ({
          transactions: Array.isArray(transactions) ? transactions : [],
          categories: Array.isArray(categories) ? categories : s.categories,
          tags: Array.isArray(tags) ? tags : s.tags,
          debts: Array.isArray(debts) ? debts : s.debts,
          portfolios: Array.isArray(portfolios) ? portfolios : s.portfolios,
          holdings: Array.isArray(holdings) ? holdings : s.holdings,
          savingsGoals: Array.isArray(savingsGoals) ? savingsGoals : s.savingsGoals,
        })),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      // v1 -> v2: debts gained `kind` (once/recurring/installment). Old debts used
      // `recurrence` ('none' | weekly | monthly | yearly); map it forward so
      // existing subscriptions become 'recurring' and everything else 'once'.
      migrate: (state, version) => {
        if (state && version < 2 && Array.isArray(state.debts)) {
          state.debts = state.debts.map((d) => {
            const rec = d.recurrence
            return {
              ...d,
              kind: d.kind || (rec && rec !== 'none' ? 'recurring' : 'once'),
              frequency: d.frequency || (rec && rec !== 'none' ? rec : 'monthly'),
              totalInstallments: d.totalInstallments || 0,
              paidInstallments: d.paidInstallments || 0,
            }
          })
        }
        return state
      },
      // Only persist data, not action functions (zustand handles this, but we
      // keep it explicit for clarity and future-proofing).
      partialize: (s) => ({
        transactions: s.transactions,
        categories: s.categories,
        tags: s.tags,
        debts: s.debts,
        portfolios: s.portfolios,
        holdings: s.holdings,
        fx: s.fx,
        savingsGoals: s.savingsGoals,
        settings: s.settings,
      }),
    }
  )
)

// --- Selectors (stable helpers) ---------------------------------------------
export const selectCategoryById = (id) => (s) =>
  s.categories.find((c) => c.id === id) || null
