import { ChevronLeft } from 'lucide-react'

// Shared page header: an optional back button, the feature's icon in a soft
// badge, the title (+ optional subtitle), and an optional right-side slot for
// per-page actions (bell, eye, refresh, etc.). Used on every screen so headers
// look consistent across the app.
export default function PageHeader({ icon: Icon, title, subtitle, onBack, right }) {
  return (
    <div className="flex items-center gap-2">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {Icon && (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-600/15">
          <Icon size={24} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
