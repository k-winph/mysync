import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { strings } from '../constants/strings'
import { todayISO, monthLabel } from '../utils/date'
import { formatMoney } from '../utils/money'
import Card from './ui/Card'

// Compact baht label for a cell (no currency symbol, abbreviated for big sums).
function compact(satang) {
  const b = satang / 100
  if (b >= 100000) return `${Math.round(b / 1000)}k`
  if (b >= 10000) return `${(b / 1000).toFixed(0)}k`
  if (b >= 1000) return `${(b / 1000).toFixed(1)}k`
  return String(Math.round(b))
}

// Monthly heatmap of daily spending. Each day is shaded by how much was spent
// (darker red = more), relative to the month's biggest spending day. Tapping a
// day with transactions calls onPickDay(dateISO). Unlike the investment
// calendar, every weekday counts (spending happens any day); days with no
// expense are neutral and future days are blank.
export default function SpendingCalendar({ transactions, currency, language, onPickDay }) {
  const today = todayISO()

  // Earliest month that has any transaction, to bound the "previous" arrow.
  const earliestYm = useMemo(() => {
    let min = null
    for (const t of transactions) {
      const ym = t.date.slice(0, 7)
      if (min === null || ym < min) min = ym
    }
    return min
  }, [transactions])

  const [view, setView] = useState(() => dayjs().startOf('month'))
  const ym = view.format('YYYY-MM')
  const thisMonth = dayjs().startOf('month')

  // Per-day expense + whether the day has ANY transaction (so it's tappable).
  const { byDay, hasTx, maxDay, monthExpense } = useMemo(() => {
    const byDay = {}
    const hasTx = {}
    let maxDay = 0
    let monthExpense = 0
    for (const t of transactions) {
      if (t.date.slice(0, 7) !== ym) continue
      hasTx[t.date] = true
      if (t.type === 'expense') {
        byDay[t.date] = (byDay[t.date] || 0) + t.amount
        if (byDay[t.date] > maxDay) maxDay = byDay[t.date]
        monthExpense += t.amount
      }
    }
    return { byDay, hasTx, maxDay, monthExpense }
  }, [transactions, ym])

  const canPrev = earliestYm ? ym > earliestYm : false
  const canNext = view.isBefore(thisMonth)

  const firstDow = view.day()
  const daysInMonth = view.daysInMonth()
  const dow = strings.invest.dow

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push({ empty: true, key: `e${i}` })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${ym}-${String(d).padStart(2, '0')}`
    cells.push({
      key: date,
      date,
      d,
      amount: byDay[date] || 0,
      tappable: !!hasTx[date],
      isToday: date === today,
      isFuture: date > today,
    })
  }

  const heat = (amount) => {
    if (amount <= 0 || maxDay <= 0) return undefined
    const a = Math.min(amount / maxDay, 1)
    return { backgroundColor: `rgba(239,68,68,${0.15 + a * 0.6})` }
  }

  return (
    <Card>
      {/* Header: month nav + this-month spend */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => canPrev && setView((v) => v.subtract(1, 'month'))}
          disabled={!canPrev}
          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          aria-label={strings.invest.prevMonth}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold">{monthLabel(ym, language)}</div>
          <div className="text-[11px] text-slate-400">
            {strings.spendCal.monthExpense}:{' '}
            <span className="font-bold text-red-600">{formatMoney(monthExpense, currency)}</span>
          </div>
        </div>
        <button
          onClick={() => canNext && setView((v) => v.add(1, 'month'))}
          disabled={!canNext}
          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          aria-label={strings.invest.nextMonth}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {dow.map((w, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-slate-400">{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) =>
          c.empty ? (
            <div key={c.key} className="aspect-square" />
          ) : (
            <button
              key={c.key}
              type="button"
              onClick={() => c.tappable && onPickDay?.(c.date)}
              disabled={!c.tappable}
              style={!c.isFuture ? heat(c.amount) : undefined}
              className={`flex aspect-square flex-col justify-between overflow-hidden rounded-lg p-1 text-left transition
                ${c.amount > 0 && !c.isFuture
                  ? 'border border-white/5'
                  : 'border border-slate-200/70 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'}
                ${c.tappable ? 'active:scale-95 hover:opacity-80' : ''}
                ${c.isToday ? 'outline outline-2 -outline-offset-1 outline-brand-500' : ''}`}
            >
              <span className={`text-[9px] font-semibold leading-none ${
                c.amount > 0 && !c.isFuture ? 'text-white/85' : 'text-slate-400'
              }`}>{c.d}</span>
              <span className={`text-center text-[9px] font-bold leading-none sm:text-[10px] ${
                c.amount > 0 && !c.isFuture ? 'text-white' : 'text-transparent'
              }`}>
                {c.amount > 0 && !c.isFuture ? compact(c.amount) : '·'}
              </span>
            </button>
          )
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        {monthExpense > 0 ? strings.spendCal.tapHint : strings.spendCal.empty}
      </p>
    </Card>
  )
}
