import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Check, ChevronUp, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { METHOD_ICONS } from '../constants/paymentMethods'
import Modal from './ui/Modal'
import Button from './ui/Button'
import CategoryIcon from './CategoryIcon'
import { useConfirm, useToast } from './ui/Feedback'

// Manage payment methods (cash / transfer / credit card + custom): create,
// rename, change icon, reorder and delete. Deleting leaves a transaction's
// `methodId` dangling harmlessly (it just shows unlabelled), so nothing drifts.
export default function PaymentMethodManager({ open, onClose }) {
  const methods = useStore((s) => s.paymentMethods)
  const transactions = useStore((s) => s.transactions)
  const addPaymentMethod = useStore((s) => s.addPaymentMethod)
  const updatePaymentMethod = useStore((s) => s.updatePaymentMethod)
  const deletePaymentMethod = useStore((s) => s.deletePaymentMethod)
  const movePaymentMethod = useStore((s) => s.movePaymentMethod)
  const confirm = useConfirm()
  const toast = useToast()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(METHOD_ICONS[0])
  const [editingId, setEditingId] = useState(null)
  const [draftName, setDraftName] = useState('')

  // How many transactions use each method.
  const usage = useMemo(() => {
    const m = {}
    for (const t of transactions) if (t.methodId) m[t.methodId] = (m[t.methodId] || 0) + 1
    return m
  }, [transactions])

  const handleAdd = () => {
    if (!name.trim()) return
    addPaymentMethod({ name, icon })
    setName('')
    setIcon(METHOD_ICONS[0])
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setDraftName(m.name)
  }
  const closeEdit = () => {
    setEditingId(null)
    setDraftName('')
  }
  const saveName = (m) => {
    const next = draftName.trim()
    if (next && next !== m.name) {
      updatePaymentMethod(m.id, { name: next })
      toast(strings.toast.updated)
    }
    closeEdit()
  }
  const handleDelete = async (m) => {
    if (await confirm({ message: strings.methodManage.deleteConfirm, danger: true, confirmLabel: strings.common.delete })) {
      deletePaymentMethod(m.id)
      toast(strings.toast.deleted)
      closeEdit()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={strings.methodManage.title}>
      {methods.length === 0 && <p className="mb-3 text-sm text-slate-500">{strings.methodManage.empty}</p>}

      {/* Method list */}
      <div className="mb-4 space-y-1">
        {methods.map((m, i) => {
          const editing = editingId === m.id
          return (
            <div key={m.id} className="rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <CategoryIcon name={m.icon} size={16} />
                </span>
                <span className="flex-1 truncate font-medium">{m.name}</span>
                <span className="text-xs text-slate-400">{strings.methodManage.used(usage[m.id] || 0)}</span>
                {/* Reorder */}
                <div className="flex flex-col">
                  <button
                    onClick={() => movePaymentMethod(m.id, 'up')}
                    disabled={i === 0}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-25"
                    aria-label={strings.common.moveUp}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => movePaymentMethod(m.id, 'down')}
                    disabled={i === methods.length - 1}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-25"
                    aria-label={strings.common.moveDown}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <button
                  onClick={() => (editing ? closeEdit() : startEdit(m))}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                  aria-label={strings.methodManage.edit}
                >
                  <Pencil size={15} />
                </button>
              </div>

              {editing && (
                <div className="space-y-3 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
                  {/* Rename */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">{strings.methodManage.rename}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            saveName(m)
                          }
                        }}
                        className="input-base flex-1"
                        autoFocus
                      />
                      <Button onClick={() => saveName(m)} aria-label={strings.common.save}>
                        <Check size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">{strings.methodManage.icon}</label>
                    <div className="flex flex-wrap gap-2">
                      {METHOD_ICONS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => updatePaymentMethod(m.id, { icon: ic })}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                            m.icon === ic
                              ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-600/20'
                              : 'border-slate-200 text-slate-500 dark:border-slate-700'
                          }`}
                          aria-label={ic}
                        >
                          <CategoryIcon name={ic} size={16} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(m)}
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
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {METHOD_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                icon === ic
                  ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-600/20'
                  : 'border-slate-200 text-slate-500 dark:border-slate-700'
              }`}
              aria-label={ic}
            >
              <CategoryIcon name={ic} size={16} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <CategoryIcon name={icon} size={16} />
            </span>
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
              placeholder={strings.methodManage.name}
              className="input-base pl-9"
            />
          </div>
          <Button onClick={handleAdd} aria-label={strings.common.add}>
            <Plus size={18} />
          </Button>
        </div>
      </div>
    </Modal>
  )
}
