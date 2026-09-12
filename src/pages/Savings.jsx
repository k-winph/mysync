import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, PiggyBank, Plus as PlusIcon, CalendarClock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { daysUntil } from '../utils/date'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import GoalModal from '../components/GoalModal'
import AddFundsModal from '../components/AddFundsModal'
import PageHeader from '../components/PageHeader'

// Progress bar with a color that turns green once the goal is reached.
function ProgressBar({ pct, done }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-brand-600'}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
}

function GoalCard({ goal, onEdit, onAddFunds }) {
  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  const done = goal.currentAmount >= goal.targetAmount && goal.targetAmount > 0
  const days = goal.deadline ? daysUntil(goal.deadline) : null

  return (
    <Card className="space-y-3">
      <button onClick={() => onEdit(goal)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold">{goal.name}</span>
          <span className="text-sm font-bold tabular-nums">{pct.toFixed(0)}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar pct={pct} done={done} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <MoneyText satang={goal.currentAmount} className="font-semibold" />
          <span className="text-slate-400">
            / <MoneyText satang={goal.targetAmount} className="text-slate-400" />
          </span>
        </div>
        {done ? (
          <p className="mt-1 text-xs font-medium text-emerald-600">{strings.savings.reached}</p>
        ) : (
          goal.deadline && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <CalendarClock size={12} />
              {strings.savings.daysLeft(days)}
            </p>
          )
        )}
      </button>
      <button
        onClick={() => onAddFunds(goal)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2
          text-sm font-semibold text-brand-700 hover:bg-brand-100
          dark:bg-brand-600/15 dark:text-brand-300 dark:hover:bg-brand-600/25"
      >
        <PlusIcon size={16} /> {strings.savings.addFunds}
      </button>
    </Card>
  )
}

export default function Savings() {
  const navigate = useNavigate()
  const goals = useStore((s) => s.savingsGoals)

  const [goalModal, setGoalModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [fundsGoal, setFundsGoal] = useState(null)

  const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.currentAmount, 0), [goals])
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.targetAmount, 0), [goals])
  const totalPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const openAdd = () => {
    setEditing(null)
    setGoalModal(true)
  }
  const openEdit = (g) => {
    setEditing(g)
    setGoalModal(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader icon={PiggyBank} title={strings.savings.title} onBack={() => navigate('/')} />

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <PiggyBank size={40} className="text-slate-300 dark:text-slate-700" />
          <p className="text-sm text-slate-500">{strings.savings.empty}</p>
        </Card>
      ) : (
        <>
          {/* Total saved summary */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <p className="text-sm opacity-80">{strings.savings.totalSaved}</p>
            <MoneyText satang={totalSaved} className="text-3xl font-bold" />
            <div className="mt-3">
              <ProgressBar pct={totalPct} done={totalPct >= 100} />
            </div>
            <p className="mt-1.5 text-xs opacity-80">
              {totalPct.toFixed(0)}% · <MoneyText satang={totalTarget} className="opacity-90" />
            </p>
          </div>

          {/* Goal cards */}
          <div className="space-y-3">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} onEdit={openEdit} onAddFunds={setFundsGoal} />
            ))}
          </div>
        </>
      )}

      {/* Floating add */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600/70 text-white shadow-lg shadow-brand-600/30 backdrop-blur-md
          transition hover:bg-brand-600/90 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.savings.addGoal}
      >
        <Plus size={26} />
      </button>

      <GoalModal open={goalModal} editing={editing} onClose={() => setGoalModal(false)} />
      <AddFundsModal open={fundsGoal !== null} goal={fundsGoal} onClose={() => setFundsGoal(null)} />
    </div>
  )
}
