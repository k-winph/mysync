import MoneyText from './MoneyText'

// Colored gain/change figure: arrow + amount in the primary currency + percent.
// Gain/loss shows ONLY the primary currency (+ %) — no native amount — to keep
// it clean. `combined` = combineToPrimary()/singleToPrimary() result; when rates
// aren't ready it falls back to the native amount so something sensible shows.
export default function FxChange({ combined, pct, primary, onGradient = false, label }) {
  const useNative = !combined.ok && combined.natives.length > 0
  const cents = useNative ? combined.natives[0].minor : combined.primaryMinor
  const currency = useNative ? combined.natives[0].currency : primary
  const up = cents >= 0
  const color = onGradient
    ? up ? 'text-emerald-300' : 'text-rose-300'
    : up ? 'text-green-600' : 'text-red-600'
  const labelColor = onGradient ? 'text-white/70' : 'text-slate-400'
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      {up ? '▲' : '▼'}
      <MoneyText satang={Math.abs(cents)} currency={currency} />
      {pct != null && <span>({up ? '+' : '-'}{Math.abs(pct).toFixed(2)}%)</span>}
      {label && <span className={labelColor}>{label}</span>}
    </span>
  )
}
