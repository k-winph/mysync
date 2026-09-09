import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import { strings } from './constants/strings'
import { todayISO, daysUntil } from './utils/date'
import { notificationPermission, showNotification } from './utils/notify'
import Layout from './components/Layout'
import LockScreen from './components/LockScreen'
import Dashboard from './pages/Dashboard'
import Balance from './pages/Balance'
import Transactions from './pages/Transactions'
import Debt from './pages/Debt'
import Tax from './pages/Tax'
import Stocks from './pages/Stocks'
import PortfolioDetail from './pages/PortfolioDetail'
import Settings from './pages/Settings'

export default function App() {
  const theme = useStore((s) => s.settings.theme)
  const pinEnabled = useStore((s) => s.settings.pinEnabled)
  const seedDefaults = useStore((s) => s.seedDefaults)
  const syncTagsFromTransactions = useStore((s) => s.syncTagsFromTransactions)

  // Locked on every load when a PIN is set; unlock lasts for the session only.
  const [unlocked, setUnlocked] = useState(false)

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
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="balance" element={<Balance />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="debt" element={<Debt />} />
        <Route path="tax" element={<Tax />} />
        <Route path="stocks" element={<Stocks />} />
        <Route path="stocks/:portfolioId" element={<PortfolioDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
