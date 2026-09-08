import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

// App shell: a centered mobile-width column with a bottom nav.
// Content area gets bottom padding so it never hides behind the nav bar.
export default function Layout() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-md px-4 pb-24 pt-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
