import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uuid } from '../utils/id'
import { DEFAULT_CATEGORIES } from '../constants/categories'
import { buildSampleData } from '../constants/sampleData'
import { todayISO, addPeriod } from '../utils/date'
import { marketDate } from '../utils/marketDate'
import { collectDue } from '../utils/recurring'
import { rewriteTagName, reorderTag } from './tagOps'
import { reassignCategory, reorderCategory } from './categoryOps'
import { STORE_VERSION, migratePersisted } from './migrate'

// Single source of truth for the whole app, persisted to localStorage.
// Kept as ONE store on purpose: the app is small and cross-slice reads
// (e.g. dashboard needs transactions + categories) are simpler this way.

const STORAGE_KEY = 'mysync-store'

const now = () => new Date().toISOString()

// Palette for tag chips. New tags get the next unused color (cycling), so the
// user gets variety without having to pick one every time.
const TAG_COLORS = [
  '#6366f1', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#64748b',
]


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
  dailyReminder: false, // remind to log spending each day at dailyReminderTime
  dailyReminderTime: '21:00', // HH:MM local time for the daily logging reminder
  lastDailyReminderAt: null, // YYYY-MM-DD of the last on-open daily reminder shown
  biometricEnabled: false, // unlock with fingerprint/Face (WebAuthn), needs PIN as fallback
  biometricCredId: null, // stored WebAuthn credential id (base64url)
  autoLockMinutes: 0, // re-lock after N minutes idle when a PIN is set (0 = off)
  demoMode: false, // currently showing opt-in sample data (see loadSampleData)
  onboarded: false, // has the first-run welcome been dismissed?
  haptics: true, // light vibration on important taps (save/pay/confirm/delete)
  accent: 'indigo', // brand accent color preset (see constants/accents.js)
  animSpeed: 'fast', // count-up / donut animation speed: 'off' | 'normal' | 'fast'
  showInvestments: true, // show the Investments card on the dashboard
  showSavings: true, // show the Savings goals card on the dashboard
  showTrend: true, // show the monthly trend chart on the dashboard
  seasonalEffect: 'off', // background particles: 'off' | 'auto' | snow|leaves|sakura|rain|hearts
  celebrations: true, // confetti burst on goal reached / debt paid / installment complete
  investMarket: 'us', // which market's calendar day a portfolio snapshot belongs to: 'us' | 'local'
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
      recurringIncomes: [], // [{ id, name, amount(satang), frequency, nextDate, categoryId, tags, note, active, ... }]
      // Daily portfolio-value snapshots in the PRIMARY currency (minor units),
      // keyed by 'YYYY-MM-DD'. Each day: { date, total, byPortfolio:{id:value}, at }.
      // Recorded when the Stocks pages are viewed; powers the daily % calendar.
      // We store value per day and derive the % between consecutive days, so no
      // historical price feed is needed — it fills in going forward.
      investmentSnapshots: {},
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

      // Put a just-deleted transaction back exactly as it was (for Undo).
      restoreTransaction: (tx) =>
        set((s) => ({ transactions: [tx, ...s.transactions.filter((t) => t.id !== tx.id)] })),

      // Put several just-deleted transactions back (undo for a split group).
      restoreTransactions: (txs) =>
        set((s) => {
          const ids = new Set(txs.map((t) => t.id))
          return { transactions: [...txs, ...s.transactions.filter((t) => !ids.has(t.id))] }
        }),

      // --- Split transactions ----------------------------------------------
      // A "split" is one purchase recorded across several categories. We store
      // each portion as a normal transaction linked by a shared `splitGroupId`,
      // so every total / chart / filter keeps working unchanged. Portions share
      // type, date, note and tags; each has its own categoryId + amount.
      addSplit: ({ type, date, note = '', tags = [], splits = [] }) =>
        set((s) => {
          const splitGroupId = uuid()
          const created = splits.map((sp) =>
            withStamps({ type, amount: sp.amount, categoryId: sp.categoryId, tags, note, date, splitGroupId })
          )
          return { transactions: [...created, ...s.transactions] }
        }),

      // Replace a split group's portions (edit). Drops the old portions and
      // recreates the group with the same id.
      updateSplit: (splitGroupId, { type, date, note = '', tags = [], splits = [] }) =>
        set((s) => {
          const others = s.transactions.filter((t) => t.splitGroupId !== splitGroupId)
          const created = splits.map((sp) =>
            withStamps({ type, amount: sp.amount, categoryId: sp.categoryId, tags, note, date, splitGroupId })
          )
          return { transactions: [...created, ...others] }
        }),

      deleteSplit: (splitGroupId) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.splitGroupId !== splitGroupId) })),

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

      // Delete a category and clear it from any item that used it (those become
      // uncategorized). The UI warns first when the category is still in use.
      deleteCategory: (id) =>
        set((s) => ({
          ...reassignCategory(s, id, null),
          categories: s.categories.filter((c) => c.id !== id),
        })),

      // Reorder a category one step (dir 'up' | 'down') among its same-type,
      // same-pinned peers — the order the add-form uses.
      moveCategory: (id, dir) =>
        set((s) => ({ categories: reorderCategory(s.categories, id, dir) })),

      // Merge one category into another: repoint every item that used the
      // source category to the target, then drop the source.
      mergeCategory: (sourceId, targetId) =>
        set((s) => {
          if (!sourceId || !targetId || sourceId === targetId) return {}
          if (!s.categories.some((c) => c.id === targetId)) return {}
          return {
            ...reassignCategory(s, sourceId, targetId),
            categories: s.categories.filter((c) => c.id !== sourceId),
          }
        }),

      // --- Tags (managed list) --------------------------------------------
      // Add a tag by name, ignoring blanks and case-insensitive duplicates.
      // Returns the tag name so callers can immediately select it.
      addTag: (rawName) => {
        const name = (rawName || '').trim()
        if (!name) return null
        const existing = get().tags.find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        )
        // Return the canonical existing name so callers select the real tag.
        if (existing) return existing.name
        const color = TAG_COLORS[get().tags.length % TAG_COLORS.length]
        set((s) => ({ tags: [...s.tags, withStamps({ name, color })] }))
        return name
      },

      // Reorder a tag one step (dir 'up' | 'down') in the managed list.
      moveTag: (id, dir) =>
        set((s) => ({ tags: reorderTag(s.tags, id, dir) })),

      // Change a tag's color (and nothing else).
      setTagColor: (id, color) =>
        set((s) => ({
          tags: s.tags.map((t) => (t.id === id ? { ...t, color, updatedAt: now() } : t)),
        })),

      // Rename a tag. If the new name matches another existing tag (case-
      // insensitive), the two are MERGED: references are rewritten and the
      // duplicate tag entry removed. Otherwise it's a plain rename, propagated
      // to every transaction / debt / recurring income that used the old name.
      renameTag: (id, rawName) =>
        set((s) => {
          const name = (rawName || '').trim()
          const tag = s.tags.find((t) => t.id === id)
          if (!tag || !name || name === tag.name) return {}
          const clash = s.tags.find(
            (t) => t.id !== id && t.name.toLowerCase() === name.toLowerCase()
          )
          const rewritten = rewriteTagName(s, tag.name, clash ? clash.name : name)
          const tags = clash
            ? s.tags.filter((t) => t.id !== id) // merged into the existing tag
            : s.tags.map((t) => (t.id === id ? { ...t, name, updatedAt: now() } : t))
          return { ...rewritten, tags }
        }),

      // Merge one tag into another: rewrite references and drop the source tag.
      mergeTag: (sourceId, targetId) =>
        set((s) => {
          const src = s.tags.find((t) => t.id === sourceId)
          const dst = s.tags.find((t) => t.id === targetId)
          if (!src || !dst || sourceId === targetId) return {}
          return {
            ...rewriteTagName(s, src.name, dst.name),
            tags: s.tags.filter((t) => t.id !== sourceId),
          }
        }),

      // Delete a tag AND strip it from every transaction / debt / recurring
      // income — otherwise syncTagsFromTransactions would resurrect it on the
      // next launch.
      deleteTag: (id) =>
        set((s) => {
          const tag = s.tags.find((t) => t.id === id)
          if (!tag) return {}
          return {
            ...rewriteTagName(s, tag.name, null),
            tags: s.tags.filter((t) => t.id !== id),
          }
        }),

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
                const color = TAG_COLORS[(s.tags.length + additions.length) % TAG_COLORS.length]
                additions.push(withStamps({ name, color }))
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

      // --- Recurring incomes ----------------------------------------------
      // Scheduled income (salary, allowance, ...) that posts itself as an
      // 'income' transaction when due. Unlike recurring debts (which you tap to
      // pay), these are logged automatically by runRecurringIncomes() on app
      // open, so money you know is coming shows up without any action.
      addRecurringIncome: (data) =>
        set((s) => ({
          recurringIncomes: [
            ...s.recurringIncomes,
            withStamps({
              name: '',
              amount: 0,
              frequency: 'monthly',
              nextDate: todayISO(),
              categoryId: '',
              tags: [],
              note: '',
              active: true,
              lastPostedAt: null,
              ...data,
            }),
          ],
        })),

      updateRecurringIncome: (id, patch) =>
        set((s) => ({
          recurringIncomes: s.recurringIncomes.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: now() } : r
          ),
        })),

      deleteRecurringIncome: (id) =>
        set((s) => ({ recurringIncomes: s.recurringIncomes.filter((r) => r.id !== id) })),

      // Post every due occurrence of every active recurring income, catching up
      // if several periods have passed (e.g. the app wasn't opened for months).
      // Capped so a bad date can never loop forever. Call once on app mount.
      runRecurringIncomes: () =>
        set((s) => {
          const today = todayISO()
          const created = []
          const updated = s.recurringIncomes.map((r) => {
            if (!r.active || !r.nextDate || r.amount <= 0) return r
            const { dates, nextDate } = collectDue(r.nextDate, r.frequency, today)
            if (dates.length === 0) return r
            for (const date of dates) {
              created.push(
                withStamps({
                  type: 'income',
                  amount: r.amount,
                  categoryId: r.categoryId || '',
                  tags: r.tags || [],
                  note: r.note || r.name,
                  date,
                  recurringIncomeId: r.id, // provenance, for future features
                })
              )
            }
            return { ...r, nextDate, lastPostedAt: dates[dates.length - 1] }
          })
          if (created.length === 0) return {}
          return {
            transactions: [...created, ...s.transactions],
            recurringIncomes: updated,
          }
        }),

      // --- Investment snapshots -------------------------------------------
      // Record today's portfolio value(s) in the primary currency. Merges into
      // today's entry so a full snapshot (Stocks page) and a single-portfolio
      // one (PortfolioDetail) can both contribute. Keeps the latest value of the
      // day (last write wins) and prunes history to ~450 days.
      recordInvestmentSnapshot: ({ total, byPortfolio } = {}) =>
        set((s) => {
          // Key by the reference market's own calendar day (default US), so a
          // price captured the next Thai morning lands on the US trading day it
          // actually came from — not the day the app happened to be opened.
          const date = marketDate(new Date(), s.settings.investMarket)
          const prev = s.investmentSnapshots[date] || {}
          const entry = {
            date,
            total: total != null ? total : prev.total ?? null,
            byPortfolio: { ...(prev.byPortfolio || {}), ...(byPortfolio || {}) },
            at: now(),
          }
          const all = { ...s.investmentSnapshots, [date]: entry }
          const dates = Object.keys(all).sort()
          if (dates.length <= 450) return { investmentSnapshots: all }
          const kept = {}
          for (const d of dates.slice(-450)) kept[d] = all[d]
          return { investmentSnapshots: kept }
        }),

      // --- Settings --------------------------------------------------------
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      markBackupNow: () =>
        set((s) => ({ settings: { ...s.settings, lastBackupAt: now() } })),

      // --- Demo / reset ----------------------------------------------------
      // Load the opt-in sample dataset so a new user can see a filled-in app.
      // Replaces every collection (the caller confirms / backs up first) and
      // flips on the demo flag so the UI can show a "sample data" banner.
      loadSampleData: () =>
        set(() => {
          const s = buildSampleData()
          return {
            transactions: s.transactions,
            categories: s.categories,
            tags: s.tags,
            debts: s.debts,
            portfolios: s.portfolios,
            holdings: s.holdings,
            fx: null,
            savingsGoals: s.savingsGoals,
            settings: { ...get().settings, demoMode: true },
          }
        }),

      // Wipe all data back to a brand-new state: empty collections plus freshly
      // seeded default categories (so the app is never left with none). Keeps
      // the user's preferences (theme, language, PIN, accent, ...) and clears
      // the demo flag. The caller is responsible for confirming / backing up.
      clearAllData: () =>
        set((s) => ({
          transactions: [],
          categories: DEFAULT_CATEGORIES.map((c) => withStamps({ ...c, isDefault: true })),
          tags: [],
          debts: [],
          portfolios: [],
          holdings: [],
          fx: null,
          savingsGoals: [],
          recurringIncomes: [],
          investmentSnapshots: {},
          settings: { ...s.settings, demoMode: false, lastBackupAt: null },
        })),

      // --- Import / restore ------------------------------------------------
      // Replace transactions and categories from an imported backup.
      // Settings are intentionally left as-is (device-specific).
      replaceData: ({ transactions, categories, tags, debts, portfolios, holdings, savingsGoals, recurringIncomes }) =>
        set((s) => ({
          transactions: Array.isArray(transactions) ? transactions : [],
          categories: Array.isArray(categories) ? categories : s.categories,
          tags: Array.isArray(tags) ? tags : s.tags,
          debts: Array.isArray(debts) ? debts : s.debts,
          portfolios: Array.isArray(portfolios) ? portfolios : s.portfolios,
          holdings: Array.isArray(holdings) ? holdings : s.holdings,
          savingsGoals: Array.isArray(savingsGoals) ? savingsGoals : s.savingsGoals,
          recurringIncomes: Array.isArray(recurringIncomes) ? recurringIncomes : s.recurringIncomes,
          // Importing real data means we're no longer looking at the demo.
          settings: { ...s.settings, demoMode: false },
        })),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      // Upgrades old persisted data to the current shape (see store/migrate.js).
      migrate: migratePersisted,
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
        recurringIncomes: s.recurringIncomes,
        investmentSnapshots: s.investmentSnapshots,
        settings: s.settings,
      }),
    }
  )
)

// --- Selectors (stable helpers) ---------------------------------------------
export const selectCategoryById = (id) => (s) =>
  s.categories.find((c) => c.id === id) || null
