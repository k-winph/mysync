import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Repeat, CalendarClock, CircleAlert, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, daysUntil } from '../utils/date'
import { formatMoney } from '../utils/money'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DebtModal from '../components/DebtModal'
import PageHeader from '../components/PageHeader'
import { useToast } from '../components/ui/Feedback'
import { haptic } from '../utils/haptics'

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
  const primary = useStore((s) => s.settings.primaryCurrency)
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { items, total } = useMemo(() => {
    const list = debts
      .filter((d) => d.kind === 'recurring')
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    return { items: list, total: list.reduce((s, d) => s + d.amount, 0) }
  }, [debts])

  const handlePay = (id) => {
    const it = items.find((x) => x.id === id)
    haptic()
    payRecurring(id)
    toast(`${strings.toast.paid} · ${formatMoney(it?.amount || 0, primary)}`)
  }

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
      <PageHeader icon={Repeat} title={strings.debt.recurringTitle} subtitle={strings.pageSub.recurring} onBack={() => navigate('/debt')} />

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <Repeat size={40} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500">{strings.debt.recurringEmpty}</p>
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-4 text-white">
            <p className="text-sm opacity-80">{strings.debt.recurringTotal}</p>
            <MoneyText satang={total} className="text-3xl font-bold" />
            {items[0] && (
              <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2 text-sm">
                <span className="flex items-center gap-1 text-white/80">
                  <CalendarClock size={13} /> {strings.debt.nextPayment}: {items[0].creditor}
                </span>
                <span className={daysUntil(items[0].dueDate) < 0 ? 'font-semibold text-rose-200' : 'font-medium text-white/90'}>
                  <MoneyText satang={items[0].amount} /> · {formatDate(items[0].dueDate)}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {items.map((it) => (
              <RecurringCard key={it.id} item={it} onEdit={openEdit} onPay={handlePay} />
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
