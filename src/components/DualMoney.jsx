import MoneyText from './MoneyText'

// Shows an amount converted to the primary currency (prominent) with the
// original foreign amount(s) shown smaller alongside/below.
// `combined` = output of combineToPrimary(): { primaryMinor, natives, ok }.
// When rates aren't ready (ok=false) it falls back to the native amount(s).
export default function DualMoney({
  combined,
  primary,
  className = '',
  nativeClassName = 'opacity-70',
  stacked = false,
  abs = false,
}) {
  const { primaryMinor, natives, ok } = combined
  const amt = (m) => (abs ? Math.abs(m) : m)

  const nativeList = (
    <>
      {natives.map((n, i) => (
        <span key={i}>
          {i > 0 ? ' + ' : ''}
          <MoneyText satang={amt(n.minor)} currency={n.currency} />
        </span>
      ))}
    </>
  )

  // Rates not available yet — show the native amount(s) only.
  if (!ok) {
    return <span className={className}>{natives.length ? nativeList : <MoneyText satang={amt(primaryMinor)} currency={primary} />}</span>
  }

  return (
    <span className={stacked ? 'block' : ''}>
      <MoneyText satang={amt(primaryMinor)} currency={primary} className={className} />
      {natives.length > 0 &&
        (stacked ? (
          <span className={`block text-sm ${nativeClassName}`}>{nativeList}</span>
        ) : (
          <span className={`ml-1 text-xs ${nativeClassName}`}>({nativeList})</span>
        ))}
    </span>
  )
}
