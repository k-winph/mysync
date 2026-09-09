import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownRight, Plus, TrendingUp, TrendingDown,
  CircleAlert, CalendarClock, ChevronRight,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { getMonthRange, getPrevMonthRange, isWithin, percentChange, daysUntil, formatDate } from '../utils/date'
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

// Small "vs last month" delta chip. `goodWhenUp` flips the color meaning
// (income going up is good/green; expense going up is bad/red).
function DeltaChip({ pct, goodWhenUp }) {
  if (pct === null) {
    return <span className="text-xs text-slate-400">{strings.dashboard.vsLastMonth}</span>
  }
  if (pct === 0) {
    return <span className="text-xs text-slate-400">{strings.dashboard.noChange}</span>
  }
  const up = pct > 0
  const good = goodWhenUp ? up : !up
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        good ? 'text-green-600' : 'text-red-600'
      }`}
    >
      <Icon size={13} />
      {Math.abs(pct)}% {strings.dashboard.vsLastMonth}
    </span>
  )
}

export default function Dashboard() {
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const debts = useStore((s) => s.debts)
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
  const prevMonth = useMemo(() => getPrevMonthRange(), [])

  const monthTx = useMemo(
    () => transactions.filter((t) => isWithin(t.date, month.start, month.end)),
    [transactions, month]
  )
  const prevTx = useMemo(
    () => transactions.filter((t) => isWithin(t.date, prevMonth.start, prevMonth.end)),
    [transactions, prevMonth]
  )

  const cur = useMemo(() => totals(monthTx), [monthTx])
  const prev = useMemo(() => totals(prevTx), [prevTx])

  const incomePct = percentChange(prev.income, cur.income)
  const expensePct = percentChange(prev.expense, cur.expense)

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

      {/* Balance hero */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <p className="text-sm opacity-80">{strings.dashboard.balance}</p>
        <MoneyText satang={cur.balance} className="text-3xl font-bold" />
      </Card>

      {/* Income / Expense with month-over-month deltas */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="mb-1 flex items-center gap-1.5 text-green-600">
            <ArrowUpRight size={18} />
            <span className="text-sm font-medium">{strings.dashboard.income}</span>
          </div>
          <MoneyText satang={cur.income} className="text-lg font-bold" />
          <div className="mt-1">
            <DeltaChip pct={incomePct} goodWhenUp={true} />
          </div>
        </Card>
        <Card>
          <div className="mb-1 flex items-center gap-1.5 text-red-600">
            <ArrowDownRight size={18} />
            <span className="text-sm font-medium">{strings.dashboard.expense}</span>
          </div>
          <MoneyText satang={cur.expense} className="text-lg font-bold" />
          <div className="mt-1">
            <DeltaChip pct={expensePct} goodWhenUp={false} />
          </div>
        </Card>
      </div>

      {/* Quick add */}
      <button
        onClick={() => {
          setEditing(null)
          setAddOpen(true)
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed
          border-brand-300 py-3 font-semibold text-brand-600 transition hover:bg-brand-50
          dark:border-brand-600/50 dark:hover:bg-brand-600/10"
      >
        <Plus size={20} /> {strings.dashboard.quickAdd}
      </button>

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
