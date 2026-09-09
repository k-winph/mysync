import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import Modal from './ui/Modal'
import Button from './ui/Button'
import TransactionForm from './TransactionForm'
import { Trash2 } from 'lucide-react'

// Shared add/edit modal so both the Transactions page and the Dashboard
// quick-add can reuse the same form + save/delete logic.
// `editing` = a transaction to edit, or null/undefined to add a new one.
export default function TransactionModal({ open, editing, onClose }) {
  const addTransaction = useStore((s) => s.addTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const deleteTransaction = useStore((s) => s.deleteTransaction)

  const handleSubmit = (data) => {
    if (editing) updateTransaction(editing.id, data)
    else addTransaction(data)
    onClose()
  }

  const handleDelete = () => {
    if (editing && window.confirm(strings.tx.deleteConfirm)) {
      deleteTransaction(editing.id)
      onClose()
    }
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
