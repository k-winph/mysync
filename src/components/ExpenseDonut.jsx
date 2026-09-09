import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatMoney } from '../utils/money'
import MoneyText from './MoneyText'
import CategoryIcon from './CategoryIcon'

// Donut of expenses grouped by category for the period.
// `data`: [{ id, name, value(satang), color, icon }] already sorted desc.
// Identity is carried by the legend (name + amount + %), never color alone,
// so it stays readable for colorblind users and in print.
export default function ExpenseDonut({ data, currency }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  return (
    <div>
      <div className="relative" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatMoney(value, currency), name]}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                fontSize: 13,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center total overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500">Total</span>
          <MoneyText satang={total} currency={currency} className="text-lg font-bold" />
        </div>
      </div>

      {/* Legend / table (identity + values) */}
      <div className="mt-3 space-y-2">
        {data.map((d) => {
          const pct = Math.round((d.value / total) * 100)
          return (
            <div key={d.id} className="flex items-center gap-2 text-sm">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: d.color }}
              >
                <CategoryIcon name={d.icon} size={12} />
              </span>
              <span className="flex-1 truncate font-medium">{d.name}</span>
              <span className="text-xs text-slate-400">{pct}%</span>
              <MoneyText satang={d.value} currency={currency} className="w-24 text-right font-semibold" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
