// A friendly empty state: a soft icon + message (+ optional action node).
// Keeps "nothing here yet" moments consistent across the app.
export default function EmptyState({ icon: Icon, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-8 text-center ${className}`}>
      {Icon && <Icon size={36} className="text-slate-300 dark:text-slate-700" />}
      <p className="text-sm text-slate-500">{message}</p>
      {action}
    </div>
  )
}
