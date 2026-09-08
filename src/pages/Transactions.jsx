import { useMemo, useState } from 'react'
import { Plus, Trash2, SlidersHorizontal } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate } from '../utils/date'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'
import CategoryManager from '../components/CategoryManager'

export default function Transactions() {
  const transactions = useStore((s) => s.transactions)
  const addTransaction = useStore((s) => s.addTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const deleteTransaction = useStore((s) => s.deleteTransaction)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // tx being edited, or null for new
  const [catOpen, setCatOpen] = useState(false)

  // Group transactions by date (newest first) for a clean list.
  const grouped = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1))
    const groups = {}
    for (const t of sorted) {
      ;(groups[t.date] ||= []).push(t)
    }
    return Object.entries(groups)
  }, [transactions])

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (tx) => {
    setEditing(tx)
    setFormOpen(true)
  }

  const handleSubmit = (data) => {
    if (editing) updateTransaction(editing.id, data)
    else addTransaction(data)
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = () => {
    if (editing && window.confirm(strings.tx.deleteConfirm)) {
      deleteTransaction(editing.id)
      setFormOpen(false)
      setEditing(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{strings.nav.transactions}</h1>
        <button
          onClick={() => setCatOpen(true)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={strings.category.manage}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center
          text-sm text-slate-500 dark:border-slate-700">
          {strings.tx.empty}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {formatDate(date)}
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white p-1
                dark:border-slate-800 dark:bg-slate-900">
                {items.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} onEdit={openEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.tx.addTitle}
      >
        <Plus size={26} />
      </button>

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        title={editing ? strings.tx.editTitle : strings.tx.addTitle}
      >
        <TransactionForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
        {editing && (
          <Button variant="danger" className="mt-3 w-full" onClick={handleDelete}>
            <Trash2 size={18} /> {strings.common.delete}
          </Button>
        )}
      </Modal>

      {/* Category manager modal */}
      <CategoryManager open={catOpen} onClose={() => setCatOpen(false)} />
    </div>
  )
}
