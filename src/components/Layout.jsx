import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import BottomNav from './BottomNav'

// App shell: a centered mobile-width column with a bottom nav.
// Content area gets bottom padding so it never hides behind the nav bar.
// Keying the content by pathname replays a subtle fade on each navigation.
export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const demoMode = useStore((s) => s.settings.demoMode)
  return (
    <div className="min-h-screen">
      {demoMode && (
        <button
          onClick={() => navigate('/settings')}
          className="flex w-full items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
        >
          <FlaskConical size={14} />
          <span>{strings.demo.banner}</span>
          <span className="rounded-full bg-amber-200/70 px-2 py-0.5 dark:bg-amber-500/25">
            {strings.demo.bannerAction}
          </span>
        </button>
      )}
      <main className="mx-auto max-w-md px-4 pb-24 pt-5">
        <div key={location.pathname} className="page-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
