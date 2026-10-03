import { formatMoney } from '../utils/money'
import { useStore } from '../store/useStore'
import { useCountUp } from '../hooks/useCountUp'

// Like MoneyText, but counts the amount up when it first appears (and when it
// changes). Respects "hide balances" (shows dots, no number) and, via
// useCountUp, the reduce-motion preference. Use for the few headline figures
// where a little life helps — not for every amount on screen.
export default function AnimatedMoney({ satang, currency, className = '', hidden, duration = 800 }) {
  const settings = useStore((s) => s.settings)
  const cur = currency || settings.primaryCurrency
  const shouldHide = hidden ?? settings.hideBalances
  // Hook must run unconditionally; its result is ignored while hidden.
  const value = useCountUp(satang, duration)

  if (shouldHide) {
    return <span className={`tabular-nums ${className}`}>••••••</span>
  }
  return <span className={`tabular-nums ${className}`}>{formatMoney(value, cur)}</span>
}
