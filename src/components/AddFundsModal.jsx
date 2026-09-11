import { useState } from 'react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, formatMoney } from '../utils/money'
import Modal from './ui/Modal'
import Button from './ui/Button'
import MoneyInput from './ui/MoneyInput'

// Quick "add money" sheet for a savings goal. Adds to currentAmount (clamped
// at 0 in the store). Corrections/withdrawals go through editing the goal.
export default function AddFundsModal({ open, goal, onClose }) {
  const addToGoal = useStore((s) => s.addToGoal)
  const primary = useStore((s) => s.settings.primaryCurrency)
  const [amount, setAmount] = useState('')

  if (!goal) return null

  const submit = (e) => {
    e.preventDefault()
    const cents = parseMoney(amount)
    if (cents > 0) addToGoal(goal.id, cents)
    setAmount('')
    onClose()
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <Modal open={open} onClose={onClose} title={strings.savings.addFundsTitle}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-500">{goal.name}</p>
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.savings.addFunds}</label>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            className="input-base"
            autoFocus
          />
          {remaining > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {formatMoney(remaining, primary)} {strings.savings.toGo}
            </p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {strings.common.cancel}
          </Button>
          <Button type="submit" className="flex-1">
            {strings.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
