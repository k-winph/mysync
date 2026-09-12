import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CreditCard, CalendarClock, CircleAlert, Check } from 'lucide-react'
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

const remainingOf = (d) => d.amount * Math.max(0, (d.totalInstallments || 0) - (d.paidInstallments || 0))

function LoanCard({ loan, onEdit, onPay }) {
  const total = loan.totalInstallments || 0
  const paid = loan.paidInstallments || 0
  const pct = total > 0 ? (paid / total) * 100 : 0
  const remaining = remainingOf(loan)
  const days = daysUntil(loan.dueDate)
  const overdue = days < 0
  const soon = days >= 0 && days <= 7
  const tone = overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-500'

  return (
    <Card className="space-y-3">
      <button onClick={() => onEdit(loan)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">{loan.creditor}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              <MoneyText satang={loan.amount} /> · {strings.debt.freq[loan.frequency] || strings.debt.freq.monthly}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">{strings.debt.remainingBalance}</div>
            <MoneyText satang={remaining} className="font-bold" />
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-brand-600">{strings.debt.installmentOf(paid, total)}</span>
            <span className="text-slate-400">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>

        <div className={`mt-2 flex items-center gap-1 text-xs ${tone}`}>
          {overdue ? <CircleAlert size={13} /> : <CalendarClock size={13} />}
          {strings.debt.nextDue}: {formatDate(loan.dueDate)}
          <span className="text-slate-400">
            · {overdue ? strings.debt.overdue : strings.debt.dueInDays(days)}
          </span>
        </div>
      </button>

      <button
        onClick={() => onPay(loan.id)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2
          text-sm font-semibold text-brand-700 hover:bg-brand-100
          dark:bg-brand-600/15 dark:text-brand-300 dark:hover:bg-brand-600/25"
      >
        <Check size={16} /> {strings.debt.payInstallment}
      </button>
    </Card>
  )
}

export default function Installments() {
  const navigate = useNavigate()
  const debts = useStore((s) => s.debts)
  const payInstallment = useStore((s) => s.payInstallment)
  const primary = useStore((s) => s.settings.primaryCurrency)
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { active, done, totalRemaining } = useMemo(() => {
    const all = debts.filter((d) => d.kind === 'installment')
    const isDone = (d) => (d.paidInstallments || 0) >= (d.totalInstallments || 0)
    const act = all.filter((d) => !isDone(d)).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    const fin = all.filter(isDone)
    return { active: act, done: fin, totalRemaining: act.reduce((s, d) => s + remainingOf(d), 0) }
  }, [debts])

  const handlePay = (id) => {
    const loan = active.find((x) => x.id === id)
    haptic()
    payInstallment(id)
    toast(`${strings.toast.paid} · ${formatMoney(loan?.amount || 0, primary)}`)
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
      <PageHeader icon={CreditCard} title={strings.debt.installmentTitle} subtitle={strings.pageSub.installment} onBack={() => navigate('/debt')} />

      {active.length === 0 && done.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <CreditCard size={40} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500">{strings.debt.installmentEmpty}</p>
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-4 text-white">
            <p className="text-sm opacity-80">{strings.debt.installmentTotalRemaining}</p>
            <MoneyText satang={totalRemaining} className="text-3xl font-bold" />
            {active[0] && (
              <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2 text-sm">
                <span className="flex items-center gap-1 text-white/80">
                  <CalendarClock size={13} /> {strings.debt.nextPayment}: {active[0].creditor}
                </span>
                <span className={daysUntil(active[0].dueDate) < 0 ? 'font-semibold text-rose-200' : 'font-medium text-white/90'}>
                  <MoneyText satang={active[0].amount} /> · {formatDate(active[0].dueDate)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {active.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onEdit={openEdit} onPay={handlePay} />
            ))}
          </div>

          {/* Paid-off loans (kept as history) */}
          {done.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.debt.finishedTitle}</h2>
              <Card className="divide-y divide-slate-100 dark:divide-slate-800">
                {done.map((loan) => (
                  <button
                    key={loan.id}
                    onClick={() => openEdit(loan)}
                    className="flex w-full items-center gap-3 px-2 py-2.5 text-left"
                  >
                    <Check size={16} className="shrink-0 text-green-600" />
                    <span className="flex-1 truncate font-medium text-slate-400 line-through">
                      {loan.creditor}
                    </span>
                    <span className="text-xs font-medium text-green-600">{strings.debt.paidOff}</span>
                  </button>
                ))}
              </Card>
            </div>
          )}
        </>
      )}

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.debt.installmentTitle}
      >
        <Plus size={26} />
      </button>

      <DebtModal
        open={modalOpen}
        editing={editing}
        defaultKind="installment"
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
