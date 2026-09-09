import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { hashPin, verifyPin } from '../utils/pin'
import Modal from './ui/Modal'
import PinPad from './PinPad'

// Set a new PIN (enter + confirm) or verify the current PIN to turn the lock off.
// mode: 'set' | 'disable'
export default function PinSetupModal({ open, mode, onClose }) {
  const pinHash = useStore((s) => s.settings.pinHash)
  const updateSettings = useStore((s) => s.updateSettings)

  const [step, setStep] = useState('enter') // 'enter' | 'confirm'
  const [first, setFirst] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  // Reset whenever the modal (re)opens.
  useEffect(() => {
    if (open) {
      setStep('enter')
      setFirst('')
      setValue('')
      setError('')
    }
  }, [open])

  const submit = async () => {
    if (mode === 'disable') {
      if (await verifyPin(value, pinHash)) {
        // Biometric requires a PIN fallback, so clear it when the lock is removed.
        updateSettings({ pinEnabled: false, pinHash: null, biometricEnabled: false, biometricCredId: null })
        onClose()
      } else {
        setError(strings.lock.wrong)
        setValue('')
      }
      return
    }
    // mode 'set'
    if (step === 'enter') {
      setFirst(value)
      setValue('')
      setError('')
      setStep('confirm')
    } else {
      if (value === first) {
        const h = await hashPin(value)
        updateSettings({ pinEnabled: true, pinHash: h })
        onClose()
      } else {
        setError(strings.lock.mismatch)
        setValue('')
        setFirst('')
        setStep('enter')
      }
    }
  }

  // Auto-advance/verify once all 6 digits are entered.
  useEffect(() => {
    if (value.length === 6) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const title =
    mode === 'disable'
      ? strings.lock.disableTitle
      : step === 'enter'
        ? strings.lock.enterNew
        : strings.lock.confirmNew

  return (
    <Modal open={open} onClose={onClose} title={strings.lock.setTitle}>
      <p className="text-center text-sm text-slate-500">{title}</p>
      <div className="h-5 text-center text-sm font-medium text-red-600">{error}</div>
      <PinPad value={value} onChange={(v) => { setValue(v); setError('') }} />
    </Modal>
  )
}
