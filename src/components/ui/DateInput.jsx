// A native date field that opens the calendar picker when you tap ANYWHERE in
// the box (not only the little icon). `showPicker()` needs a user gesture, so we
// call it from onClick; it's wrapped in try/catch because older browsers don't
// support it (there the default behavior — tapping the icon — still works).
// The picker icon's dark-mode visibility is handled in index.css (color-scheme).
export default function DateInput(props) {
  const openPicker = (e) => {
    try {
      e.currentTarget.showPicker?.()
    } catch {
      /* unsupported or blocked — fall back to default date-field behavior */
    }
  }
  return <input type="date" onClick={openPicker} {...props} />
}
