import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Tag, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useConfirm, useToast } from './ui/Feedback'

// Palette offered when recoloring a tag (mirrors the store's TAG_COLORS).
const COLORS = [
  '#6366f1', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#64748b',
]

// Manage the tags that appear as chips: create, rename, recolor, merge and
// delete. Rename/merge/delete all rewrite the transactions that use the tag,
// so the managed list and the real data never drift apart.
export default function TagManager({ open, onClose }) {
  const tags = useStore((s) => s.tags)
  const transactions = useStore((s) => s.transactions)
  const addTag = useStore((s) => s.addTag)
  const deleteTag = useStore((s) => s.deleteTag)
  const renameTag = useStore((s) => s.renameTag)
  const mergeTag = useStore((s) => s.mergeTag)
  const setTagColor = useStore((s) => s.setTagColor)
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [draftName, setDraftName] = useState('')

  // How many transactions use each tag (by name).
  const usage = useMemo(() => {
    const m = {}
    for (const t of transactions) for (const tag of t.tags || []) m[tag] = (m[tag] || 0) + 1
    return m
  }, [transactions])

  const handleAdd = () => {
    if (!name.trim()) return
    addTag(name)
    setName('')
  }

  const startEdit = (t) => {
    setEditingId(t.id)
    setDraftName(t.name)
  }
  const closeEdit = () => {
    setEditingId(null)
    setDraftName('')
  }

  const saveName = (t) => {
    const next = draftName.trim()
    if (next && next !== t.name) {
      renameTag(t.id, next)
      toast(strings.toast.updated)
    }
    closeEdit()
  }

  const handleMerge = (sourceId, targetId) => {
    if (!targetId) return
    mergeTag(sourceId, targetId)
    toast(strings.toast.updated)
    closeEdit()
  }

  const handleDelete = async (t) => {
    if (await confirm({ message: strings.tagManage.deleteConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deleteTag(t.id)
      toast(strings.toast.deleted)
      closeEdit()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={strings.tagManage.title}>
      {tags.length === 0 && <p className="mb-3 text-sm text-slate-500">{strings.tagManage.empty}</p>}

      {/* Tag list */}
      <div className="mb-4 space-y-1">
        {tags.map((t) => {
          const editing = editingId === t.id
          return (
            <div key={t.id} className="rounded-xl border border-slate-200 dark:border-slate-700">
              {/* Row */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: t.color || '#64748b' }} />
                <span className="flex-1 truncate font-medium">{t.name}</span>
                <span className="text-xs text-slate-400">{strings.tagManage.used(usage[t.name] || 0)}</span>
                <button
                  onClick={() => (editing ? closeEdit() : startEdit(t))}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                  aria-label={strings.tagManage.edit}
                >
                  <Pencil size={15} />
                </button>
              </div>

              {/* Edit panel */}
              {editing && (
                <div className="space-y-3 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
                  {/* Rename */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">{strings.tagManage.rename}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            saveName(t)
                          }
                        }}
                        className="input-base flex-1"
                        autoFocus
                      />
                      <Button onClick={() => saveName(t)} aria-label={strings.common.save}>
                        <Check size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">{strings.tagManage.color}</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setTagColor(t.id, col)}
                          className={`h-7 w-7 rounded-full ring-offset-2 transition dark:ring-offset-slate-900 ${
                            (t.color || '#64748b') === col ? 'ring-2 ring-slate-900 dark:ring-white' : ''
                          }`}
                          style={{ backgroundColor: col }}
                          aria-label={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Merge */}
                  {tags.length > 1 && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-500">{strings.tagManage.mergeInto}</label>
                      <select
                        value=""
                        onChange={(e) => handleMerge(t.id, e.target.value)}
                        className="input-base"
                      >
                        <option value="">{strings.tagManage.mergeNone}</option>
                        {tags.filter((x) => x.id !== t.id).map((x) => (
                          <option key={x.id} value={x.id}>{x.name}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-slate-400">{strings.tagManage.mergeHint}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(t)}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600"
                  >
                    <Trash2 size={15} /> {strings.common.delete}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            placeholder={strings.tagManage.name}
            className="input-base pl-9"
          />
        </div>
        <Button onClick={handleAdd} aria-label={strings.common.add}>
          <Plus size={18} />
        </Button>
      </div>
    </Modal>
  )
}
