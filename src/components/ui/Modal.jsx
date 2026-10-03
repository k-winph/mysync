import { useEffect, useRef, useId } from 'react'
import { X } from 'lucide-react'
import { strings } from '../../constants/strings'

// Bottom-sheet style modal on mobile, centered on larger screens.
// Closes on backdrop click and Escape. Labelled by its title for screen
// readers, and moves focus into the dialog on open / back to the trigger on close.
export default function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    // Lock body scroll while open
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog so keyboard/AT users land inside it.
    panelRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      // Restore focus to whatever opened the dialog.
      if (prevFocus instanceof HTMLElement) prevFocus.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div className="fade-in absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="sheet-in relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white
          p-5 shadow-xl outline-none sm:max-w-md sm:rounded-3xl dark:bg-slate-900"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={strings.common.close}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
