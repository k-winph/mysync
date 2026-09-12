// Light haptic feedback for important taps (save, confirm, pay, delete).
// No-ops when the device has no vibration motor, when the browser doesn't
// support it, or when the user turned it off in Settings (settings.haptics).
// Reading the store lazily here avoids an import cycle (the store never imports
// this file) and always sees the latest preference.
import { useStore } from '../store/useStore'

export function haptic(pattern = 12) {
  try {
    // Default ON: only an explicit `false` disables it, so users upgrading
    // from a build without this setting still feel it.
    if (useStore.getState().settings.haptics === false) return
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    /* ignore — haptics are a nicety, never break a tap over it */
  }
}
