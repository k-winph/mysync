import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
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
  const deleteCategory = useStore((s) => s.deleteCategory)
  const confirm = useConfirm()
  const toast = useToast()

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [icon, setIcon] = useState(ICON_CHOICES[0])
  const [color, setColor] = useState(COLOR_CHOICES[0])

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

  const handleDelete = async (id) => {
    if (await confirm({ message: strings.category.deleteConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deleteCategory(id)
      toast(strings.toast.deleted)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={strings.category.manage}>
      {/* Existing list */}
      <div className="mb-4 space-y-1">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: c.color }}
            >
              <CategoryIcon name={c.icon} size={16} />
            </span>
            <div className="flex-1">
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-slate-400">{c.type}</span>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
              aria-label={strings.common.delete}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

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
                {t === 'both' ? strings.category.both : t}
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
                  icon === ic
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/20'
                    : 'border-slate-200 dark:border-slate-700'
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
