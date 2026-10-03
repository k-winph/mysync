import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'
import { strings } from '../constants/strings'

// Shows a small bottom banner when a new build's service worker is waiting.
// Tapping Refresh activates it and reloads; otherwise the current version keeps
// running until the next launch. The whole app still works offline either way.
export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl
        border border-slate-200 bg-white px-4 py-3 shadow-lg
        dark:border-slate-700 dark:bg-slate-900"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      role="status"
    >
      <span className="flex-1 text-sm font-medium">{strings.pwa.updateReady}</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-sm
          font-semibold text-white hover:bg-brand-700 active:scale-95"
      >
        <RefreshCw size={14} /> {strings.pwa.reload}
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={strings.pwa.dismiss}
      >
        <X size={18} />
      </button>
    </div>
  )
}
