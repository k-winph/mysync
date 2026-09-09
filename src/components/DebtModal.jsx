import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput } from '../utils/money'
import { todayISO } from '../utils/date'
import Modal from './ui/Modal'
import Button from './ui/Button'

// Add / edit / delete a single debt. `editing` = debt object or null for new.
export default function DebtModal({ open, editing, onClose }) {
  const addDebt = useStore((s) => s.addDebt)
  const updateDebt = useStore((s) => s.updateDebt)
  const deleteDebt = useStore((s) => s.deleteDebt)

  const [creditor, setCreditor] = useState(editing?.creditor || '')
  const [amount, setAmount] = useState(editing ? satangToInput(editing.amount) : '')
  const [dueDate, setDueDate] = useState(editing?.dueDate || todayISO())
  const [note, setNote] = useState(editing?.note || '')
  const [error, setError] = useState('')

  // Re-seed local state when the modal is reused for a different debt.
  // (Modal unmounts its children when closed, so a fresh open re-runs useState.)

  const handleSubmit = (e) => {
    e.preventDefault()
    const satang = parseMoney(amount)
    if (!creditor.trim()) return setError(strings.debt.creditor)
    if (satang <= 0) return setError(strings.debt.amount + ' > 0')
    const data = { creditor: creditor.trim(), amount: satang, dueDate, note: note.trim() }
    if (editing) updateDebt(editing.id, data)
    else addDebt(data)
    onClose()
  }

  const handleDelete = () => {
    if (editing && window.confirm(strings.debt.deleteConfirm)) {
      deleteDebt(editing.id)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? strings.debt.editTitle : strings.debt.addTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.debt.creditor}</label>
          <input
            type="text"
            value={creditor}
            onChange={(e) => setCreditor(e.target.value)}
            placeholder={strings.debt.creditorHint}
            className="input-base"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{strings.debt.amount}</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-base text-lg font-semibold"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{strings.debt.dueDate}</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.debt.note}{' '}
            <span className="font-normal text-slate-400">({strings.common.optional})</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="input-base resize-none"
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
