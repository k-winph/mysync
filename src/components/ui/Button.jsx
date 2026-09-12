import { haptic } from '../../utils/haptics'

// Small button primitive with a few variants. Mobile-first: comfy tap targets.
const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50',
  secondary:
    'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
}

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
  children,
  ...props
}) {
  // Primary/danger buttons are the app's important actions (Save, Confirm, Add,
  // Delete) — give them a light haptic tap. Secondary/ghost stay silent.
  const buzz = variant === 'primary' || variant === 'danger'
  const handleClick = (e) => {
    if (buzz) haptic()
    onClick?.(e)
  }
  return (
    <button
      type={type}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm
        font-semibold transition select-none focus:outline-none focus:ring-2
        focus:ring-brand-500/40 active:scale-[0.97] disabled:active:scale-100
        ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
