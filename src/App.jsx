import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'

export default function App() {
  const theme = useStore((s) => s.settings.theme)
  const seedDefaults = useStore((s) => s.seedDefaults)
  const syncTagsFromTransactions = useStore((s) => s.syncTagsFromTransactions)

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

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
