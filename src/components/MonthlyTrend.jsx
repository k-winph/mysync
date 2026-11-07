import { useMemo } from 'react'
import dayjs from 'dayjs'
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon } from 'lucide-react'
import { formatMoney } from '../utils/money'
import { strings } from '../constants/strings'
import EmptyState from './ui/EmptyState'

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#ef4444'
const MONTHS_BACK = 6 // rolling window shown on the chart
const AVG_MONTHS = 3 // trailing months the insight compares against

// Rolling multi-month trend of income vs expense (last 6 months, crossing year
// boundaries — unlike the Balance page which is per calendar year). Below the
// chart, a one-line insight compares this month's spending to the average of
// the previous few months so the number means something at a glance.
export default function MonthlyTrend({ transactions, currency }) {
  const { rows, insight } = useMemo(() => {
    // Build the window: the current month and the 5 before it, oldest first.
    const start = dayjs().startOf('month').subtract(MONTHS_BACK - 1, 'month')
    const buckets = Array.from({ length: MONTHS_BACK }, (_, i) => {
      const m = start.add(i, 'month')
      return { key: m.format('YYYY-MM'), label: m.format('MMM'), income: 0, expense: 0 }
    })
    const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]))

    for (const t of transactions) {
      const key = t.date.slice(0, 7) // YYYY-MM
      const i = index[key]
      if (i === undefined) continue
      if (t.type === 'income') buckets[i].income += t.amount
      else buckets[i].expense += t.amount
    }

    // Insight: this month's expense vs the average of the previous AVG_MONTHS.
    const curExpense = buckets[MONTHS_BACK - 1].expense
    const prev = buckets.slice(MONTHS_BACK - 1 - AVG_MONTHS, MONTHS_BACK - 1)
    const withSpend = prev.filter((b) => b.expense > 0)
    let insight = null
    if (withSpend.length > 0) {
      const avg = withSpend.reduce((s, b) => s + b.expense, 0) / withSpend.length
      if (avg > 0) {
        const pct = Math.round(((curExpense - avg) / avg) * 100)
        insight = { pct, dir: pct > 3 ? 'up' : pct < -3 ? 'down' : 'same' }
      }
    }
    return { rows: buckets, insight }
  }, [transactions])

  const hasData = rows.some((r) => r.income > 0 || r.expense > 0)
  if (!hasData) return <EmptyState icon={LineChartIcon} message={strings.dashboard.noTrendData} />

  // Chart works in baht (satang / 100) for readable axis/tooltip values.
  const chartData = rows.map((r) => ({
    name: r.label,
    income: r.income / 100,
    expense: r.expense / 100,
  }))

  return (
    <div>
      <div style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
            <XAxis
              dataKey="name"
              interval={0}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => [formatMoney(Math.round(value * 100), currency), name]}
              contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13, backgroundColor: '#ffffff' }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
              itemStyle={{ paddingTop: 2, paddingBottom: 2 }}
              cursor={{ stroke: 'rgba(148,163,184,0.4)', strokeWidth: 1 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="income"
              name={strings.dashboard.income}
              stroke={INCOME_COLOR}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name={strings.dashboard.expense}
              stroke={EXPENSE_COLOR}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {insight && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
          {insight.dir === 'up' && <TrendingUp size={18} className="shrink-0 text-red-500" />}
          {insight.dir === 'down' && <TrendingDown size={18} className="shrink-0 text-green-600" />}
          {insight.dir === 'same' && <Minus size={18} className="shrink-0 text-slate-400" />}
          <span className="text-slate-600 dark:text-slate-300">
            {insight.dir === 'up' && strings.dashboard.trendUp(insight.pct)}
            {insight.dir === 'down' && strings.dashboard.trendDown(Math.abs(insight.pct))}
            {insight.dir === 'same' && strings.dashboard.trendSame}
          </span>
        </div>
      )}
    </div>
  )
}
