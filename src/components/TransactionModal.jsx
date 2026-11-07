import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { addPeriod } from '../utils/date'
import Modal from './ui/Modal'
import Button from './ui/Button'
import TransactionForm from './TransactionForm'
import { Trash2 } from 'lucide-react'
import { useToast } from './ui/Feedback'

// Shared add/edit modal so both the Transactions page and the Dashboard
// quick-add can reuse the same form + save/delete logic.
// `editing` = a transaction to edit, or null/undefined to add a new one.
export default function TransactionModal({ open, editing, onClose }) {
  const addTransaction = useStore((s) => s.addTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const deleteTransaction = useStore((s) => s.deleteTransaction)
  const restoreTransaction = useStore((s) => s.restoreTransaction)
  const addRecurringIncome = useStore((s) => s.addRecurringIncome)
  const categories = useStore((s) => s.categories)
  const toast = useToast()

  // `recurring` is form-only metadata — strip it before saving the transaction.
  const handleSubmit = ({ recurring, ...data }) => {
    if (editing) {
      updateTransaction(editing.id, data)
      toast(strings.toast.updated)
    } else {
      addTransaction(data)
      if (recurring) {
        // Schedule the repeat starting NEXT cycle, so today's entry isn't
        // double-counted. Name it after the note, else the category.
        const cat = categories.find((c) => c.id === data.categoryId)
        addRecurringIncome({
          name: data.note?.trim() || cat?.name || strings.recIncome.title,
          amount: data.amount,
          frequency: recurring.frequency,
          nextDate: addPeriod(data.date, recurring.frequency),
          categoryId: data.categoryId,
          tags: data.tags,
          note: data.note,
        })
      }
      toast(recurring ? strings.tx.recurringSaved : strings.toast.saved)
    }
    onClose()
  }

  // Delete right away, but offer Undo — friendlier than a confirm dialog.
  const handleDelete = () => {
    if (!editing) return
    const tx = editing
    deleteTransaction(tx.id)
    toast(strings.toast.deleted, {
      action: { label: strings.toast.undo, onClick: () => restoreTransaction(tx) },
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? strings.tx.editTitle : strings.tx.addTitle}
    >
      <TransactionForm initial={editing} onSubmit={handleSubmit} onCancel={onClose} />
      {editing && (
        <Button variant="danger" className="mt-3 w-full" onClick={handleDelete}>
          <Trash2 size={18} /> {strings.common.delete}
        </Button>
      )}
    </Modal>
  )
}
