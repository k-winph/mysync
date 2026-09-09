import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownRight, Plus,
  CircleAlert, CalendarClock, ChevronRight, LineChart,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { getMonthRange, isWithin, daysUntil, formatDate } from '../utils/date'
import { totalsByCurrency, sumValue } from '../utils/portfolio'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import TransactionItem from '../components/TransactionItem'
import ExpenseDonut from '../components/ExpenseDonut'
import TransactionModal from '../components/TransactionModal'

// Sum income/expense/balance for a set of transactions.
function totals(txs) {
  let income = 0
  let expense = 0
  for (const t of txs) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export default function Dashboard() {
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const debts = useStore((s) => s.debts)
  const holdings = useStore((s) => s.holdings)
  const portfolios = useStore((s) => s.portfolios)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // PWA quick-add shortcut lands on /?quickadd=1 — open the add form once.
  useEffect(() => {
    if (searchParams.get('quickadd') !== null) {
      setEditing(null)
      setAddOpen(true)
      searchParams.delete('quickadd')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const month = useMemo(() => getMonthRange(), [])

  const monthTx = useMemo(
    () => transactions.filter((t) => isWithin(t.date, month.start, month.end)),
    [transactions, month]
  )

  const cur = useMemo(() => totals(monthTx), [monthTx])

  // Expenses grouped by category -> donut data. Top 6 + "Other".
  const donutData = useMemo(() => {
    const byCat = {}
    for (const t of monthTx) {
      if (t.type !== 'expense') continue
      byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount
    }
    const rows = Object.entries(byCat)
      .map(([id, value]) => {
        const c = categories.find((x) => x.id === id)
        return { id, name: c?.name || 'Uncategorized', color: c?.color || '#64748b', icon: c?.icon, value }
      })
      .sort((a, b) => b.value - a.value)

    if (rows.length <= 7) return rows
    const top = rows.slice(0, 6)
    const otherValue = rows.slice(6).reduce((s, r) => s + r.value, 0)
    return [...top, { id: '__other', name: 'Other', color: '#94a3b8', icon: 'ellipsis', value: otherValue }]
  }, [monthTx, categories])

  const recent = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [transactions]
  )

  // Unpaid debts that are overdue or due within 14 days — surfaced as a warning.
  const upcomingDebts = useMemo(() => {
    return debts
      .filter((d) => !d.isPaid && daysUntil(d.dueDate) <= 14)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
  }, [debts])


  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{strings.appName}</h1>
          <p className="text-sm text-slate-500">{month.label}</p>
        </div>
        <button
          onClick={() => updateSettings({ hideBalances: !settings.hideBalances })}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={strings.settings.hideBalances}
        >
          {settings.hideBalances ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

      {/* Balance + income/expense in one card — tap to open the yearly breakdown */}
      <button onClick={() => navigate('/balance')} className="block w-full text-left">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
          {/* Top: balance */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-80">{strings.dashboard.balance}</p>
              <ChevronRight size={18} className="opacity-80" />
            </div>
            <MoneyText satang={cur.balance} className="text-3xl font-bold" />
          </div>
          {/* Bottom: income | expense, split by a divider */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-1 p-3">
              <ArrowUpRight size={16} className="shrink-0 text-green-600" />
              <span className="text-xs font-medium text-green-600">{strings.dashboard.income}</span>
              <MoneyText satang={cur.income} className="ml-auto text-sm font-bold" />
            </div>
            <div className="flex items-center gap-1 p-3">
              <ArrowDownRight size={16} className="shrink-0 text-red-600" />
              <span className="text-xs font-medium text-red-600">{strings.dashboard.expense}</span>
              <MoneyText satang={cur.expense} className="ml-auto text-sm font-bold" />
            </div>
          </div>
        </div>
      </button>

      {/* Investments (Dime-style: value + today's change + portfolio shares) */}
      <InvestmentsCard portfolios={portfolios} holdings={holdings} onOpen={() => navigate('/stocks')} />

      {/* Upcoming / overdue debts */}
      {upcomingDebts.length > 0 && (
        <button onClick={() => navigate('/debt')} className="block w-full text-left">
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/15">
            <div className="mb-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <CalendarClock size={16} />
              <span className="text-sm font-semibold">{strings.debt.upcoming}</span>
              <ChevronRight size={16} className="ml-auto" />
            </div>
            <div className="space-y-1.5">
              {upcomingDebts.slice(0, 3).map((d) => {
                const days = daysUntil(d.dueDate)
                const overdue = days < 0
                return (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    {overdue ? (
                      <CircleAlert size={13} className="shrink-0 text-red-600" />
                    ) : (
                      <CalendarClock size={13} className="shrink-0 text-amber-600" />
                    )}
                    <span className="flex-1 truncate">{d.creditor}</span>
                    <span className={`text-xs ${overdue ? 'text-red-600' : 'text-amber-600'}`}>
                      {overdue ? strings.debt.overdue : strings.debt.dueInDays(days)}
                    </span>
                    <MoneyText satang={d.amount} className="w-24 text-right font-semibold" />
                  </div>
                )
              })}
            </div>
          </Card>
        </button>
      )}

      {/* Spending by category (donut) */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          {strings.dashboard.spendingByCategory}
        </h2>
        <Card>
          {donutData.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              {strings.dashboard.noExpenseData}
            </p>
          ) : (
            <ExpenseDonut data={donutData} currency={settings.primaryCurrency} />
          )}
        </Card>
      </div>

      {/* Recent */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          {strings.dashboard.recent}
        </h2>
        {recent.length === 0 ? (
          <Card className="text-center text-sm text-slate-500">{strings.dashboard.empty}</Card>
        ) : (
          <Card className="space-y-0.5">
            {recent.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onEdit={(t) => {
                  setEditing(t)
                  setAddOpen(true)
                }}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Floating add (frosted/translucent so content shows through) */}
      <button
        onClick={() => {
          setEditing(null)
          setAddOpen(true)
        }}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600/70 text-white shadow-lg shadow-brand-600/30 backdrop-blur-md
          transition hover:bg-brand-600/90 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.dashboard.quickAdd}
      >
        <Plus size={26} />
      </button>

      <TransactionModal
        open={addOpen}
        editing={editing}
        onClose={() => {
          setAddOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}

// Colors assigned to portfolios in the proportion donut (by index, stable order).
const PF_COLORS = ['#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#94a3b8']

// A conic-gradient donut ring. `segments`: [{ pct, color }]. Hole matches the card.
function Ring({ segments, size = 68 }) {
  let acc = 0
  const stops = segments.map((s) => {
    const start = acc
    acc += s.pct
    return `${s.color} ${start}% ${acc}%`
  })
  if (acc < 100) stops.push(`#e2e8f0 ${acc}% 100%`)
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size, borderRadius: '9999px', background: `conic-gradient(${stops.join(',')})` }}
    >
      <div className="absolute inset-[26%] rounded-full bg-white dark:bg-slate-900" />
    </div>
  )
}

// Dime-style investments summary: gradient value hero + today's change, with a
// separate card showing each portfolio's share of the total. Uses CACHED prices
// (last fetched), so it never calls the API from the dashboard.
function InvestmentsCard({ portfolios, holdings, onOpen }) {
  const grand = totalsByCurrency(holdings, {})

  // Empty state — a simple entry point.
  if (holdings.length === 0) {
    return (
      <button onClick={onOpen} className="block w-full text-left">
        <Card className="flex items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <LineChart size={22} className="opacity-90" />
          <div className="flex-1">
            <div className="font-semibold">{strings.stock.title}</div>
            <div className="text-sm text-white/80">{strings.dashboard.trackStocks}</div>
          </div>
          <ChevronRight size={18} className="text-white/80" />
        </Card>
      </button>
    )
  }

  // Portfolio shares of the (numeric) total, for the proportion donut.
  const total = sumValue(holdings, {})
  const shares = portfolios
    .map((pf, i) => {
      const v = sumValue(holdings.filter((h) => h.portfolioId === pf.id), {})
      return { id: pf.id, name: pf.name, value: v, color: PF_COLORS[i % PF_COLORS.length] }
    })
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value)
  const segments = total > 0 ? shares.map((s) => ({ pct: (s.value / total) * 100, color: s.color })) : []

  return (
    <button onClick={onOpen} className="block w-full space-y-2 text-left">
      {/* Value + today's change hero */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm opacity-80">{strings.stock.title}</span>
          <ChevronRight size={18} className="opacity-80" />
        </div>
        {grand.map((g) => {
          const up = g.hasTodayChange ? g.todayChange >= 0 : g.gain >= 0
          const cents = g.hasTodayChange ? g.todayChange : g.gain
          const pct = g.hasTodayChange ? g.todayPct : g.gainPct
          const label = g.hasTodayChange ? strings.stock.today : strings.stock.allGainLoss
          return (
            <div key={g.currency} className="mb-2 last:mb-0">
              <MoneyText satang={g.value} currency={g.currency} className="text-3xl font-bold" />
              {(g.hasTodayChange || g.priced > 0) && (
                <div className={`mt-1 text-sm font-medium ${up ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {up ? '▲' : '▼'} <MoneyText satang={Math.abs(cents)} currency={g.currency} />{' '}
                  ({up ? '+' : '-'}{Math.abs(pct).toFixed(2)}%) <span className="opacity-70">{label}</span>
                </div>
              )}
            </div>
          )
        })}
      </Card>

      {/* Portfolio proportions */}
      {shares.length > 0 && (
        <Card className="flex items-center gap-4">
          <Ring segments={segments} />
          <div className="min-w-0 flex-1 space-y-1.5">
            {shares.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className="font-semibold">
                  {total > 0 ? ((s.value / total) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </button>
  )
}
