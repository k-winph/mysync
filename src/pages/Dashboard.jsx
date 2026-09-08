import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { getMonthRange, isWithin } from '../utils/date'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import TransactionItem from '../components/TransactionItem'
import CategoryIcon from '../components/CategoryIcon'

export default function Dashboard() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const month = useMemo(() => getMonthRange(), [])

  // Transactions in the current month.
  const monthTx = useMemo(
    () => transactions.filter((t) => isWithin(t.date, month.start, month.end)),
    [transactions, month]
  )

  const { income, expense, balance } = useMemo(() => {
    let inc = 0
    let exp = 0
    for (const t of monthTx) {
      if (t.type === 'income') inc += t.amount
      else exp += t.amount
    }
    return { income: inc, expense: exp, balance: inc - exp }
  }, [monthTx])

  // Top spending categories this month.
  const topSpending = useMemo(() => {
    const byCat = {}
    for (const t of monthTx) {
      if (t.type !== 'expense') continue
      byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount
    }
    return Object.entries(byCat)
      .map(([id, total]) => ({ category: categories.find((c) => c.id === id), total }))
      .filter((x) => x.category)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [monthTx, categories])

  const recent = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [transactions]
  )

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
        <MoneyText satang={balance} className="text-3xl font-bold" />
      </Card>

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="mb-1 flex items-center gap-1.5 text-green-600">
            <ArrowUpRight size={18} />
            <span className="text-sm font-medium">{strings.dashboard.income}</span>
          </div>
          <MoneyText satang={income} className="text-lg font-bold" />
        </Card>
        <Card>
          <div className="mb-1 flex items-center gap-1.5 text-red-600">
            <ArrowDownRight size={18} />
            <span className="text-sm font-medium">{strings.dashboard.expense}</span>
          </div>
          <MoneyText satang={expense} className="text-lg font-bold" />
        </Card>
      </div>

      {/* Top spending */}
      {topSpending.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">
            {strings.dashboard.topCategories}
          </h2>
          <Card className="space-y-3">
            {topSpending.map(({ category, total }) => {
              const pct = expense > 0 ? Math.round((total / expense) * 100) : 0
              return (
                <div key={category.id}>
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <CategoryIcon name={category.icon} size={12} />
                    </span>
                    <span className="flex-1 font-medium">{category.name}</span>
                    <MoneyText satang={total} className="font-semibold" />
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: category.color }}
                    />
                  </div>
                </div>
              )
            })}
          </Card>
        </div>
      )}

      {/* Recent */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          {strings.dashboard.recent}
        </h2>
        {recent.length === 0 ? (
          <Card className="text-center text-sm text-slate-500">
            {strings.dashboard.empty}
          </Card>
        ) : (
          <Card className="space-y-0.5">
            {recent.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onEdit={() => navigate('/transactions')}
              />
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
