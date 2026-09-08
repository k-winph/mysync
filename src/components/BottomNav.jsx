import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListPlus, Settings } from 'lucide-react'
import { strings } from '../constants/strings'

const ITEMS = [
  { to: '/', label: strings.nav.dashboard, icon: LayoutDashboard, end: true },
  { to: '/transactions', label: strings.nav.transactions, icon: ListPlus },
  { to: '/settings', label: strings.nav.settings, icon: Settings },
]

// Fixed bottom tab bar (mobile-first). Safe-area padding for iOS home bar.
export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90
        backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive
                  ? 'text-brand-600 dark:text-brand-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
