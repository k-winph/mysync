import { formatMoney } from '../utils/money'
import { useStore } from '../store/useStore'
import { useCountUp } from '../hooks/useCountUp'
import { animDuration } from '../utils/anim'

// Like MoneyText, but counts the amount up when it first appears (and when it
// changes). The speed follows the user's Settings choice ('off' | 'normal' |
// 'fast'); 'off' shows the final value at once. Also respects "hide balances"
// (dots, no number) and, via useCountUp, the reduce-motion preference.
// Pass a stable `trackKey` for headline figures (dashboard balance/income/
// expense, donut total): the count-up then runs only when the value actually
// changes — it animates on first open and after you add a record, but doesn't
// replay when you simply return to the screen. (See useCountUp.)
export default function AnimatedMoney({ satang, currency, className = '', hidden, trackKey }) {
  const settings = useStore((s) => s.settings)
  const cur = currency || settings.primaryCurrency
  const shouldHide = hidden ?? settings.hideBalances
  const speed = settings.animSpeed || 'fast'
  // Hook must run unconditionally; its result is ignored while hidden/off.
  const value = useCountUp(satang, animDuration(speed), { trackKey })

  if (shouldHide) {
    return <span className={`tabular-nums ${className}`}>••••••</span>
  }
  // 'off' → show the final amount immediately (no count-up).
  const shown = speed === 'off' ? satang : value
  return <span className={`tabular-nums ${className}`}>{formatMoney(shown, cur)}</span>
}
