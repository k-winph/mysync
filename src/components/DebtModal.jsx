import { useState, useMemo } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput } from '../utils/money'
import { todayISO } from '../utils/date'
import Modal from './ui/Modal'
import Button from './ui/Button'
import MoneyInput, { formatMoneyInput } from './ui/MoneyInput'
import CategoryIcon from './CategoryIcon'

const RECUR_OPTIONS = ['none', 'weekly', 'monthly', 'yearly']

// Add / edit / delete a single debt. `editing` = debt object or null for new.
// `defaultRecurrence` presets the repeat cycle for new debts (the Subscriptions
// page opens this with 'monthly').
export default function DebtModal({ open, editing, defaultRecurrence = 'none', onClose }) {
  const addDebt = useStore((s) => s.addDebt)
  const updateDebt = useStore((s) => s.updateDebt)
  const deleteDebt = useStore((s) => s.deleteDebt)
  const categories = useStore((s) => s.categories)
  const tagList = useStore((s) => s.tags)
  const addTag = useStore((s) => s.addTag)

  const [creditor, setCreditor] = useState(editing?.creditor || '')
  const [amount, setAmount] = useState(editing ? formatMoneyInput(satangToInput(editing.amount)) : '')
  const [dueDate, setDueDate] = useState(editing?.dueDate || todayISO())
  const [recurrence, setRecurrence] = useState(editing?.recurrence || defaultRecurrence)
  const [categoryId, setCategoryId] = useState(editing?.categoryId || '')
  const [selectedTags, setSelectedTags] = useState(editing?.tags || [])
  const [addingTag, setAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [note, setNote] = useState(editing?.note || '')
  const [error, setError] = useState('')

  // Debts are money going out -> only expense categories make sense.
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories]
  )

  const toggleTag = (name) =>
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    )

  const handleAddNewTag = () => {
    const name = addTag(newTag)
    if (name && !selectedTags.includes(name)) setSelectedTags((prev) => [...prev, name])
    setNewTag('')
    setAddingTag(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const satang = parseMoney(amount)
    if (!creditor.trim()) return setError(strings.debt.creditor)
    if (satang <= 0) return setError(strings.debt.amount + ' > 0')
    const data = {
      creditor: creditor.trim(),
      amount: satang,
      dueDate,
      recurrence,
      categoryId,
      tags: selectedTags,
      note: note.trim(),
    }
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
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            className="input-base text-lg font-semibold"
          />
        </div>

        {/* Repeat cycle — 'none' = one-time debt, anything else = subscription */}
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.debt.repeat}</label>
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {RECUR_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                  recurrence === r
                    ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700'
                    : 'text-slate-500'
                }`}
              >
                {strings.debt.recur[r]}
              </button>
            ))}
          </div>
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

        {/* Category (used for the expense created when the debt is paid) */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.debt.category}{' '}
            <span className="font-normal text-slate-400">({strings.common.optional})</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {expenseCategories.map((c) => {
              const active = c.id === categoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(active ? '' : c.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] transition ${
                    active
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    <CategoryIcon name={c.icon} size={16} />
                  </span>
                  <span className="w-full truncate text-center">{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.debt.tags}{' '}
            <span className="font-normal text-slate-400">({strings.common.optional})</span>
          </label>
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
            {tagList.map((t) => {
              const active = selectedTags.includes(t.name)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.name)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                  }`}
                >
                  #{t.name}
                </button>
              )
            })}
            {addingTag ? (
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddNewTag()
                  }
                }}
                onBlur={handleAddNewTag}
                placeholder={strings.tx.newTag}
                autoFocus
                className="w-28 shrink-0 rounded-full border border-brand-500 bg-white px-3 py-1.5
                  text-sm outline-none dark:bg-slate-900"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingTag(true)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-dashed
                  border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-500 dark:border-slate-600"
              >
                <Plus size={14} /> {strings.common.add}
              </button>
            )}
          </div>
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
