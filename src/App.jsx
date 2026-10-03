import { useEffect, useLayoutEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import { strings, setLang } from './constants/strings'
import { applyAccent } from './constants/accents'
import { todayISO, daysUntil } from './utils/date'
import { notificationPermission, showNotification } from './utils/notify'
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
const Installments = lazy(() => import('./pages/Installments'))
const Tax = lazy(() => import('./pages/Tax'))
const Stocks = lazy(() => import('./pages/Stocks'))
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'))
const Savings = lazy(() => import('./pages/Savings'))
const SplitBill = lazy(() => import('./pages/SplitBill'))
const Guide = lazy(() => import('./pages/Guide'))
const Settings = lazy(() => import('./pages/Settings'))

// Shown briefly while a lazy route chunk loads. Quiet and theme-aware.
function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-600" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export default function App() {
  const theme = useStore((s) => s.settings.theme)
  const language = useStore((s) => s.settings.language)
  const pinEnabled = useStore((s) => s.settings.pinEnabled)
  const accent = useStore((s) => s.settings.accent)

  // Apply the active language before children render so `strings.x` (a live
  // Proxy) resolves to it. Subscribing to `language` re-renders the whole tree
  // on change, so every screen updates instantly.
  setLang(language)
  const seedDefaults = useStore((s) => s.seedDefaults)
  const syncTagsFromTransactions = useStore((s) => s.syncTagsFromTransactions)

  // Locked on every load when a PIN is set; unlock lasts for the session only.
  // Initialised from the PIN state at load, so enabling a PIN mid-session does
  // NOT lock you out immediately — it takes effect on the next open/reload.
  const [unlocked, setUnlocked] = useState(() => !useStore.getState().settings.pinEnabled)

  // Seed default categories on first launch (no-op if user already has some),
  // and make sure tags used by existing transactions are in the managed list.
  useEffect(() => {
    seedDefaults()
    syncTagsFromTransactions()
  }, [seedDefaults, syncTagsFromTransactions])

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
