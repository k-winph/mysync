import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

// App shell: a centered mobile-width column with a bottom nav.
// Content area gets bottom padding so it never hides behind the nav bar.
// Keying the content by pathname replays a subtle fade on each navigation.
export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md px-4 pb-24 pt-5">
        <div key={location.pathname} className="page-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
