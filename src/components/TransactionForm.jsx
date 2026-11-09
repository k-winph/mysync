import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput, formatMoney } from '../utils/money'
import { todayISO } from '../utils/date'
import { pickableCategories } from '../utils/category'
import { Plus, Check, Repeat, Layers, X } from 'lucide-react'
import Button from './ui/Button'
import MoneyInput, { formatMoneyInput } from './ui/MoneyInput'
import DateInput from './ui/DateInput'
import CategoryIcon from './CategoryIcon'

// Form for adding/editing a transaction. Controlled entirely by local state;
// the parent decides what to do with the result via onSubmit.
export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const categories = useStore((s) => s.categories)
  const tagList = useStore((s) => s.tags)
  const addTag = useStore((s) => s.addTag)
  const primary = useStore((s) => s.settings.primaryCurrency)

  const [type, setType] = useState(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? formatMoneyInput(satangToInput(initial.amount)) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [selectedTags, setSelectedTags] = useState(initial?.tags || [])
  const [addingTag, setAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [note, setNote] = useState(initial?.note || '')
  const [date, setDate] = useState(initial?.date || todayISO())
  const [error, setError] = useState('')
  // "Also make this a recurring income" — only offered when adding a new income.
  const [makeRecurring, setMakeRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState('monthly')

  // Split-into-categories mode. Editing an existing split starts locked in this
  // mode with its portions preloaded; a brand-new entry can toggle it on.
  const isEditingSplit = !!initial?.__splitGroupId
  const canToggleSplit = !initial
  const [splitMode, setSplitMode] = useState(isEditingSplit)
  const [splitLines, setSplitLines] = useState(() =>
    isEditingSplit
      ? initial.splits.map((sp) => ({ categoryId: sp.categoryId, amount: formatMoneyInput(satangToInput(sp.amount)) }))
      : [{ categoryId: '', amount: '' }, { categoryId: '', amount: '' }]
  )
  const splitTotal = splitLines.reduce((sum, l) => sum + (parseMoney(l.amount) || 0), 0)

  const isNewIncome = type === 'income' && !initial && !splitMode

  const setLine = (i, patch) => setSplitLines((lines) => lines.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const addLine = () => setSplitLines((lines) => [...lines, { categoryId: '', amount: '' }])
  const removeLine = (i) => setSplitLines((lines) => (lines.length > 1 ? lines.filter((_, j) => j !== i) : lines))

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

  // Categories usable for the selected type: type-specific or "both", minus
  // archived ones, with pinned (frequently used) categories first.
  const options = useMemo(() => pickableCategories(categories, type), [categories, type])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (splitMode) {
      const splits = splitLines
        .map((l) => ({ categoryId: l.categoryId, amount: parseMoney(l.amount) }))
        .filter((l) => l.categoryId && l.amount > 0)
      if (splits.length < 2) {
        setError(strings.tx.splitNeedTwo)
        return
      }
      onSubmit({
        __split: true,
        type,
        tags: selectedTags,
        note: note.trim(),
        date,
        splits,
      })
      return
    }
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
      recurring: type === 'income' && makeRecurring ? { frequency: recurringFreq } : null,
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
              if (t === 'expense') setMakeRecurring(false)
              // Category sets differ by type, so clear the split picks too.
              setSplitLines((lines) => lines.map((l) => ({ ...l, categoryId: '' })))
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

      {/* Split-into-categories control */}
      {(canToggleSplit || isEditingSplit) && (
        <div>
          {canToggleSplit ? (
            <button
              type="button"
              onClick={() => setSplitMode((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-600"
            >
              <Layers size={15} /> {splitMode ? strings.tx.splitOff : strings.tx.splitOn}
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-600/15">
              <Layers size={13} /> {strings.tx.splitMode}
            </div>
          )}
        </div>
      )}

      {splitMode ? (
        /* Split lines — one category + amount per row, with a running total */
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.tx.splitByCategory}</label>
          <div className="space-y-2">
            {splitLines.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={l.categoryId}
                  onChange={(e) => setLine(i, { categoryId: e.target.value })}
                  className="input-base min-w-0 flex-1"
                >
                  <option value="">{strings.tx.pickCategory}</option>
                  {options.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="w-28 shrink-0">
                  <MoneyInput value={l.amount} onChange={(v) => setLine(i, { amount: v })} placeholder="0.00" className="input-base" />
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  disabled={splitLines.length <= 1}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-25"
                  aria-label={strings.common.delete}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLine}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-brand-600"
          >
            <Plus size={15} /> {strings.tx.splitAddLine}
          </button>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-sm dark:border-slate-800">
            <span className="text-slate-500">{strings.common.total}</span>
            <span className="font-bold">{formatMoney(splitTotal, primary)}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium">{strings.tx.amount}</label>
            <MoneyInput
              value={amount}
              onChange={setAmount}
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
        </>
      )}

      {/* Date */}
      <div>
        <label className="mb-1 block text-sm font-medium">{strings.tx.date}</label>
        <DateInput
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-base"
        />
      </div>

      {/* Make this a recurring income (new income only) */}
      {isNewIncome && (
        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMakeRecurring((v) => !v)}
            className="flex w-full items-center gap-2.5"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                makeRecurring ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {makeRecurring && <Check size={14} />}
            </span>
            <Repeat size={15} className="shrink-0 text-green-600" />
            <span className="flex-1 text-left text-sm font-medium">{strings.tx.makeRecurring}</span>
          </button>
          {makeRecurring && (
            <div className="mt-3">
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {['weekly', 'monthly', 'yearly'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setRecurringFreq(f)}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                      recurringFreq === f ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {strings.debt.freq[f]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{strings.tx.makeRecurringHint}</p>
            </div>
          )}
        </div>
      )}

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
                    ? 'border-transparent text-white'
                    : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                }`}
                style={
                  active
                    ? { backgroundColor: t.color || '#6366f1' }
                    : t.color
                      ? { borderColor: t.color, color: t.color }
                      : undefined
                }
              >
                #{t.name}
              </button>
            )
          })}

          {/* Inline add-new-tag (with autocomplete over existing tags) */}
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
              list="tx-tag-suggest"
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
          <datalist id="tx-tag-suggest">
            {tagList.map((t) => <option key={t.id} value={t.name} />)}
          </datalist>
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
