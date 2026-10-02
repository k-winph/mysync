import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Share2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate } from '../utils/date'
import { buildMonthImage } from '../utils/monthImage'
import { useFx } from '../hooks/useFx'
import { totalsByCurrency, combineToPrimary, sumField, holdingMetrics } from '../utils/portfolio'
import Modal from './ui/Modal'
import MoneyText from './MoneyText'
import TransactionItem from './TransactionItem'

const OTHER_COLOR = '#94a3b8'
const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Group one type's transactions by category -> rows sorted desc. Keeps the top
// `cap` and rolls the rest into a single "Other" slice. If a real category named
// like "Other" is already in the top, the remainder is merged into it so the
// label never appears twice.
function breakdown(txs, categories, type, cap = 5) {
  const byCat = {}
  for (const t of txs) {
    if (t.type !== type) continue
    byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount
  }
  const rows = Object.entries(byCat)
    .map(([id, value]) => {
      const c = categories.find((x) => x.id === id)
      return { id, name: c?.name || 'Uncategorized', color: c?.color || OTHER_COLOR, value }
    })
    .sort((a, b) => b.value - a.value)
  if (rows.length <= cap) return rows
  const top = rows.slice(0, cap)
  const otherValue = rows.slice(cap).reduce((s, r) => s + r.value, 0)
  const existing = top.find((r) => r.name === strings.month.other)
  if (existing) {
    existing.value += otherValue
    return top
  }
  return [...top, { id: '__other', name: strings.month.other, color: OTHER_COLOR, value: otherValue }]
}

// Small conic-gradient donut with the total in the hole. `rows` already summed.
function MiniDonut({ rows, currency }) {
  const total = rows.reduce((s, r) => s + r.value, 0)
  let acc = 0
  const stops = rows.map((r) => {
    const start = acc
    acc += (r.value / total) * 100
    return `${r.color} ${start}% ${acc}%`
  })
  return (
    <div
      className="relative mx-auto"
      style={{ width: 116, height: 116, borderRadius: '9999px', background: `conic-gradient(${stops.join(',')})` }}
    >
      <div className="absolute inset-[24%] flex items-center justify-center rounded-full bg-white dark:bg-slate-900">
        <MoneyText satang={total} currency={currency} className="text-[11px] font-bold" />
      </div>
    </div>
  )
}

