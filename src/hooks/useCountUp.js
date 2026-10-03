import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

// Remembers, per `trackKey`, the last amount actually shown this app session.
// This is what makes the animation feel right: it runs when the number is
// different from last time (first open: 0 → value; after adding a record:
// old → new) but NOT when you simply return to a screen and the number is
// unchanged. It lives in memory, so a full app relaunch starts fresh.
const lastShown = {}

// Counts a number up to `target` over `duration` ms with an ease-out curve.
// Honors prefers-reduced-motion (jumps straight to the target). Output is an
// integer — money is integer satang, so callers format it as usual.
//
// Pass `{ trackKey }` to enable the "animate only when the value changed"
// behavior above (used for the dashboard headline figures + donut total).
// Without a trackKey it animates from 0 on every mount (fine for one-off views).
export function useCountUp(target, duration = 800, { trackKey } = {}) {
  const reduce = useReducedMotion()
  const seeded = trackKey != null && lastShown[trackKey] != null
  const [value, setValue] = useState(() => (reduce ? target : seeded ? lastShown[trackKey] : 0))
  const valueRef = useRef(value)
  valueRef.current = value
  const firstRef = useRef(true)
  const rafRef = useRef(0)

  useEffect(() => {
    // On this mount's first run, start from the last-shown value (or 0 the very
    // first time); on later target changes, continue from where we are.
    const from = firstRef.current
      ? (trackKey != null && lastShown[trackKey] != null ? lastShown[trackKey] : 0)
      : valueRef.current
    firstRef.current = false
    if (trackKey != null) lastShown[trackKey] = target

    if (reduce || from === target) {
      setValue(target)
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(Math.round(from + (target - from) * easeOutCubic(p)))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, reduce])

  return reduce ? target : value
}
