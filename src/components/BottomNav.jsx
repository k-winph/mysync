import { NavLink } from 'react-router-dom'
import { Home, ListPlus, Landmark, Calculator, Settings } from 'lucide-react'
import { strings } from '../constants/strings'

// Style 2 bottom bar: rounded top corners + a raised circular center button.
// Order (left→right): Tax · Debt · Home (center, raised) · Records · Settings.
// Home is the primary tab, so it gets the prominent purple floating button.
export default function BottomNav() {
  const LEFT = [
    { to: '/tax', label: strings.nav.tax, icon: Calculator },
    { to: '/debt', label: strings.nav.debt, icon: Landmark },
  ]
  const RIGHT = [
    { to: '/transactions', label: strings.nav.transactions, icon: ListPlus },
    { to: '/settings', label: strings.nav.settings, icon: Settings },
  ]

  const sideClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
      isActive ? 'text-brand-600 dark:text-brand-500' : 'text-slate-500 dark:text-slate-400'
    }`

  const SideItem = ({ to, label, icon: Icon }) => (
    <NavLink to={to} className={sideClass}>
      <Icon size={22} />
      {label}
    </NavLink>
  )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div
        className="mx-auto flex max-w-md items-end justify-around rounded-t-3xl border-t border-slate-200
          bg-white/95 px-2 shadow-[0_-4px_24px_-10px_rgba(0,0,0,0.25)] backdrop-blur
          dark:border-slate-800 dark:bg-slate-900/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {LEFT.map((item) => (
          <SideItem key={item.to} {...item} />
        ))}

        {/* Center: raised, prominent Home button */}
        <NavLink to="/" end className="flex flex-1 flex-col items-center">
          {({ isActive }) => (
            <>
              <span
                className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full text-white
                  shadow-lg ring-4 ring-white transition active:scale-95 dark:ring-slate-900
                  ${isActive ? 'bg-brand-600' : 'bg-brand-500'}`}
              >
                <Home size={26} />
              </span>
              <span
                className={`mb-2.5 mt-1 text-[11px] font-semibold transition ${
                  isActive ? 'text-brand-600 dark:text-brand-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {strings.nav.dashboard}
              </span>
            </>
          )}
        </NavLink>

        {RIGHT.map((item) => (
          <SideItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}
