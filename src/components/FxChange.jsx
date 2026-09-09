import DualMoney from './DualMoney'

// Colored gain/change figure with currency conversion: an up/down arrow, the
// amount in the primary currency, the native amount smaller, and a percentage.
// `combined` = combineToPrimary()/singleToPrimary() result.
export default function FxChange({ combined, pct, primary, onGradient = false, label }) {
  const cents = combined.ok ? combined.primaryMinor : combined.natives[0]?.minor ?? 0
  const up = cents >= 0
  const color = onGradient
    ? up ? 'text-emerald-300' : 'text-rose-300'
    : up ? 'text-green-600' : 'text-red-600'
  const nativeCls = onGradient ? 'text-white/70' : 'text-slate-400'
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      {up ? '▲' : '▼'}
      <DualMoney combined={combined} primary={primary} abs nativeClassName={nativeCls} />
      {pct != null && <span>({up ? '+' : '-'}{Math.abs(pct).toFixed(2)}%)</span>}
      {label && <span className={nativeCls}>{label}</span>}
    </span>
  )
}
