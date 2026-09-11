import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Repeat, CalendarClock, CircleAlert, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, daysUntil } from '../utils/date'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DebtModal from '../components/DebtModal'

// One card per subscription: name, amount + cycle, next due, pay button.
function SubCard({ sub, onEdit, onPay }) {
  const days = daysUntil(sub.dueDate)
  const overdue = days < 0
  const soon = days >= 0 && days <= 7
  const tone = overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-500'

  return (
    <Card className="space-y-3">
      <button onClick={() => onEdit(sub)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">{sub.creditor}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-600">
              <Repeat size={12} /> {strings.debt.recur[sub.recurrence]}
            </div>
          </div>
          <MoneyText satang={sub.amount} className="shrink-0 font-bold" />
        </div>
        <div className={`mt-2 flex items-center gap-1 text-xs ${tone}`}>
          {overdue ? <CircleAlert size={13} /> : <CalendarClock size={13} />}
          {strings.debt.nextDue}: {formatDate(sub.dueDate)}
          <span className="text-slate-400">
            · {overdue ? strings.debt.overdue : strings.debt.dueInDays(days)}
          </span>
        </div>
      </button>
      <button
        onClick={() => onPay(sub.id)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2
          text-sm font-semibold text-brand-700 hover:bg-brand-100
          dark:bg-brand-600/15 dark:text-brand-300 dark:hover:bg-brand-600/25"
      >
        <Check size={16} /> {strings.debt.payPeriod}
      </button>
    </Card>
  )
}

export default function Subscriptions() {
  const navigate = useNavigate()
  const debts = useStore((s) => s.debts)
  const paySubscription = useStore((s) => s.paySubscription)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { subs, total } = useMemo(() => {
    const list = debts
      .filter((d) => (d.recurrence || 'none') !== 'none')
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    return { subs: list, total: list.reduce((s, d) => s + d.amount, 0) }
  }, [debts])

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (d) => {
    setEditing(d)
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/debt')}
          className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="flex-1 text-2xl font-bold">{strings.debt.subsTitle}</h1>
      </div>

      {subs.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <Repeat size={40} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500">{strings.debt.subsEmpty}</p>
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <p className="text-sm opacity-80">{strings.debt.subsTotal}</p>
            <MoneyText satang={total} className="text-3xl font-bold" />
            <p className="mt-1 text-xs opacity-80">{strings.debt.subsCount(subs.length)}</p>
          </div>

          <div className="space-y-3">
            {subs.map((s) => (
              <SubCard key={s.id} sub={s} onEdit={openEdit} onPay={paySubscription} />
            ))}
          </div>
        </>
      )}

      {/* Floating add — new debt preset to a monthly subscription */}
      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.debt.subsTitle}
      >
        <Plus size={26} />
      </button>

      <DebtModal
        open={modalOpen}
        editing={editing}
        defaultRecurrence="monthly"
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
