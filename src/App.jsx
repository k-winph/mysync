import { useEffect, useLayoutEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import { strings, setLang } from './constants/strings'
import { applyAccent } from './constants/accents'
import { todayISO, daysUntil } from './utils/date'
import { notificationPermission, showNotification, scheduleDailyReminder, cancelDailyReminder } from './utils/notify'
import Layout from './components/Layout'
import LockScreen from './components/LockScreen'
import Dashboard from './pages/Dashboard'
import Welcome from './components/Welcome'
import PwaUpdatePrompt from './components/PwaUpdatePrompt'

// Dashboard is the landing screen, so it stays in the main bundle for an
// instant first paint. Every other screen is code-split and loaded on demand —
// this keeps heavy, rarely-first dependencies (xlsx in Settings/backup, the
// portfolio charts, etc.) out of the initial download.
const Balance = lazy(() => import('./pages/Balance'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Debt = lazy(() => import('./pages/Debt'))
const Recurring = lazy(() => import('./pages/Recurring'))
const RecurringIncome = lazy(() => import('./pages/RecurringIncome'))
const Installments = lazy(() => import('./pages/Installments'))
const Tax = lazy(() => import('./pages/Tax'))
const Stocks = lazy(() => import('./pages/Stocks'))
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'))
const Savings = lazy(() => import('./pages/Savings'))
const SplitBill = lazy(() => import('./pages/SplitBill'))
const Guide = lazy(() => import('./pages/Guide'))
const Settings = lazy(() => import('./pages/Settings'))

// Shown briefly while a lazy route chunk loads. A light skeleton (rather than a
// bare spinner) so switching screens feels smooth.
function RouteFallback() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/70" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/70" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/70" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export default function App() {
  const theme = useStore((s) => s.settings.theme)
  const language = useStore((s) => s.settings.language)
  const pinEnabled = useStore((s) => s.settings.pinEnabled)
  const accent = useStore((s) => s.settings.accent)
  const autoLockMinutes = useStore((s) => s.settings.autoLockMinutes)

  // Apply the active language before children render so `strings.x` (a live
  // Proxy) resolves to it. Subscribing to `language` re-renders the whole tree
  // on change, so every screen updates instantly.
  setLang(language)
  const seedDefaults = useStore((s) => s.seedDefaults)
  const syncTagsFromTransactions = useStore((s) => s.syncTagsFromTransactions)
  const runRecurringIncomes = useStore((s) => s.runRecurringIncomes)

  // Locked on every load when a PIN is set; unlock lasts for the session only.
  // Initialised from the PIN state at load, so enabling a PIN mid-session does
  // NOT lock you out immediately — it takes effect on the next open/reload.
  const [unlocked, setUnlocked] = useState(() => !useStore.getState().settings.pinEnabled)

  // Seed default categories on first launch (no-op if user already has some),
  // and make sure tags used by existing transactions are in the managed list.
  useEffect(() => {
    seedDefaults()
    syncTagsFromTransactions()
    // Post any recurring income that has come due since the last open.
    runRecurringIncomes()
  }, [seedDefaults, syncTagsFromTransactions, runRecurringIncomes])

  // Apply/remove the `dark` class on <html> whenever the theme changes.
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  // Apply the chosen accent color's CSS variables (before paint to avoid a flash).
  useLayoutEffect(() => {
    applyAccent(accent)
  }, [accent])

  // On app open: notify about due/overdue debts (once per day), if enabled.
  useEffect(() => {
    const s = useStore.getState()
    const { debtNotify, lastDebtNotifyAt } = s.settings
    if (!debtNotify || notificationPermission() !== 'granted') return
    const today = todayISO()
    if (lastDebtNotifyAt === today) return
    const due = s.debts.filter((d) => !d.isPaid && daysUntil(d.dueDate) <= 3)
    if (due.length === 0) return
    showNotification(strings.notify.debtTitle, {
      body: due.length === 1 ? strings.notify.debtOne(due[0].creditor) : strings.notify.debtMany(due.length),
    })
    s.updateSettings({ lastDebtNotifyAt: today })
  }, [])

  // Daily "log your spending" reminder. Two layers:
  //  1) on-open nudge — reliable: if it's past the set time and nothing was
  //     logged today (and we haven't nudged today), show it now.
  //  2) scheduled best-effort — a real timed notification for next time via the
  //     Notification Triggers API, where the browser supports it.
  // Re-runs when the toggle/time changes; reads fresh state from the store.
  const dailyReminder = useStore((s) => s.settings.dailyReminder)
  const dailyReminderTime = useStore((s) => s.settings.dailyReminderTime)
  useEffect(() => {
    const s = useStore.getState()
    if (!s.settings.dailyReminder) {
      cancelDailyReminder()
      return
    }
    if (notificationPermission() !== 'granted') return
    const hhmm = s.settings.dailyReminderTime || '21:00'
    const today = todayISO()
    const loggedToday = s.transactions.some((t) => t.date === today)

    // Layer 2 — schedule the next one (skip today if already logged).
    scheduleDailyReminder({
      hhmm,
      skipToday: loggedToday,
      title: strings.notify.dailyTitle,
      body: strings.notify.dailyBody,
    })

    // Layer 1 — nudge right now if due and nothing logged yet today.
    const [h, m] = hhmm.split(':').map(Number)
    const now = new Date()
    const pastTime = now.getHours() * 60 + now.getMinutes() >= (h || 0) * 60 + (m || 0)
    if (pastTime && !loggedToday && s.settings.lastDailyReminderAt !== today) {
      showNotification(strings.notify.dailyTitle, { body: strings.notify.dailyBody })
      s.updateSettings({ lastDailyReminderAt: today })
    }
  }, [dailyReminder, dailyReminderTime])

  // Auto-lock after inactivity (only when a PIN is set and currently unlocked).
  // Any tap/key resets the timer; returning to the tab restarts it. When it
  // fires, we re-lock and LockScreen asks for the PIN again.
  useEffect(() => {
    if (!pinEnabled || !unlocked) return
    const mins = autoLockMinutes || 0
    if (mins <= 0) return
    const ms = mins * 60000
    let timer
    const lock = () => setUnlocked(false)
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(lock, ms)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') reset()
    }
    reset()
    window.addEventListener('pointerdown', reset, { passive: true })
    window.addEventListener('keydown', reset)
    window.addEventListener('touchstart', reset, { passive: true })
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
      window.removeEventListener('touchstart', reset)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [pinEnabled, unlocked, autoLockMinutes])

  if (pinEnabled && !unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />
  }

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="balance" element={<Balance />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="income/recurring" element={<RecurringIncome />} />
            <Route path="debt" element={<Debt />} />
            <Route path="debt/recurring" element={<Recurring />} />
            <Route path="debt/installments" element={<Installments />} />
            <Route path="tax" element={<Tax />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="stocks/:portfolioId" element={<PortfolioDetail />} />
            <Route path="savings" element={<Savings />} />
            <Route path="split" element={<SplitBill />} />
            <Route path="guide" element={<Guide />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
      <Welcome />
      <PwaUpdatePrompt />
    </>
  )
}
