import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Repeat, CalendarClock, CircleAlert, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, daysUntil } from '../utils/date'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DebtModal from '../components/DebtModal'

function RecurringCard({ item, onEdit, onPay }) {
  const days = daysUntil(item.dueDate)
  const overdue = days < 0
  const soon = days >= 0 && days <= 7
  const tone = overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-500'
  return (
    <Card className="space-y-3">
      <button onClick={() => onEdit(item)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">{item.creditor}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-600">
              <Repeat size={12} /> {strings.debt.freq[item.frequency] || strings.debt.freq.monthly}
            </div>
          </div>
          <MoneyText satang={item.amount} className="shrink-0 font-bold" />
        </div>
        <div className={`mt-2 flex items-center gap-1 text-xs ${tone}`}>
          {overdue ? <CircleAlert size={13} /> : <CalendarClock size={13} />}
          {strings.debt.nextDue}: {formatDate(item.dueDate)}
          <span className="text-slate-400">
            · {overdue ? strings.debt.overdue : strings.debt.dueInDays(days)}
          </span>
        </div>
      </button>
      <button
        onClick={() => onPay(item.id)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2
          text-sm font-semibold text-brand-700 hover:bg-brand-100
          dark:bg-brand-600/15 dark:text-brand-300 dark:hover:bg-brand-600/25"
      >
        <Check size={16} /> {strings.debt.payPeriod}
      </button>
    </Card>
  )
}

export default function Recurring() {
  const navigate = useNavigate()
  const debts = useStore((s) => s.debts)
  const payRecurring = useStore((s) => s.payRecurring)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { items, total } = useMemo(() => {
    const list = debts
      .filter((d) => d.kind === 'recurring')
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    return { items: list, total: list.reduce((s, d) => s + d.amount, 0) }
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
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/debt')}
          className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="flex-1 text-2xl font-bold">{strings.debt.recurringTitle}</h1>
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <Repeat size={40} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500">{strings.debt.recurringEmpty}</p>
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <p className="text-sm opacity-80">{strings.debt.recurringTotal}</p>
            <MoneyText satang={total} className="text-3xl font-bold" />
            <p className="mt-1 text-xs opacity-80">{strings.debt.countItems(items.length)}</p>
          </div>
          <div className="space-y-3">
            {items.map((it) => (
              <RecurringCard key={it.id} item={it} onEdit={openEdit} onPay={payRecurring} />
            ))}
          </div>
        </>
      )}

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.debt.recurringTitle}
      >
        <Plus size={26} />
      </button>

      <DebtModal
        open={modalOpen}
        editing={editing}
        defaultKind="recurring"
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
