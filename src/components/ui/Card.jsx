// Simple surface container used across pages.
export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-4 shadow-sm
        dark:border-line-2 dark:bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
