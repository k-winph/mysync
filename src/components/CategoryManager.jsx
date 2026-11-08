import { useMemo, useState } from 'react'
import { Plus, Trash2, Pin, PinOff, Eye, EyeOff, Pencil, ChevronUp, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { categoryUsage } from '../store/categoryOps'
import { strings } from '../constants/strings'
import Modal from './ui/Modal'
import Button from './ui/Button'
import CategoryIcon from './CategoryIcon'
import { useConfirm, useToast } from './ui/Feedback'

// A curated set of icons/colors so the user doesn't face an overwhelming list.
const ICON_CHOICES = [
  'utensils', 'bus', 'shopping-bag', 'receipt', 'heart-pulse', 'gamepad-2',
  'house', 'wallet', 'gift', 'trending-up', 'coffee', 'plane', 'car',
  'book', 'dumbbell', 'shirt', 'paw-print', 'phone', 'ellipsis',
]
const COLOR_CHOICES = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9',
  '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
]

export default function CategoryManager({ open, onClose }) {
  const categories = useStore((s) => s.categories)
  const addCategory = useStore((s) => s.addCategory)
  const updateCategory = useStore((s) => s.updateCategory)
  const deleteCategory = useStore((s) => s.deleteCategory)
  const mergeCategory = useStore((s) => s.mergeCategory)
  const moveCategory = useStore((s) => s.moveCategory)
  const transactions = useStore((s) => s.transactions)
  const debts = useStore((s) => s.debts)
  const recurringIncomes = useStore((s) => s.recurringIncomes)
  const usage = useMemo(
    () => categoryUsage({ transactions, debts, recurringIncomes }),
    [transactions, debts, recurringIncomes]
  )
  const confirm = useConfirm()
  const toast = useToast()

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [icon, setIcon] = useState(ICON_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])
  const [editingId, setEditingId] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  // Group by type (the add-form shows one type at a time), and within each type
  // put pinned first then manual order — exactly how the form lists them, so the
  // up/down arrows here move an item the same way the form will show it.
  const groups = useMemo(() => {
    const order = ['expense', 'income', 'both']
    return order
      .map((type) => {
        const items = categories
          .filter((c) => c.type === type && (showArchived || !c.archived))
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
        return { type, items }
      })
      .filter((g) => g.items.length > 0)
  }, [categories, showArchived])

  const typeLabel = (t) => (t === 'both' ? strings.category.both : t === 'income' ? strings.tx.income : strings.tx.expense)
  const hiddenCount = categories.filter((c) => c.archived).length

  const resetForm = () => {
    setName('')
    setType('expense')
    setIcon(ICON_CHOICES[0])
    setColor(COLOR_CHOICES[0])
    setAdding(false)
  }

  const handleAdd = () => {
    if (!name.trim()) return
    addCategory({ name: name.trim(), type, icon, color })
    resetForm()
  }

  const handleDelete = async (c) => {
    const n = usage[c.id] || 0
    const message = n > 0 ? strings.category.deleteInUse(n) : strings.category.deleteConfirm
    if (await confirm({ message, danger: true, confirmLabel: strings.common.delete })) {
      deleteCategory(c.id)
      toast(strings.toast.deleted)
      setEditingId(null)
    }
  }

  const handleMerge = (sourceId, targetId) => {
    if (!targetId) return
    mergeCategory(sourceId, targetId)
    toast(strings.toast.updated)
    setEditingId(null)
  }

  return (
    <Modal open={open} onClose={onClose} title={strings.category.manage}>
      {/* Existing list — grouped by type, pinned first */}
      <div className="mb-3 space-y-3">
        {groups.map((g) => (
          <div key={g.type} className="space-y-1">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{typeLabel(g.type)}</p>
            {g.items.map((c) => {
              const editing = editingId === c.id
              const peers = g.items.filter((x) => !x.archived && !!x.pinned === !!c.pinned)
              const pi = peers.findIndex((x) => x.id === c.id)
              const canUp = !c.archived && pi > 0
              const canDown = !c.archived && pi >= 0 && pi < peers.length - 1
              const mergeTargets = categories.filter(
                (x) => x.id !== c.id && !x.archived && (x.type === c.type || x.type === 'both' || c.type === 'both')
              )
              return (
                <div key={c.id} className={`rounded-xl border dark:border-slate-700 ${editing ? 'border-slate-300 dark:border-slate-600' : 'border-transparent'}`}>
                  <div className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${c.archived ? 'opacity-40' : ''}`}
                      style={{ backgroundColor: c.color }}
                    >
                      <CategoryIcon name={c.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className={`font-medium ${c.archived ? 'text-slate-400' : ''}`}>{c.name}</span>
                      {c.pinned && !c.archived && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase text-brand-600">{strings.category.pinnedBadge}</span>
                      )}
                      {c.archived && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase text-slate-400">{strings.category.archivedBadge}</span>
                      )}
                      <span className="ml-2 text-xs text-slate-400">{strings.category.used(usage[c.id] || 0)}</span>
                    </div>
                    {/* Reorder (active categories only) */}
                    {!c.archived && (
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveCategory(c.id, 'up')}
                          disabled={!canUp}
                          className="text-slate-400 hover:text-brand-600 disabled:opacity-25"
                          aria-label={strings.common.moveUp}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveCategory(c.id, 'down')}
                          disabled={!canDown}
                          className="text-slate-400 hover:text-brand-600 disabled:opacity-25"
                          aria-label={strings.common.moveDown}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}
                    {/* Quick pin toggle (hidden categories can't be pinned) */}
                    {!c.archived && (
                      <button
                        onClick={() => updateCategory(c.id, { pinned: !c.pinned })}
                        className={`rounded-lg p-1.5 transition hover:bg-slate-200 dark:hover:bg-slate-700 ${c.pinned ? 'text-brand-600' : 'text-slate-400'}`}
                        aria-label={c.pinned ? strings.category.unpin : strings.category.pin}
                      >
                        {c.pinned ? <Pin size={15} /> : <PinOff size={15} />}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingId(editing ? null : c.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-brand-600 dark:hover:bg-slate-700"
                      aria-label={strings.category.edit}
                    >
                      <Pencil size={15} />
                    </button>
                  </div>

                  {/* Edit panel */}
                  {editing && (
                    <div className="space-y-3 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
                      {/* Archive toggle */}
                      <div>
                        <button
                          onClick={() => updateCategory(c.id, { archived: !c.archived, pinned: c.archived ? c.pinned : false })}
                          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                        >
                          {c.archived ? <Eye size={16} /> : <EyeOff size={16} />}
                          {c.archived ? strings.category.unarchive : strings.category.archive}
                        </button>
                        <p className="mt-1 text-xs text-slate-400">{strings.category.archiveHint}</p>
                      </div>

                      {/* Merge */}
                      {mergeTargets.length > 0 && (
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-500">{strings.category.mergeInto}</label>
                          <select value="" onChange={(e) => handleMerge(c.id, e.target.value)} className="input-base">
                            <option value="">{strings.category.mergeNone}</option>
                            {mergeTargets.map((x) => (
                              <option key={x.id} value={x.id}>{x.name}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-slate-400">{strings.category.mergeHint}</p>
                        </div>
                      )}

                      <button onClick={() => handleDelete(c)} className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                        <Trash2 size={15} /> {strings.common.delete}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Show/hide archived toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowArchived((v) => !v)}
          className="mb-3 text-xs font-medium text-brand-600"
        >
          {showArchived ? strings.category.hideArchived : `${strings.category.showArchived} (${hiddenCount})`}
        </button>
      )}

      {/* Add form / toggle */}
      {adding ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={strings.category.name}
            className="input-base"
            autoFocus
          />

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {['expense', 'income', 'both'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition ${
                  type === t ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t === 'both' ? strings.category.both : t === 'income' ? strings.tx.income : strings.tx.expense}
              </button>
            ))}
          </div>

          {/* Icon picker */}
          <div className="flex flex-wrap gap-2">
            {ICON_CHOICES.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  icon === ic ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <CategoryIcon name={ic} size={16} />
              </button>
            ))}
          </div>

          {/* Color picker */}
          <div className="flex flex-wrap gap-2">
            {COLOR_CHOICES.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setColor(col)}
                className={`h-8 w-8 rounded-full ring-offset-2 transition dark:ring-offset-slate-900 ${
                  color === col ? 'ring-2 ring-slate-900 dark:ring-white' : ''
                }`}
                style={{ backgroundColor: col }}
                aria-label={col}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={resetForm}>
              {strings.common.cancel}
            </Button>
            <Button className="flex-1" onClick={handleAdd}>
              {strings.common.add}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" className="w-full" onClick={() => setAdding(true)}>
          <Plus size={18} /> {strings.category.addTitle}
        </Button>
      )}
    </Modal>
  )
}
