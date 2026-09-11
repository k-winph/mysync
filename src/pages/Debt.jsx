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

// Summary card for a sub-group. Always rendered (shows an empty prompt when the
// group has nothing), so every debt kind has a visible, tappable entry point.
function SummaryCard({ icon: Icon, title, count, totalLabel, total, next, emptyText, onOpen }) {
  const empty = count === 0
  return (
    <button onClick={onOpen} className="block w-full text-left">
      <Card className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-brand-600" />
          <span className="flex-1 text-sm font-semibold text-slate-500">{title}</span>
          {!empty && <span className="text-xs text-slate-400">{strings.debt.countItems(count)}</span>}
          <ChevronRight size={16} className="text-slate-400" />
        </div>
        {empty ? (
          <p className="text-sm text-slate-400">{emptyText}</p>
        ) : (
          <>
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
          </>
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
    const activeInst = debts.filter((d) => d.kind === 'installment' && !isInstallmentDone(d))

    const unpaid = once.filter((d) => !d.isPaid).sort(SORTS[sortKey])
    const paid = once.filter((d) => d.isPaid)

    const onceOutstanding = unpaid.reduce((s, d) => s + d.amount, 0)
    const instRemaining = activeInst.reduce((s, d) => s + remainingOf(d), 0)

    const nearest = (list) => [...list].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))[0] || null

    // Next payment = soonest due across ALL active items of any kind.
    const nextPayment = nearest([...unpaid, ...recurring, ...activeInst])

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
      nextPayment,
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

  const np = data.nextPayment
  const npOverdue = np && daysUntil(np.dueDate) < 0

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{strings.debt.title}</h1>

      {/* Total outstanding = one-time debts + installment remaining balances */}
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
        <p className="text-sm opacity-80">{strings.debt.totalOutstanding}</p>
        <MoneyText satang={data.totalOutstanding} className="text-3xl font-bold" />
        {np && (
          <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2 text-sm">
            <span className="flex items-center gap-1 text-white/80">
              <CalendarClock size={13} /> {strings.debt.nextPayment}: {np.creditor}
            </span>
            <span className={npOverdue ? 'font-semibold text-rose-200' : 'font-medium text-white/90'}>
              <MoneyText satang={np.amount} /> · {formatDate(np.dueDate)}
            </span>
          </div>
        )}
      </Card>

      {/* Recurring + Installment summary cards — always visible (tap to add) */}
      <SummaryCard
        icon={Repeat}
        title={strings.debt.recurringTitle}
        count={data.recurring.length}
        totalLabel={strings.debt.recurringTotal}
        total={data.recurringTotal}
        next={data.recurringNext}
        emptyText={strings.debt.recurringEmpty}
        onOpen={() => navigate('/debt/recurring')}
      />
      <SummaryCard
        icon={CreditCard}
        title={strings.debt.installmentTitle}
        count={data.installmentsActive.length}
        totalLabel={strings.debt.installmentTotalRemaining}
        total={data.instRemaining}
        next={data.instNext}
        emptyText={strings.debt.installmentEmpty}
        onOpen={() => navigate('/debt/installments')}
      />

      {/* One-time debts */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">{strings.debt.kindOnce}</h2>
          {data.unpaid.length > 1 && (
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
          )}
        </div>

        {data.once.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center
            text-sm text-slate-500 dark:border-slate-700">
            {strings.debt.onceEmpty}
          </div>
        ) : (
          <div className="space-y-4">
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
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {strings.debt.paid}
                </h3>
                <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.paid.map((d) => (
                    <DebtRow key={d.id} debt={d} onEdit={openEdit} onPay={payDebt} onUnpay={unpayDebt} />
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

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
