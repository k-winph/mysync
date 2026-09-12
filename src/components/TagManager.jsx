import { useState } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useConfirm, useToast } from './ui/Feedback'

// Create and remove the managed tags that appear as selectable chips on the
// transaction form. Names only — kept deliberately simple.
export default function TagManager({ open, onClose }) {
  const tags = useStore((s) => s.tags)
  const addTag = useStore((s) => s.addTag)
  const deleteTag = useStore((s) => s.deleteTag)
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState('')

  const handleAdd = () => {
    addTag(name)
    setName('')
  }

  const handleDelete = async (id) => {
    if (await confirm({ message: strings.tagManage.deleteConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deleteTag(id)
      toast(strings.toast.deleted)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={strings.tagManage.title}>
      {/* Existing tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-slate-500">{strings.tagManage.empty}</p>
        )}
        {tags.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300
              py-1.5 pl-3 pr-1.5 text-sm dark:border-slate-600"
          >
            <Tag size={13} className="text-brand-600" />
            {t.name}
            <button
              onClick={() => handleDelete(t.id)}
              className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600
                dark:hover:bg-red-900/30"
              aria-label={strings.common.delete}
            >
              <Trash2 size={13} />
            </button>
          </span>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
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
          className="input-base flex-1"
        />
        <Button onClick={handleAdd}>
          <Plus size={18} />
        </Button>
      </div>
    </Modal>
  )
}
