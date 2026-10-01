import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate } from '../utils/date'
import Modal from './ui/Modal'
import MoneyText from './MoneyText'
import TransactionItem from './TransactionItem'

const OTHER_COLOR = '#94a3b8'

// Group one type's transactions by category -> rows sorted desc. Keeps the top 5
// and rolls the rest into a single "Other" slice, so the donut and its legend
// never get crowded.
function breakdown(txs, categories, type) {
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
  if (rows.length <= 5) return rows
  const top = rows.slice(0, 5)
  const otherValue = rows.slice(5).reduce((s, r) => s + r.value, 0)
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
  const currency = useStore((s) => s.settings.primaryCurrency)

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
    : dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`).format('MMMM YYYY')

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
