import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, Info, AlertCircle } from 'lucide-react'
import Button from './Button'
import { strings } from '../../constants/strings'

// Lightweight app-wide feedback: toasts (with optional Undo action) and a
// themed confirm dialog that replaces the browser's window.confirm.
const ToastCtx = createContext(() => {})
const ConfirmCtx = createContext(async () => false)

export const useToast = () => useContext(ToastCtx)
export const useConfirm = () => useContext(ConfirmCtx)

let counter = 0

const TOAST_ICON = {
  success: <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />,
  info: <Info size={18} className="shrink-0 text-sky-400" />,
  error: <AlertCircle size={18} className="shrink-0 text-rose-400" />,
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const resolveRef = useRef(null)

  const remove = useCallback((id) => setToasts((cur) => cur.filter((t) => t.id !== id)), [])

  // toast(message, { type, action: { label, onClick } })
  const toast = useCallback(
    (message, opts = {}) => {
      const id = ++counter
      const t = { id, message, type: opts.type || 'success', action: opts.action || null }
      setToasts((cur) => [...cur, t])
      setTimeout(() => remove(id), t.action ? 6000 : 3000)
      return id
    },
    [remove]
  )

  // confirm({ title, message, confirmLabel, danger }) -> Promise<boolean>
  const confirm = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        resolveRef.current = resolve
        setConfirmState(opts)
      }),
    []
  )
  const closeConfirm = (value) => {
    setConfirmState(null)
    if (resolveRef.current) {
      resolveRef.current(value)
      resolveRef.current = null
    }
  }

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}

        {/* Toast host — above the bottom nav */}
        <div
          className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl
                bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-700"
            >
              {TOAST_ICON[t.type]}
              <span className="flex-1">{t.message}</span>
              {t.action && (
                <button
                  onClick={() => {
                    t.action.onClick()
                    remove(t.id)
                  }}
                  className="shrink-0 font-semibold text-brand-300"
                >
                  {t.action.label}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Confirm dialog */}
        {confirmState && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6" role="dialog" aria-modal="true">
            <div className="fade-in absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => closeConfirm(false)} />
            <div className="dialog-in relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
              {confirmState.title && <h2 className="text-lg font-bold">{confirmState.title}</h2>}
              {confirmState.message && (
                <p className="mt-1 text-sm text-slate-500">{confirmState.message}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => closeConfirm(false)}>
                  {strings.common.cancel}
                </Button>
                <Button
                  variant={confirmState.danger ? 'danger' : 'primary'}
                  className="flex-1"
                  onClick={() => closeConfirm(true)}
                >
                  {confirmState.confirmLabel || strings.common.confirm}
                </Button>
              </div>
            </div>
          </div>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  )
}