// One side of the popup: a titled donut + a legend of up to 6 rows (5 + Other).
function DonutSide({ label, rows, currency, emptyText }) {
  const total = rows.reduce((s, r) => s + r.value, 0)
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-center text-xs font-semibold text-slate-500">{label}</p>
      {total === 0 ? (
        <div className="flex h-[116px] items-center justify-center text-xs text-slate-400">{emptyText}</div>
      ) : (
        <>
          <MiniDonut rows={rows} currency={currency} />
          <div className="mt-3 space-y-1">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="min-w-0 flex-1 truncate">{r.name}</span>
                <span className="shrink-0 text-slate-400">{Math.round((r.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Popup for a single month: income/expense donuts side by side + that month's
// full transaction list (read-only).
export default function MonthDetailModal({ open, onClose, year, month }) {
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const holdings = useStore((s) => s.holdings)
  const currency = useStore((s) => s.settings.primaryCurrency)
  const accent = useStore((s) => s.settings.accent)
  const language = useStore((s) => s.settings.language)
  const dark = useStore((s) => s.settings.theme) === 'dark'
  const { convert } = useFx(holdings.map((h) => h.currency), currency)

  // Current portfolio snapshot (value + gain) in the primary currency.
  const stocks = useMemo(() => {
    if (!holdings.length) return { has: false }
    const grand = totalsByCurrency(holdings, {})
    const value = combineToPrimary(grand, 'value', convert, currency).primaryMinor
    const gain = combineToPrimary(grand, 'gain', convert, currency).primaryMinor
    const cost = sumField(grand, 'cost')
    const gainPct = cost > 0 ? (sumField(grand, 'gain') / cost) * 100 : 0

    // Standout holdings: the one up the most (%) and the one worth the most.
    let topGain = null // { symbol, gainPct } — only among priced holdings
    let topValue = null // { symbol, valuePrimary } — compared in primary currency
    for (const h of holdings) {
      const m = holdingMetrics(h)
      const symbol = (h.symbol || h.name || '').toUpperCase()
      if (!symbol) continue
      // Value for ranking: use market value when priced, else cost. Convert to
      // primary so holdings in different currencies compare fairly (fall back to
      // the native amount if no FX rate yet).
      const native = m.hasPrice ? m.value : m.cost
      const inPrimary = convert(native, h.currency)
      const cmp = inPrimary == null ? native : inPrimary
      if (!topValue || cmp > topValue.valuePrimary) topValue = { symbol, valuePrimary: cmp }
      if (m.hasPrice && m.gainPct != null && (!topGain || m.gainPct > topGain.gainPct)) {
        topGain = { symbol, gainPct: m.gainPct }
      }
    }
    return { has: true, value, gain, gainPct, topGain, topValue }
  }, [holdings, convert, currency])

  const data = useMemo(() => {
    if (month === null || month === undefined) return null
    const mm = String(month + 1).padStart(2, '0')
    const prefix = `${year}-${mm}`
    const txs = transactions.filter((t) => t.date.slice(0, 7) === prefix)
    let income = 0
    let expense = 0
    for (const t of txs) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    // Newest first, grouped by day.
    const sorted = [...txs].sort((a, b) =>
      a.date !== b.date ? (a.date < b.date ? 1 : -1) : (a.createdAt || '') < (b.createdAt || '') ? 1 : -1
    )
    const groups = {}
    for (const t of sorted) (groups[t.date] ||= []).push(t)
    return {
      incomeRows: breakdown(txs, categories, 'income'),
      expenseRows: breakdown(txs, categories, 'expense'),
      income,
      expense,
      net: income - expense,
      grouped: Object.entries(groups),
    }
  }, [transactions, categories, year, month])

  const title = month === null || month === undefined
    ? ''
    : language === 'th'
      ? `${TH_MONTHS[month]} ${year}`
      : dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`).format('MMMM YYYY')

  // Previous month's expense total (handles the year boundary) for the trend line.
  const prevExpense = useMemo(() => {
    if (month === null || month === undefined) return 0
    const prefix = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`).subtract(1, 'month').format('YYYY-MM')
    return transactions
      .filter((t) => t.type === 'expense' && t.date.slice(0, 7) === prefix)
      .reduce((s, t) => s + t.amount, 0)
  }, [transactions, year, month])

  const shareImage = async () => {
    if (!data) return
    const blob = await buildMonthImage({
      title,
      income: data.income,
      expense: data.expense,
      net: data.net,
      incomeRows: data.incomeRows,
      expenseRows: data.expenseRows,
      stocks,
      prevExpense,
      savingsRate: data.income > 0 && data.net > 0 ? (data.net / data.income) * 100 : null,
      currency,
      accent,
      dark,
      labels: {
        income: strings.balance.income,
        expense: strings.balance.expense,
        net: strings.balance.net,
        incomeByCat: strings.month.incomeByCat,
        expenseByCat: strings.month.expenseByCat,
        investments: strings.month.investments,
        saved: strings.month.saved,
        vsPrev: strings.month.vsPrev,
        topGainer: strings.month.topGainer,
        topHolding: strings.month.topHolding,
        footer: strings.month.madeWith,
      },
    })
    if (!blob) return
    const name = `mysync-${year}-${String(month + 1).padStart(2, '0')}.png`
    // Always save a copy to the device, then also open the share sheet.
    downloadBlob(blob, name)
    const file = new File([blob], name, { type: 'image/png' })
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
      }
    } catch {
      /* share cancelled or unsupported — the file was already downloaded */
    }
  }

  if (!data) return null

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
          <p className="text-[11px] text-green-600">{strings.balance.income}</p>
          <MoneyText satang={data.income} currency={currency} className="text-sm font-bold" />
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
          <p className="text-[11px] text-red-600">{strings.balance.expense}</p>
          <MoneyText satang={data.expense} currency={currency} className="text-sm font-bold" />
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
          <p className="text-[11px] text-slate-500">{strings.balance.net}</p>
          <MoneyText
            satang={data.net}
            currency={currency}
            className={`text-sm font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}
          />
        </div>
      </div>

      {/* Share this month as an image */}
      <button
        onClick={shareImage}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-500
          py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 active:scale-95
          dark:text-brand-500 dark:hover:bg-brand-600/10"
      >
        <Share2 size={16} /> {strings.month.shareImage}
      </button>

      {/* Two donuts side by side */}
      <div className="mt-4 flex gap-3">
        <DonutSide
          label={strings.month.incomeByCat}
          rows={data.incomeRows}
          currency={currency}
          emptyText={strings.month.noIncome}
        />
        <div className="w-px bg-slate-100 dark:bg-slate-800" />
        <DonutSide
          label={strings.month.expenseByCat}
          rows={data.expenseRows}
          currency={currency}
          emptyText={strings.month.noExpense}
        />
      </div>

      {/* Full transaction list (read-only) */}
      <h3 className="mb-2 mt-5 text-sm font-semibold text-slate-500">{strings.month.transactions}</h3>
      {data.grouped.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{strings.month.noTx}</p>
      ) : (
        <div className="space-y-4">
          {data.grouped.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {formatDate(date)}
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                {items.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
