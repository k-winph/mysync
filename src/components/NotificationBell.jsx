import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarClock, CircleAlert, Save } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { daysUntil, formatDate } from '../utils/date'
import MoneyText from './MoneyText'

const DUE_WINDOW = 14 // days ahead to start warning

// A debt/period is "active" (still owed) if it's not paid/finished.
function isActive(d) {
  const kind = d.kind || 'once'
  if (kind === 'once') return !d.isPaid
  if (kind === 'installment') return (d.paidInstallments || 0) < (d.totalInstallments || 0)
  return true // recurring never ends
}

const routeFor = (d) =>
  d.kind === 'recurring' ? '/debt/recurring' : d.kind === 'installment' ? '/debt/installments' : '/debt'

// Bell button + dropdown panel that gathers all current alerts (due/overdue
// debts of any kind + a stale-backup reminder). Alerts are derived live from
// the data — there's no stored read/unread state, just a count of what's active.
export default function NotificationBell() {
  const navigate = useNavigate()
  const debts = useStore((s) => s.debts)
  const lastBackupAt = useStore((s) => s.settings.lastBackupAt)
  const txCount = useStore((s) => s.transactions.length)
  const [open, setOpen] = useState(false)

  const notifs = useMemo(() => {
    const list = []
    for (const d of debts) {
      if (!isActive(d)) continue
      const dd = daysUntil(d.dueDate)
      if (dd === null || dd > DUE_WINDOW) continue
      list.push({
        id: 'debt-' + d.id,
        type: 'debt',
        dueDate: d.dueDate,
        overdue: dd < 0,
        dd,
        title: d.creditor,
        amount: d.amount,
        route: routeFor(d),
      })
    }
    list.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))

    const daysSinceBackup = lastBackupAt ? -daysUntil(lastBackupAt) : Infinity
    if (txCount > 0 && daysSinceBackup >= 14) {
      list.push({ id: 'backup', type: 'backup', route: '/settings' })
    }
    return list
  }, [debts, lastBackupAt, txCount])

  const go = (route) => {
    setOpen(false)
    navigate(route)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={strings.notifCenter.aria}
      >
        <Bell size={22} />
        {notifs.length > 0 && (
          <span
            className="absolute -right-0 -top-0 flex h-4 min-w-4 items-center justify-center rounded-full
              bg-red-600 px-1 text-[10px] font-bold text-white"
          >
            {notifs.length > 9 ? '9+' : notifs.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside tap */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden
              rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold dark:border-slate-800">
              {strings.notifCenter.title}
            </div>

            {notifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">{strings.notifCenter.empty}</p>
            ) : (
              <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {notifs.map((n) =>
                  n.type === 'backup' ? (
                    <button
                      key={n.id}
                      onClick={() => go(n.route)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Save size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{strings.reminder.backupTitle}</div>
                        <div className="text-xs text-slate-500">{strings.reminder.backupBody}</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      key={n.id}
                      onClick={() => go(n.route)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {n.overdue ? (
                        <CircleAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
                      ) : (
                        <CalendarClock size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{n.title}</div>
                        <div className="text-xs">
                          <span className={n.overdue ? 'text-red-600' : 'text-amber-600'}>
                            {n.overdue ? strings.debt.overdue : strings.debt.dueInDays(n.dd)}
                          </span>
                          <span className="text-slate-400"> · {formatDate(n.dueDate)}</span>
                        </div>
                      </div>
                      <MoneyText satang={n.amount} className="shrink-0 text-sm font-semibold" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
