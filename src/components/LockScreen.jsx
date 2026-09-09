import { useState, useEffect } from 'react'
import { Lock, Fingerprint } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { verifyPin } from '../utils/pin'
import { verifyBiometric } from '../utils/webauthn'
import PinPad from './PinPad'

// Full-screen lock shown before the app when a PIN is enabled. Unlocks for the
// current session only (re-locks on reload). Offers biometric unlock when set up,
// always with the PIN as fallback.
export default function LockScreen({ onUnlock }) {
  const pinHash = useStore((s) => s.settings.pinHash)
  const biometricEnabled = useStore((s) => s.settings.biometricEnabled)
  const biometricCredId = useStore((s) => s.settings.biometricCredId)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    if (await verifyPin(value, pinHash)) onUnlock()
    else {
      setError(strings.lock.wrong)
      setValue('')
    }
  }

  // Auto-verify once all 6 digits are entered.
  useEffect(() => {
    if (value.length === 6) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const tryBiometric = async () => {
    try {
      if (await verifyBiometric(biometricCredId)) onUnlock()
    } catch {
      /* cancelled or failed — user can use the PIN */
    }
  }

  // Prompt biometrics automatically on open when set up.
  useEffect(() => {
    if (biometricEnabled && biometricCredId) tryBiometric()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 px-8 dark:bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white">
        <Lock size={30} />
      </div>
      <h1 className="mt-4 text-xl font-bold">{strings.appName}</h1>
      <p className="mt-1 text-sm text-slate-500">{strings.lock.unlockTitle}</p>
      <div className="mt-2 h-5 text-sm font-medium text-red-600">{error}</div>
      <div className="w-full max-w-xs">
        <PinPad value={value} onChange={(v) => { setValue(v); setError('') }} />
      </div>
      {biometricEnabled && biometricCredId && (
        <button
          onClick={tryBiometric}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600"
        >
          <Fingerprint size={20} /> {strings.lock.useBiometric}
        </button>
      )}
    </div>
  )
}
