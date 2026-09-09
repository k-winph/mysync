import { Delete, Check } from 'lucide-react'

// Numeric keypad + dot display for entering a 4–6 digit PIN.
// Controlled: parent owns `value`. `onSubmit` fires when the check key is tapped
// (enabled only for a 4–6 digit value).
export default function PinPad({ value, onChange, onSubmit }) {
  const canSubmit = value.length >= 4 && value.length <= 6
  const press = (d) => value.length < 6 && onChange(value + d)
  const back = () => onChange(value.slice(0, -1))

  const Key = ({ children, onClick, disabled, label }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-16 items-center justify-center rounded-2xl text-2xl font-semibold
        text-slate-800 transition hover:bg-slate-100 active:scale-95 disabled:opacity-30
        dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  )

  return (
    <div>
      {/* Dots — one per entered digit */}
      <div className="my-6 flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition ${
              i < value.length ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Key key={d} onClick={() => press(d)}>
            {d}
          </Key>
        ))}
        <Key onClick={back} label="Delete">
          <Delete size={24} />
        </Key>
        <Key onClick={() => press('0')}>0</Key>
        <Key onClick={() => canSubmit && onSubmit()} disabled={!canSubmit} label="Confirm">
          <Check size={24} className="text-brand-600" />
        </Key>
      </div>
    </div>
  )
}
