import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check, CircleAlert, CalendarClock, Repeat, ChevronRight } from 'lucide-react'
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

// Sort comparators for the (one-time) debt list.
const SORTS = {
  dueSoon: (a, b) => (a.dueDate < b.dueDate ? -1 : 1),
  dueLate: (a, b) => (a.dueDate > b.dueDate ? -1 : 1),
  expensive: (a, b) => b.amount - a.amount,
  cheap: (a, b) => a.amount - b.amount,
}

function DebtRow({ debt, onEdit, onPay, onUnpay }) {
  const status = dueStatus(debt.dueDate)
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      {/* Paid toggle -> logs / removes an expense */}
      <button
        onClick={() => (debt.isPaid ? onUnpay(debt.id) : onPay(debt.id))}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          debt.isPaid
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-slate-300 dark:border-slate-600'
        }`}
        aria-label={debt.isPaid ? strings.debt.markUnpaid : strings.debt.markPaid}
      >
        {debt.isPaid && <Check size={14} />}
      </button>

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
  const payDebt = useStore((s) => s.payDebt)
  const unpayDebt = useStore((s) => s.unpayDebt)
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [sortKey, setSortKey] = useState('dueSoon')

  // Split one-time debts from subscriptions (recurrence !== 'none').
  const { unpaid, paid, totalOutstanding, subs, subsTotal, nextSub } = useMemo(() => {
    const oneTime = debts.filter((d) => (d.recurrence || 'none') === 'none')
    const subList = debts.filter((d) => (d.recurrence || 'none') !== 'none')
    const unpaidList = oneTime.filter((d) => !d.isPaid).sort(SORTS[sortKey])
    const paidList = oneTime.filter((d) => d.isPaid)
    const total = unpaidList.reduce((s, d) => s + d.amount, 0)
    const sTotal = subList.reduce((s, d) => s + d.amount, 0)
    const next = [...subList].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))[0] || null
    return {
      unpaid: unpaidList,
      paid: paidList,
      totalOutstanding: total,
      subs: subList,
      subsTotal: sTotal,
      nextSub: next,
    }
  }, [debts, sortKey])

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (d) => {
    setEditing(d)
    setModalOpen(true)
  }

  const oneTimeCount = unpaid.length + paid.length

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{strings.debt.title}</h1>

      {/* Total outstanding — one-time debts only */}
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <p className="text-sm opacity-80">{strings.debt.totalOutstanding}</p>
        <MoneyText satang={totalOutstanding} className="text-3xl font-bold" />
      </Card>

      {/* Subscriptions summary — tap to manage */}
      {subs.length > 0 && (
        <button onClick={() => navigate('/debt/subscriptions')} className="block w-full text-left">
          <Card className="space-y-2">
            <div className="flex items-center gap-2">
              <Repeat size={18} className="text-brand-600" />
              <span className="flex-1 text-sm font-semibold text-slate-500">
                {strings.debt.subsTitle}
              </span>
              <span className="text-xs text-slate-400">{strings.debt.subsCount(subs.length)}</span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">{strings.debt.subsTotal}</span>
              <MoneyText satang={subsTotal} className="text-xl font-bold" />
            </div>
            {nextSub && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm dark:border-slate-800">
                <span className="flex items-center gap-1 text-slate-500">
                  <CalendarClock size={13} /> {strings.debt.nextDue}: {nextSub.creditor}
                </span>
                <span className="font-medium">
                  <MoneyText satang={nextSub.amount} /> · {formatDate(nextSub.dueDate)}
                </span>
              </div>
            )}
          </Card>
        </button>
      )}

      {oneTimeCount === 0 ? (
        subs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center
            text-sm text-slate-500 dark:border-slate-700">
            {strings.debt.empty}
          </div>
        )
      ) : (
        <>
          {/* Sort control (only worth showing with a couple of items) */}
          {unpaid.length > 1 && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-slate-500">{strings.debt.sortLabel}</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm
                  dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="dueSoon">{strings.debt.sortDueSoon}</option>
                <option value="dueLate">{strings.debt.sortDueLate}</option>
                <option value="expensive">{strings.debt.sortExpensive}</option>
                <option value="cheap">{strings.debt.sortCheap}</option>
              </select>
            </div>
          )}

          {unpaid.length > 0 ? (
            <Card className="divide-y divide-slate-100 dark:divide-slate-800">
              {unpaid.map((d) => (
                <DebtRow key={d.id} debt={d} onEdit={openEdit} onPay={payDebt} onUnpay={unpayDebt} />
              ))}
            </Card>
          ) : (
            <Card className="text-center text-sm font-medium text-green-600">
              {strings.debt.allPaid}
            </Card>
          )}

          {paid.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.debt.paid}</h2>
              <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                {paid.map((d) => (
                  <DebtRow key={d.id} debt={d} onEdit={openEdit} onPay={payDebt} onUnpay={unpayDebt} />
                ))}
              </Card>
            </div>
          )}
        </>
      )}

      {/* Floating add (one-time debt) */}
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
