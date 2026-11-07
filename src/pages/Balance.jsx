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
import MonthDetailModal from '../components/MonthDetailModal'

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
  const [detailMonth, setDetailMonth] = useState(null) // 0-based month, or null

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

  const stats = useMemo(() => {
    let income = 0
    let expense = 0
    let activeMonths = 0
    let maxVal = 0
    for (const r of months) {
      income += r.income
      expense += r.expense
      if (r.income > 0 || r.expense > 0) activeMonths += 1
      maxVal = Math.max(maxVal, r.income, r.expense)
    }
    const net = income - expense
    return {
      income,
      expense,
      net,
      activeMonths,
      maxVal,
      savingsRate: income > 0 ? Math.round((net / income) * 100) : null,
      avgPerMonth: activeMonths > 0 ? Math.round(net / activeMonths) : 0,
    }
  }, [months])

  const hasData = stats.income > 0 || stats.expense > 0

  // Chart works in baht (satang / 100) for readable axis values.
  const chartData = months.map((r) => ({
    name: MONTHS[r.m],
    income: r.income / 100,
    expense: r.expense / 100,
  }))

  const now = dayjs()
  const isCurrentYear = year === String(now.year())
  const currentMonthIdx = now.month()

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

      {!hasData ? (
        <Card className="text-center text-sm text-slate-500">{strings.balance.noData}</Card>
      ) : (
        <>
          {/* Compact year summary — deliberately flat (no gradient) so this page
              reads differently from the Dashboard's hero card. */}
          {(() => {
            const sum = stats.income + stats.expense
            const incPct = sum > 0 ? (stats.income / sum) * 100 : 0
            return (
              <Card className="space-y-2.5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{strings.balance.netThisYear}</p>
                    <MoneyText
                      satang={stats.net}
                      currency={currency}
                      className={`text-2xl font-extrabold ${stats.net >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">{strings.balance.savingsRate}</p>
                    <p className={`text-base font-bold ${stats.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.savingsRate === null ? '—' : `${stats.savingsRate}%`}
                    </p>
                  </div>
                </div>

                {/* Income vs expense split bar */}
                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-emerald-500" style={{ width: `${incPct}%` }} />
                  <div className="h-full bg-rose-500" style={{ width: `${100 - incPct}%` }} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">{strings.balance.income}</span>
                    <MoneyText satang={stats.income} currency={currency} className="font-semibold" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-slate-500">{strings.balance.expense}</span>
                    <MoneyText satang={stats.expense} currency={currency} className="font-semibold" />
                  </span>
                </div>

                <p className="border-t border-slate-100 pt-2 text-xs text-slate-400 dark:border-slate-800">
                  {strings.balance.avgPerMonth}:{' '}
                  <MoneyText satang={stats.avgPerMonth} currency={currency} className="font-semibold text-slate-500" />
                </p>
              </Card>
            )
          })()}

          {/* Grouped bar chart — all 12 months fit the width (thin bars) */}
          <Card>
            <p className="mb-2 text-xs font-semibold text-slate-500">{strings.balance.chartTitle}</p>
            <div style={{ height: 230 }}>
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

          {/* Per-month cards with comparison bars (tap to see that month) */}
          <div>
            <p className="mb-2 px-1 text-xs text-slate-400">{strings.balance.tapMonthHint}</p>
            <div className="space-y-1.5">
              {months.map((r) => {
                const net = r.income - r.expense
                const empty = r.income === 0 && r.expense === 0
                const isCurrent = isCurrentYear && r.m === currentMonthIdx
                const incW = stats.maxVal > 0 ? (r.income / stats.maxVal) * 100 : 0
                const expW = stats.maxVal > 0 ? (r.expense / stats.maxVal) * 100 : 0
                return (
                  <button
                    key={r.m}
                    onClick={() => setDetailMonth(r.m)}
                    disabled={empty}
                    className="block w-full text-left disabled:opacity-40"
                  >
                    <Card className={`flex items-center gap-3 ${isCurrent ? 'ring-1 ring-brand-400' : ''}`}>
                      <div className="w-9 shrink-0">
                        <span className="font-semibold">{MONTHS[r.m]}</span>
                        {isCurrent && (
                          <span className="block text-[9px] font-semibold uppercase leading-tight text-brand-600">
                            {strings.balance.thisMonth}
                          </span>
                        )}
                      </div>
                      {/* Comparison bars */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${incW}%` }} />
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-rose-500" style={{ width: `${expW}%` }} />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-slate-400">{strings.balance.net}</p>
                        <MoneyText
                          satang={net}
                          currency={currency}
                          className={`text-sm font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        />
                      </div>
                      {!empty && <ChevronRight size={15} className="shrink-0 text-slate-400" />}
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      <MonthDetailModal
        open={detailMonth !== null}
        onClose={() => setDetailMonth(null)}
        year={year}
        month={detailMonth}
      />
    </div>
  )
}
