import { AlertTriangle } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { strings } from '../constants/strings'

// A small yes/no confirmation sheet, reused for destructive actions. `danger`
// paints the confirm button red and shows a warning icon; `note` is an extra
// emphasised line (e.g. "this cannot be undone"). Built on Modal so it inherits
// focus trapping, Escape-to-close and the backdrop.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  note,
  confirmLabel,
  cancelLabel,
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {danger && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15">
            <AlertTriangle size={24} />
          </div>
        )}
        {message && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>}
        {note && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {note}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {cancelLabel || strings.common.cancel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>
            {confirmLabel || strings.common.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
