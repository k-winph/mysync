import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check, CircleAlert, CalendarClock, Repeat, CreditCard, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, daysUntil } from '../utils/date'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DebtModal from '../components/DebtModal'

function dueStatus(dueDate) {
  const d = daysUntil(dueDate)
  if (d === null) return { label: '', tone: 'slate', urgent: false }
  if (d < 0) return { label: strings.debt.overdue, tone: 'red', urgent: true }
  if (d <= 7) return { label: strings.debt.dueInDays(d), tone: 'amber', urgent: true }
  return { label: strings.debt.dueInDays(d), tone: 'slate', urgent: false }
}

const TONE = { red: 'text-red-600', amber: 'text-amber-600', slate: 'text-slate-500' }

const SORTS = {
  dueSoon: (a, b) => (a.dueDate < b.dueDate ? -1 : 1),
  dueLate: (a, b) => (a.dueDate > b.dueDate ? -1 : 1),
  expensive: (a, b) => b.amount - a.amount,
  cheap: (a, b) => a.amount - b.amount,
}

// Remaining balance of an installment loan (per-installment × installments left).
const remainingOf = (d) => d.amount * Math.max(0, (d.totalInstallments || 0) - (d.paidInstallments || 0))
const isInstallmentDone = (d) => (d.paidInstallments || 0) >= (d.totalInstallments || 0)

function DebtRow({ debt, onEdit, onPay, onUnpay }) {
  const status = dueStatus(debt.dueDate)
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <button
        onClick={() => (debt.isPaid ? onUnpay(debt.id) : onPay(debt.id))}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          debt.isPaid ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 dark:border-slate-600'
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

// A tappable summary card that leads to a sub-page (recurring / installments).
function SummaryCard({ icon: Icon, title, count, totalLabel, total, next, onOpen }) {
  return (
    <button onClick={onOpen} className="block w-full text-left">
      <Card className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-brand-600" />
          <span className="flex-1 text-sm font-semibold text-slate-500">{title}</span>
          <span className="text-xs text-slate-400">{strings.debt.countItems(count)}</span>
          <ChevronRight size={16} className="text-slate-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">{totalLabel}</span>
          <MoneyText satang={total} className="text-xl font-bold" />
        </div>
        {next && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm dark:border-slate-800">
            <span className="flex items-center gap-1 text-slate-500">
              <CalendarClock size={13} /> {strings.debt.nextDue}: {next.creditor}
            </span>
            <span className="font-medium">
              <MoneyText satang={next.amount} /> · {formatDate(next.dueDate)}
            </span>
          </div>
        )}
      </Card>
    </button>
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

  const data = useMemo(() => {
    const once = debts.filter((d) => (d.kind || 'once') === 'once')
    const recurring = debts.filter((d) => d.kind === 'recurring')
    const installments = debts.filter((d) => d.kind === 'installment')
    const activeInst = installments.filter((d) => !isInstallmentDone(d))

    const unpaid = once.filter((d) => !d.isPaid).sort(SORTS[sortKey])
    const paid = once.filter((d) => d.isPaid)

    const onceOutstanding = unpaid.reduce((s, d) => s + d.amount, 0)
    const instRemaining = activeInst.reduce((s, d) => s + remainingOf(d), 0)

    const nearest = (list) => [...list].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))[0] || null

    return {
      once,
      unpaid,
      paid,
      recurring,
      installmentsActive: activeInst,
      totalOutstanding: onceOutstanding + instRemaining,
      recurringTotal: recurring.reduce((s, d) => s + d.amount, 0),
      recurringNext: nearest(recurring),
      instRemaining,
      instNext: nearest(activeInst),
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

  const nothing =
    data.once.length === 0 && data.recurring.length === 0 && data.installmentsActive.length === 0

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{strings.debt.title}</h1>

      {/* Total outstanding = one-time debts + installment remaining balances */}
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <p className="text-sm opacity-80">{strings.debt.totalOutstanding}</p>
        <MoneyText satang={data.totalOutstanding} className="text-3xl font-bold" />
      </Card>

      {/* Recurring + Installment summary cards */}
      {data.recurring.length > 0 && (
        <SummaryCard
          icon={Repeat}
          title={strings.debt.recurringTitle}
          count={data.recurring.length}
          totalLabel={strings.debt.recurringTotal}
          total={data.recurringTotal}
          next={data.recurringNext}
          onOpen={() => navigate('/debt/recurring')}
        />
      )}
      {data.installmentsActive.length > 0 && (
        <SummaryCard
          icon={CreditCard}
          title={strings.debt.installmentTitle}
          count={data.installmentsActive.length}
          totalLabel={strings.debt.installmentTotalRemaining}
          total={data.instRemaining}
          next={data.instNext}
          onOpen={() => navigate('/debt/installments')}
        />
      )}

      {nothing ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center
          text-sm text-slate-500 dark:border-slate-700">
          {strings.debt.empty}
        </div>
      ) : (
        data.once.length > 0 && (
          <>
            {data.unpaid.length > 1 && (
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

            {data.unpaid.length > 0 ? (
              <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.unpaid.map((d) => (
                  <DebtRow key={d.id} debt={d} onEdit={openEdit} onPay={payDebt} onUnpay={unpayDebt} />
                ))}
              </Card>
            ) : (
              <Card className="text-center text-sm font-medium text-green-600">
                {strings.debt.allPaid}
              </Card>
            )}

            {data.paid.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.debt.paid}</h2>
                <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.paid.map((d) => (
                    <DebtRow key={d.id} debt={d} onEdit={openEdit} onPay={payDebt} onUnpay={unpayDebt} />
                  ))}
                </Card>
              </div>
            )}
          </>
        )
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
        defaultKind="once"
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
