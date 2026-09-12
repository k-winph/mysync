import { useEffect, useState } from 'react'

// Wraps the PWA install flow. The browser fires `beforeinstallprompt` only when
// the app is installable (Chromium; not yet installed; served over HTTPS). We
// stash that event so a button can trigger the native prompt later. iOS Safari
// never fires it, so `canInstall` simply stays false there (the button hides).
export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault() // stop Chrome's mini-infobar; we show our own button
      setDeferred(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }

    // Already running as an installed app? Then there's nothing to offer.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (standalone) setInstalled(true)

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) return false
    deferred.prompt()
    let accepted = false
    try {
      const choice = await deferred.userChoice
      accepted = choice?.outcome === 'accepted'
    } catch {
      /* ignore */
    }
    setDeferred(null) // the event can only be used once
    return accepted
  }

  return { canInstall: !!deferred && !installed, installed, install }
}
