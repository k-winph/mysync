import { formatMoney } from '../utils/money'
import { useStore } from '../store/useStore'

// Displays a money amount, but shows dots when the user has enabled
// "hide balances" in settings. Use this everywhere money is shown.
export default function MoneyText({ satang, currency, className = '', hidden }) {
  const settings = useStore((s) => s.settings)
  const cur = currency || settings.primaryCurrency
  const shouldHide = hidden ?? settings.hideBalances

  if (shouldHide) {
    return <span className={className}>••••••</span>
  }
  return <span className={className}>{formatMoney(satang, cur)}</span>
}
