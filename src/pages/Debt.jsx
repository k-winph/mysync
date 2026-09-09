import { useMemo, useState } from 'react'
import { Plus, Check, CircleAlert, CalendarClock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, daysUntil } from '../utils/date'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DebtModal from '../components/DebtModal'

// Due-status label + color for an unpaid debt.
function dueStatus(dueDate) {
  const d = daysUntil(dueDate)
  if (d === null) return { label: '', tone: 'slate', urgent: false }
  if (d < 0) return { label: strings.debt.overdue, tone: 'red', urgent: true }
  if (d <= 7) return { label: strings.debt.dueInDays(d), tone: 'amber', urgent: true }
  return { label: strings.debt.dueInDays(d), tone: 'slate', urgent: false }
}

const TONE = {
  red: 'text-red-600',
  amber: 'text-amber-600',
  slate: 'text-slate-500',
}

function DebtRow({ debt, onEdit, onToggle }) {
  const status = dueStatus(debt.dueDate)
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      {/* Paid toggle */}
      <button
        onClick={() => onToggle(debt.id)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          debt.isPaid
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-slate-300 dark:border-slate-600'
        }`}
        aria-label={debt.isPaid ? strings.debt.markUnpaid : strings.debt.markPaid}
      >
        {debt.isPaid && <Check size={14} />}
      </button>

      {/* Info (tap to edit) */}
      <button onClick={() => onEdit(debt)} className="min-w-0 flex-1 text-left">
        <div className={`truncate font-medium ${debt.isPaid ? 'text-slate-400 line-through' : ''}`}>
          {debt.creditor}
        </div>
        <div className="truncate text-xs">
          {debt.isPaid ? (
            <span className="text-green-600">{strings.debt.paid}</span>
          ) : (
            <span className={`inline-flex items-center gap-1 ${TONE[status.tone]}`}>
              {status.urgent &&
                (status.tone === 'red' ? <CircleAlert size={12} /> : <CalendarClock size={12} />)}
              {status.label} · {formatDate(debt.dueDate)}
            </span>
          )}
          {debt.note ? <span className="text-slate-400"> · {debt.note}</span> : ''}
        </div>
      </button>

      <MoneyText
        satang={debt.amount}
        className={`shrink-0 font-semibold ${debt.isPaid ? 'text-slate-400 line-through' : ''}`}
      />
    </div>
  )
}

export default function Debt() {
  const debts = useStore((s) => s.debts)
  const toggleDebtPaid = useStore((s) => s.toggleDebtPaid)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { unpaid, paid, totalOutstanding } = useMemo(() => {
    const unpaidList = debts
      .filter((d) => !d.isPaid)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    const paidList = debts.filter((d) => d.isPaid)
    const total = unpaidList.reduce((s, d) => s + d.amount, 0)
    return { unpaid: unpaidList, paid: paidList, totalOutstanding: total }
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
      <h1 className="text-2xl font-bold">{strings.debt.title}</h1>

      {/* Total outstanding */}
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <p className="text-sm opacity-80">{strings.debt.totalOutstanding}</p>
        <MoneyText satang={totalOutstanding} className="text-3xl font-bold" />
      </Card>

      {debts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center
          text-sm text-slate-500 dark:border-slate-700">
          {strings.debt.empty}
        </div>
      ) : (
        <>
          {/* Unpaid */}
          {unpaid.length > 0 ? (
            <Card className="divide-y divide-slate-100 dark:divide-slate-800">
              {unpaid.map((d) => (
                <DebtRow key={d.id} debt={d} onEdit={openEdit} onToggle={toggleDebtPaid} />
              ))}
            </Card>
          ) : (
            <Card className="text-center text-sm font-medium text-green-600">
              {strings.debt.allPaid}
            </Card>
          )}

          {/* Paid */}
          {paid.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.debt.paid}</h2>
              <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                {paid.map((d) => (
                  <DebtRow key={d.id} debt={d} onEdit={openEdit} onToggle={toggleDebtPaid} />
                ))}
              </Card>
            </div>
          )}
        </>
      )}

      {/* Floating add */}
      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.debt.addTitle}
      >
        <Plus size={26} />
      </button>

      <DebtModal
        open={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
