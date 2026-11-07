import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { strings, setLang } from '../constants/strings'

// App-wide safety net. If any screen throws during render, show a friendly
// recovery screen (with a Reload button) instead of a blank white app. Data in
// localStorage is untouched, so reloading brings everything back.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Localize the fallback to the user's saved language before it renders.
    try {
      const saved = JSON.parse(localStorage.getItem('mysync-store') || '{}')
      const lang = saved?.state?.settings?.language
      if (lang) setLang(lang)
    } catch {
      /* ignore — fall back to the default language */
    }
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('MySync crashed:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertTriangle size={30} />
        </div>
        <h1 className="text-xl font-bold">{strings.error.title}</h1>
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">{strings.error.body}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-1 flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm
            font-semibold text-white transition hover:bg-brand-700 active:scale-95"
        >
          <RefreshCw size={16} /> {strings.error.reload}
        </button>
      </div>
    )
  }
}
