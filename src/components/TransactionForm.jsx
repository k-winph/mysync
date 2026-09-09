import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput } from '../utils/money'
import { todayISO } from '../utils/date'
import { Plus } from 'lucide-react'
import Button from './ui/Button'
import CategoryIcon from './CategoryIcon'

// Form for adding/editing a transaction. Controlled entirely by local state;
// the parent decides what to do with the result via onSubmit.
export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const categories = useStore((s) => s.categories)
  const tagList = useStore((s) => s.tags)
  const addTag = useStore((s) => s.addTag)

  const [type, setType] = useState(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? satangToInput(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [selectedTags, setSelectedTags] = useState(initial?.tags || [])
  const [addingTag, setAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [note, setNote] = useState(initial?.note || '')
  const [date, setDate] = useState(initial?.date || todayISO())
  const [error, setError] = useState('')

  // Toggle a tag name in/out of the selection.
  const toggleTag = (name) =>
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    )

  // Create a new tag, then auto-select it.
  const handleAddNewTag = () => {
    const name = addTag(newTag)
    if (name && !selectedTags.includes(name)) {
      setSelectedTags((prev) => [...prev, name])
    }
    setNewTag('')
    setAddingTag(false)
  }

  // Categories usable for the selected type (type-specific or "both").
  const options = useMemo(
    () => categories.filter((c) => c.type === type || c.type === 'both'),
    [categories, type]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const satang = parseMoney(amount)
    if (satang <= 0) {
      setError(strings.tx.amount + ' > 0')
      return
    }
    if (!categoryId) {
      setError(strings.tx.pickCategory)
      return
    }
    onSubmit({
      type,
      amount: satang,
      categoryId,
      tags: selectedTags,
      note: note.trim(),
      date,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Income / Expense toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t)
              setCategoryId('') // reset category when switching type
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              type === t
                ? t === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t === 'expense' ? strings.tx.expense : strings.tx.income}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1 block text-sm font-medium">{strings.tx.amount}</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="input-base text-lg font-semibold"
          autoFocus
        />
      </div>

      {/* Category grid */}
      <div>
        <label className="mb-1 block text-sm font-medium">{strings.tx.category}</label>
        <div className="grid grid-cols-4 gap-2">
          {options.map((c) => {
            const active = c.id === categoryId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px]
                  transition ${
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
                <span className="truncate w-full text-center">{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="mb-1 block text-sm font-medium">{strings.tx.date}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-base"
        />
      </div>

      {/* Tags — pick from managed tags (chips scroll horizontally) */}
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
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                #{t.name}
              </button>
            )
          })}

          {/* Inline add-new-tag */}
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
                border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-500
                dark:border-slate-600"
            >
              <Plus size={14} /> {strings.common.add}
            </button>
          )}
        </div>
        {tagList.length === 0 && !addingTag && (
          <p className="mt-1 text-xs text-slate-400">{strings.tx.noTagsHint}</p>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          {strings.tx.note}{' '}
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
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          {strings.common.cancel}
        </Button>
        <Button type="submit" className="flex-1">
          {strings.common.save}
        </Button>
      </div>
    </form>
  )
}
