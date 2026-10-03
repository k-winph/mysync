// A friendly empty state: an illustration (or an icon inside a soft gradient
// circle), an optional bold title, a message, and an optional action node.
// Both styles follow the accent color + dark mode via brand CSS variables, so
// "nothing here yet" moments feel designed and consistent across the app.
export default function EmptyState({ icon: Icon, illustration, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2.5 py-8 text-center ${className}`}>
      {illustration ? (
        <div className="mb-1">{illustration}</div>
      ) : Icon ? (
        <div className="grid h-20 w-20 place-items-center rounded-full
          bg-gradient-to-br from-brand-500/20 to-brand-600/10 text-brand-600 dark:text-brand-500">
          <Icon size={34} strokeWidth={1.8} />
        </div>
      ) : null}
      {title && <p className="text-base font-bold text-slate-700 dark:text-slate-200">{title}</p>}
      {message && <p className="max-w-[16rem] text-sm leading-relaxed text-slate-500">{message}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
