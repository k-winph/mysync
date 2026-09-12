import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput } from '../utils/money'
import Modal from './ui/Modal'
import Button from './ui/Button'
import MoneyInput, { formatMoneyInput } from './ui/MoneyInput'
import { useConfirm, useToast } from './ui/Feedback'

// Create / edit / delete a savings goal.
export default function GoalModal({ open, editing, onClose }) {
  const addGoal = useStore((s) => s.addGoal)
  const updateGoal = useStore((s) => s.updateGoal)
  const deleteGoal = useStore((s) => s.deleteGoal)
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState(editing?.name || '')
  const [target, setTarget] = useState(editing ? formatMoneyInput(satangToInput(editing.targetAmount)) : '')
  const [current, setCurrent] = useState(editing ? formatMoneyInput(satangToInput(editing.currentAmount)) : '')
  const [deadline, setDeadline] = useState(editing?.deadline || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const targetC = parseMoney(target)
    if (!name.trim()) return setError(strings.savings.name)
    if (targetC <= 0) return setError(strings.savings.target + ' > 0')
    const data = {
      name: name.trim(),
      targetAmount: targetC,
      currentAmount: parseMoney(current),
      deadline: deadline || null,
    }
    if (editing) updateGoal(editing.id, data)
    else addGoal(data)
    toast(editing ? strings.toast.updated : strings.toast.saved)
    onClose()
  }

  const handleDelete = async () => {
    if (!editing) return
    if (await confirm({ message: strings.savings.deleteConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deleteGoal(editing.id)
      toast(strings.toast.deleted)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? strings.savings.editGoal : strings.savings.addGoal}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.savings.name}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={strings.savings.nameHint}
            className="input-base"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">{strings.savings.target}</label>
            <MoneyInput value={target} onChange={setTarget} placeholder="0.00" className="input-base" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{strings.savings.current}</label>
            <MoneyInput value={current} onChange={setCurrent} placeholder="0.00" className="input-base" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.savings.deadline}{' '}
            <span className="font-normal text-slate-400">({strings.common.optional})</span>
          </label>
          <input
            type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
            className="input-base"
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {strings.common.cancel}
          </Button>
          <Button type="submit" className="flex-1">
            {strings.common.save}
          </Button>
        </div>
      </form>
      {editing && (
        <Button variant="danger" className="mt-3 w-full" onClick={handleDelete}>
          <Trash2 size={18} /> {strings.common.delete}
        </Button>
      )}
    </Modal>
  )
}
