import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { strings } from '../constants/strings'
import { todayISO, monthLabel } from '../utils/date'
import { dailyReturns, monthChange, earliestDate } from '../utils/investCalendar'
import Card from './ui/Card'

const HEAT_MAX = 3 // |%| that reaches full-strength color

function heatStyle(pct) {
  const a = Math.min(Math.abs(pct) / HEAT_MAX, 1)
  const alpha = 0.18 + a * 0.62
  return { backgroundColor: pct >= 0 ? `rgba(34,197,94,${alpha})` : `rgba(244,63,94,${alpha})` }
}

const fmtPct = (p) => `${p > 0 ? '+' : ''}${p.toFixed(1)}%`

// Monthly heatmap of daily portfolio returns. `scope` is 'total' (all
// portfolios combined) or a portfolio id. Values come from daily snapshots in
// the primary currency; market-closed days and days with no snapshot show "-".
export default function InvestmentCalendar({ snapshots, scope, language }) {
  const returns = useMemo(() => dailyReturns(snapshots, scope), [snapshots, scope])
  const earliest = useMemo(() => earliestDate(snapshots, scope), [snapshots, scope])

  const [view, setView] = useState(() => dayjs().startOf('month'))
  const ym = view.format('YYYY-MM')
  const today = todayISO()
  const thisMonth = dayjs().startOf('month')

  const monthPct = monthChange(snapshots, scope, ym)
  const hasAnyData = earliest != null

  const canPrev = earliest ? view.isAfter(dayjs(earliest).startOf('month')) : false
  const canNext = view.isBefore(thisMonth)

  const firstDow = view.day() // 0 Sun .. 6 Sat of the 1st
  const daysInMonth = view.daysInMonth()
  const dow = strings.invest.dow

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push({ empty: true, key: `e${i}` })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${ym}-${String(d).padStart(2, '0')}`
    const wd = dayjs(date).day()
    const isFuture = date > today
    const isToday = date === today
    const isWeekend = wd === 0 || wd === 6
    // Market-closed days (weekends) always read "-", even if a snapshot exists.
    const pct = isWeekend ? undefined : returns[date]
    cells.push({ key: date, d, isFuture, isToday, isWeekend, pct })
  }

  return (
    <Card>
      {/* Header: month nav + this-month return */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => canPrev && setView((v) => v.subtract(1, 'month'))}
          disabled={!canPrev}
          className="rounded-full p-1.5 text-muted hover:bg-surface-2 disabled:opacity-30 dark:hover:bg-surface-2"
          aria-label={strings.invest.prevMonth}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold">{monthLabel(ym, language)}</div>
          <div className="text-[11px] text-faint">
            {strings.invest.monthReturn}:{' '}
            {monthPct == null ? (
              <span>—</span>
            ) : (
              <span className={`font-bold ${monthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtPct(monthPct)}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => canNext && setView((v) => v.add(1, 'month'))}
          disabled={!canNext}
          className="rounded-full p-1.5 text-muted hover:bg-surface-2 disabled:opacity-30 dark:hover:bg-surface-2"
          aria-label={strings.invest.nextMonth}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {dow.map((w, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-faint">{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) =>
          c.empty ? (
            <div key={c.key} className="aspect-square" />
          ) : (
            <div
              key={c.key}
              style={c.pct != null && !c.isWeekend && !c.isFuture ? heatStyle(c.pct) : undefined}
              className={`flex aspect-square flex-col justify-between overflow-hidden rounded-lg p-1
                ${c.pct != null && !c.isWeekend && !c.isFuture
                  ? 'border border-white/5'
                  : 'border border-line/70 bg-canvas dark:border-line-2 dark:bg-surface-2/40'}
                ${c.isToday ? 'outline outline-2 -outline-offset-1 outline-brand-500' : ''}`}
            >
              <span className={`text-[9px] font-semibold leading-none ${
                c.pct != null && !c.isWeekend && !c.isFuture ? 'text-white/80' : 'text-faint'
              }`}>{c.d}</span>
              <span className={`text-center text-[9px] font-bold leading-none sm:text-[10px] ${
                c.isWeekend || c.isFuture ? 'text-faint dark:text-muted'
                  : c.pct != null ? 'text-white' : 'text-faint dark:text-muted'
              }`}>
                {c.isFuture ? '' : c.pct != null ? fmtPct(c.pct) : '-'}
              </span>
            </div>
          )
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-faint">
        <span>{strings.invest.down}</span>
        <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: 'rgba(244,63,94,0.8)' }} />
        <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: 'rgba(244,63,94,0.32)' }} />
        <span className="h-2.5 w-4 rounded-sm bg-surface-3 dark:bg-surface-2" />
        <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.32)' }} />
        <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.8)' }} />
        <span>{strings.invest.up}</span>
      </div>

      {!hasAnyData && (
        <p className="mt-2 text-center text-[11px] leading-relaxed text-faint">{strings.invest.noData}</p>
      )}
    </Card>
  )
}
