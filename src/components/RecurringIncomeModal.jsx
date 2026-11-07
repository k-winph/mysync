import { useState, useMemo, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput } from '../utils/money'
import { todayISO } from '../utils/date'
import Modal from './ui/Modal'
import Button from './ui/Button'
import MoneyInput, { formatMoneyInput } from './ui/MoneyInput'
import DateInput from './ui/DateInput'
import CategoryIcon from './CategoryIcon'
import { useConfirm, useToast } from './ui/Feedback'

const FREQS = ['weekly', 'monthly', 'yearly']

// Add / edit / delete a recurring income. Stays mounted while closed (like
// DebtModal), so every field is re-synced from `editing` on open.
export default function RecurringIncomeModal({ open, editing, onClose }) {
  const addRecurringIncome = useStore((s) => s.addRecurringIncome)
  const updateRecurringIncome = useStore((s) => s.updateRecurringIncome)
  const deleteRecurringIncome = useStore((s) => s.deleteRecurringIncome)
  const categories = useStore((s) => s.categories)
  const tagList = useStore((s) => s.tags)
  const addTag = useStore((s) => s.addTag)
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [nextDate, setNextDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [addingTag, setAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(editing?.name || '')
    setAmount(editing ? formatMoneyInput(satangToInput(editing.amount)) : '')
    setFrequency(editing?.frequency || 'monthly')
    setNextDate(editing?.nextDate || todayISO())
    setCategoryId(editing?.categoryId || '')
    setSelectedTags(editing?.tags || [])
    setNote(editing?.note || '')
    setAddingTag(false)
    setNewTag('')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income' || c.type === 'both'),
    [categories]
  )

  const toggleTag = (n) =>
    setSelectedTags((prev) => (prev.includes(n) ? prev.filter((t) => t !== n) : [...prev, n]))

  const handleAddNewTag = () => {
    const n = addTag(newTag)
    if (n && !selectedTags.includes(n)) setSelectedTags((prev) => [...prev, n])
    setNewTag('')
    setAddingTag(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const satang = parseMoney(amount)
    if (!name.trim()) return setError(strings.recIncome.name)
    if (satang <= 0) return setError(strings.recIncome.amount + ' > 0')
    const data = {
      name: name.trim(),
      amount: satang,
      frequency,
      nextDate,
      categoryId,
      tags: selectedTags,
      note: note.trim(),
    }
    if (editing) updateRecurringIncome(editing.id, data)
    else addRecurringIncome(data)
    toast(editing ? strings.toast.updated : strings.toast.saved)
    onClose()
  }

  const handleDelete = async () => {
    if (!editing) return
    if (await confirm({ message: strings.recIncome.deleteConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deleteRecurringIncome(editing.id)
      toast(strings.toast.deleted)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? strings.recIncome.editTitle : strings.recIncome.addTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.recIncome.name}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={strings.recIncome.nameHint}
            className="input-base"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{strings.recIncome.amount}</label>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            className="input-base text-lg font-semibold"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.recIncome.frequency}</label>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {FREQS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                  frequency === f ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700' : 'text-slate-500'
                }`}
              >
                {strings.debt.freq[f]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{strings.recIncome.nextDate}</label>
          <DateInput value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="input-base" />
          <p className="mt-1 text-xs text-slate-400">{strings.recIncome.nextDateHint}</p>
        </div>

        {/* Category (income) */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.recIncome.category}{' '}
            <span className="font-normal text-slate-400">({strings.common.optional})</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {incomeCategories.map((c) => {
              const active = c.id === categoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(active ? '' : c.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] transition ${
                    active ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/20' : 'border-slate-200 dark:border-slate-700'
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
            {strings.tx.tags}{' '}
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
                    active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                  }`}
                  style={!active && t.color ? { borderColor: t.color, color: t.color } : undefined}
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
                list="recinc-tag-suggest"
                className="w-28 shrink-0 rounded-full border border-brand-500 bg-white px-3 py-1.5 text-sm outline-none dark:bg-slate-900"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingTag(true)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-500 dark:border-slate-600"
              >
                <Plus size={14} /> {strings.common.add}
              </button>
            )}
            <datalist id="recinc-tag-suggest">
              {tagList.map((t) => <option key={t.id} value={t.name} />)}
            </datalist>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.tx.note}{' '}
            <span className="font-normal text-slate-400">({strings.common.optional})</span>
          </label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input-base resize-none" />
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
