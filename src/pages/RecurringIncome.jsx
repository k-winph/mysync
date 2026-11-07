import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CalendarArrowUp, CalendarClock, Repeat } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, addPeriod } from '../utils/date'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import MoneyText from '../components/MoneyText'
import PageHeader from '../components/PageHeader'
import RecurringIncomeModal from '../components/RecurringIncomeModal'

// Roughly normalise any frequency to a monthly figure, so the summary total
// is comparable across weekly / monthly / yearly incomes.
const MONTHLY_FACTOR = { weekly: 52 / 12, monthly: 1, yearly: 1 / 12 }
const monthlyEquivalent = (r) => Math.round(r.amount * (MONTHLY_FACTOR[r.frequency] || 1))

function IncomeCard({ item, onEdit }) {
  return (
    <button onClick={() => onEdit(item)} className="block w-full text-left">
      <Card className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">{item.name}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-green-600">
              <Repeat size={12} /> {strings.debt.freq[item.frequency] || strings.debt.freq.monthly}
            </div>
          </div>
          <MoneyText satang={item.amount} className="shrink-0 font-bold text-green-600" />
        </div>
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800">
          <CalendarClock size={13} /> {strings.recIncome.next}: {formatDate(item.nextDate)}
        </div>
      </Card>
    </button>
  )
}

export default function RecurringIncome() {
  const navigate = useNavigate()
  const recurringIncomes = useStore((s) => s.recurringIncomes)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { items, monthlyTotal, next } = useMemo(() => {
    const list = [...recurringIncomes].sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1))
    return {
      items: list,
      monthlyTotal: list.reduce((s, r) => s + monthlyEquivalent(r), 0),
      next: list[0] || null,
    }
  }, [recurringIncomes])

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (r) => {
    setEditing(r)
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={CalendarArrowUp}
        title={strings.recIncome.title}
        subtitle={strings.pageSub.recIncome}
        onBack={() => navigate('/transactions')}
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarArrowUp}
            title={strings.recIncome.emptyTitle}
            message={strings.recIncome.empty}
          />
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white">
            <p className="text-sm opacity-80">{strings.recIncome.monthlyTotal}</p>
            <MoneyText satang={monthlyTotal} className="text-3xl font-bold" />
            {next && (
              <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-2 text-sm">
                <span className="flex items-center gap-1 text-white/80">
                  <CalendarClock size={13} /> {strings.recIncome.next}: {next.name}
                </span>
                <span className="font-medium text-white/90">
                  <MoneyText satang={next.amount} /> · {formatDate(next.nextDate)}
                </span>
              </div>
            )}
          </div>
          <p className="px-1 text-xs text-slate-400">{strings.recIncome.autoNote}</p>
          <div className="space-y-3">
            {items.map((it) => (
              <IncomeCard key={it.id} item={it} onEdit={openEdit} />
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
        aria-label={strings.recIncome.addTitle}
      >
        <Plus size={26} />
      </button>

      <RecurringIncomeModal
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
