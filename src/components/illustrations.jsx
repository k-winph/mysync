// Small, friendly inline SVG illustrations for empty states. Drawn with the
// accent color via brand CSS variables (so they re-theme with the user's accent
// and dark mode) plus one warm gold coin. No external assets — stays offline.
//
// `rgb(var(--brand-600) / 0.2)` resolves because the brand vars hold space-
// separated channels (e.g. "79 70 229"), the modern rgb() space syntax.

const COIN = '#f5b50a'
const COIN_EDGE = '#d99a00'
const COIN_INK = '#7a5a00'

// Wallet + coin — for the transactions empty state.
export function WalletArt() {
  return (
    <svg width="120" height="104" viewBox="0 0 120 104" fill="none" aria-hidden="true">
      <rect x="16" y="30" width="88" height="56" rx="14" fill="rgb(var(--brand-500) / 0.12)" />
      <rect x="16" y="30" width="88" height="56" rx="14" fill="none"
        stroke="rgb(var(--brand-600) / 0.35)" strokeWidth="2.5" />
      <path d="M16 48h88" stroke="rgb(var(--brand-600) / 0.22)" strokeWidth="2.5" />
      <rect x="74" y="54" width="30" height="22" rx="9" fill="rgb(var(--brand-600) / 0.18)" />
      <circle cx="89" cy="65" r="5.5" fill="rgb(var(--brand-600))" />
      <circle cx="58" cy="22" r="12" fill={COIN} />
      <circle cx="58" cy="22" r="12" fill="none" stroke={COIN_EDGE} strokeWidth="2" />
      <text x="58" y="27" textAnchor="middle" fontSize="13" fontWeight="800" fill={COIN_INK}>฿</text>
    </svg>
  )
}

// Rising line chart + coin — for the stocks / portfolios empty state.
export function StocksArt() {
  return (
    <svg width="120" height="104" viewBox="0 0 120 104" fill="none" aria-hidden="true">
      <rect x="12" y="24" width="96" height="60" rx="14" fill="rgb(var(--brand-500) / 0.10)" />
      <polyline points="24,66 46,50 62,58 84,34 98,42" fill="none"
        stroke="rgb(var(--brand-600))" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="34" r="6" fill="rgb(var(--brand-600))" />
      <circle cx="96" cy="74" r="15" fill={COIN} />
      <circle cx="96" cy="74" r="15" fill="none" stroke={COIN_EDGE} strokeWidth="2" />
      <text x="96" y="79" textAnchor="middle" fontSize="15" fontWeight="800" fill={COIN_INK}>฿</text>
    </svg>
  )
}

// Piggy bank + coin dropping in — for the savings-goals empty state.
export function PiggyArt() {
  return (
    <svg width="120" height="104" viewBox="0 0 120 104" fill="none" aria-hidden="true">
      <ellipse cx="56" cy="62" rx="36" ry="28" fill="rgb(var(--brand-500) / 0.16)" />
      <path d="M88 56c6-2 10 2 10 8s-6 7-9 5" fill="rgb(var(--brand-500) / 0.16)" />
      <ellipse cx="90" cy="62" rx="7.5" ry="6.5" fill="rgb(var(--brand-500) / 0.32)" />
      <circle cx="90" cy="61" r="1.6" fill="rgb(var(--brand-700))" />
      <circle cx="70" cy="55" r="3.4" fill="rgb(var(--brand-700))" />
      <rect x="46" y="32" width="22" height="6" rx="3" fill="rgb(var(--brand-600))" />
      <rect x="34" y="84" width="8" height="11" rx="3" fill="rgb(var(--brand-600))" />
      <rect x="70" y="84" width="8" height="11" rx="3" fill="rgb(var(--brand-600))" />
      <circle cx="57" cy="16" r="9" fill={COIN} />
      <circle cx="57" cy="16" r="9" fill="none" stroke={COIN_EDGE} strokeWidth="1.8" />
      <text x="57" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill={COIN_INK}>฿</text>
    </svg>
  )
}
