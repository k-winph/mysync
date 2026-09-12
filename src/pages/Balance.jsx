import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatMoney } from '../utils/money'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import PageHeader from '../components/PageHeader'

const MONTHS = Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'))
const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#ef4444'

export default function Balance() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const currency = useStore((s) => s.settings.primaryCurrency)

  // Years that actually have data (plus the current year), newest first.
  const years = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 4)))
    set.add(String(dayjs().year()))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const [year, setYear] = useState(years[0])
  const yearIdx = years.indexOf(year)

  // Per-month income/expense totals (in satang) for the selected year.
  const months = useMemo(() => {
    const rows = Array.from({ length: 12 }, (_, m) => ({ m, income: 0, expense: 0 }))
    for (const t of transactions) {
      if (t.date.slice(0, 4) !== year) continue
      const m = Number(t.date.slice(5, 7)) - 1
      if (t.type === 'income') rows[m].income += t.amount
      else rows[m].expense += t.amount
    }
    return rows
  }, [transactions, year])

  const yearTotals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const r of months) {
      income += r.income
      expense += r.expense
    }
    return { income, expense, net: income - expense }
  }, [months])

  const hasData = yearTotals.income > 0 || yearTotals.expense > 0

  // Chart works in baht (satang / 100) for readable axis values.
  const chartData = months.map((r) => ({
    name: MONTHS[r.m],
    income: r.income / 100,
    expense: r.expense / 100,
  }))

  const goMonth = (m) => {
    const start = dayjs(`${year}-${String(m + 1).padStart(2, '0')}-01`)
    const end = start.endOf('month')
    navigate(`/transactions?from=${start.format('YYYY-MM-DD')}&to=${end.format('YYYY-MM-DD')}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader icon={TrendingUp} title={strings.balance.title} subtitle={strings.pageSub.balance} onBack={() => navigate('/')} />

      {/* Year selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setYear(years[yearIdx + 1])}
          disabled={yearIdx >= years.length - 1}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          aria-label="Previous year"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="w-20 text-center text-lg font-bold">{year}</span>
        <button
          onClick={() => setYear(years[yearIdx - 1])}
          disabled={yearIdx <= 0}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          aria-label="Next year"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Year totals */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="py-3">
          <p className="text-xs text-green-600">{strings.balance.income}</p>
          <MoneyText satang={yearTotals.income} currency={currency} className="text-sm font-bold" />
        </Card>
        <Card className="py-3">
          <p className="text-xs text-red-600">{strings.balance.expense}</p>
          <MoneyText satang={yearTotals.expense} currency={currency} className="text-sm font-bold" />
        </Card>
        <Card className="py-3">
          <p className="text-xs text-slate-500">{strings.balance.net}</p>
          <MoneyText
            satang={yearTotals.net}
            currency={currency}
            className={`text-sm font-bold ${yearTotals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}
          />
        </Card>
      </div>

      {!hasData ? (
        <Card className="text-center text-sm text-slate-500">{strings.balance.noData}</Card>
      ) : (
        <>
          {/* Grouped bar chart — all 12 months fit the width (thin bars) */}
          <Card>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="20%" barGap={1}>
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatMoney(Math.round(value * 100), currency), name]}
                    // Force a white box with dark label text so the month name is
                    // readable in both light and dark mode.
                    contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13, backgroundColor: '#ffffff' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    itemStyle={{ paddingTop: 2, paddingBottom: 2 }}
                    cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name={strings.balance.income} fill={INCOME_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="expense" name={strings.balance.expense} fill={EXPENSE_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Per-month cards (tap to see that month's transactions) */}
          <div>
            <p className="mb-2 px-1 text-xs text-slate-400">{strings.balance.tapMonthHint}</p>
            <div className="space-y-2">
              {months.map((r) => {
                const net = r.income - r.expense
                const empty = r.income === 0 && r.expense === 0
                return (
                  <button
                    key={r.m}
                    onClick={() => goMonth(r.m)}
                    disabled={empty}
                    className="block w-full text-left disabled:opacity-50"
                  >
                    <Card className="flex items-center gap-3">
                      <span className="w-10 shrink-0 font-semibold">{MONTHS[r.m]}</span>
                      <div className="flex flex-1 flex-col gap-0.5 text-sm">
                        <span className="text-green-600">
                          + <MoneyText satang={r.income} currency={currency} />
                        </span>
                        <span className="text-red-600">
                          − <MoneyText satang={r.expense} currency={currency} />
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{strings.balance.net}</p>
                        <MoneyText
                          satang={net}
                          currency={currency}
                          className={`font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        />
                      </div>
                      {!empty && <ChevronRight size={16} className="shrink-0 text-slate-400" />}
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
