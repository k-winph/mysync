import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useConfirm, useToast } from './ui/Feedback'

// Add / edit / delete a portfolio. Deleting cascades to its holdings.
export default function PortfolioModal({ open, editing, onClose, onDeleted }) {
  const addPortfolio = useStore((s) => s.addPortfolio)
  const updatePortfolio = useStore((s) => s.updatePortfolio)
  const deletePortfolio = useStore((s) => s.deletePortfolio)
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState(editing?.name || '')
  const [note, setNote] = useState(editing?.note || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return setError(strings.stock.portfolioName)
    if (editing) updatePortfolio(editing.id, { name: name.trim(), note: note.trim() })
    else addPortfolio({ name: name.trim(), note: note.trim() })
    toast(editing ? strings.toast.updated : strings.toast.saved)
    onClose()
  }

  const handleDelete = async () => {
    if (!editing) return
    if (await confirm({ message: strings.stock.deletePortfolioConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deletePortfolio(editing.id)
      toast(strings.toast.deleted)
      onClose()
      onDeleted?.()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? strings.stock.editPortfolio : strings.stock.addPortfolio}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.stock.portfolioName}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={strings.stock.portfolioNameHint}
            className="input-base"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.stock.note}{' '}
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
