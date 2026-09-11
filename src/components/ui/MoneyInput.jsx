import { useRef } from 'react'

// Format a raw typed string into a grouped money string WHILE typing:
// "1234567.5" -> "1,234,567.5", keeps a trailing dot ("12." stays "12."),
// caps decimals at 2, strips junk. Returns a plain string (parseMoney() in
// utils/money.js already ignores the commas on submit, so state can hold this).
export function formatMoneyInput(raw) {
  let s = String(raw ?? '').replace(/[^0-9.]/g, '')
  const dot = s.indexOf('.')
  let intPart
  let decPart = ''
  let hasDot = false
  if (dot === -1) {
    intPart = s
  } else {
    hasDot = true
    intPart = s.slice(0, dot)
    // Drop any further dots, keep at most 2 decimal digits.
    decPart = s.slice(dot + 1).replace(/\./g, '').slice(0, 2)
  }
  intPart = intPart.replace(/^0+(?=\d)/, '') // no leading zeros (but keep a lone "0")
  const intFmt = intPart.length ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
  return hasDot ? `${intFmt}.${decPart}` : intFmt
}

// Count digits/dot to the left of `caret` in `str` (commas don't count).
function significantLeft(str, caret) {
  return str.slice(0, caret).replace(/[^0-9.]/g, '').length
}

// A text input that shows thousands separators as the user types. Emits the
// formatted string via onChange; keep the caret stable across reformatting.
// Drop-in replacement for the old <input type="number"> money fields.
export default function MoneyInput({ value, onChange, className = 'input-base', ...props }) {
  const ref = useRef(null)

  const handleChange = (e) => {
    const el = e.target
    const rawVal = el.value
    const caret = el.selectionStart ?? rawVal.length
    const left = significantLeft(rawVal, caret)
    const formatted = formatMoneyInput(rawVal)
    onChange(formatted)

    // Restore the caret after React re-renders (or force the DOM if it didn't).
    requestAnimationFrame(() => {
      const node = ref.current
      if (!node) return
      if (node.value !== formatted) node.value = formatted
      let count = 0
      let pos = 0
      for (; pos < formatted.length; pos++) {
        if (count >= left) break
        if (/[0-9.]/.test(formatted[pos])) count++
      }
      node.setSelectionRange(pos, pos)
    })
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      className={className}
      {...props}
    />
  )
}
