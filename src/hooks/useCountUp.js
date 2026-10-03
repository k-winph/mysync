import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

// Counts a number up to `target` over `duration` ms with an ease-out curve.
// First mount animates from 0; later target changes animate from the current
// value. Honors prefers-reduced-motion (jumps straight to the target). Output
// is an integer — money is integer satang, so callers format it as usual.
export function useCountUp(target, duration = 800) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(() => (reduce ? target : 0))
  const valueRef = useRef(value)
  valueRef.current = value
  const rafRef = useRef(0)
  const firstRef = useRef(true)

  useEffect(() => {
    if (reduce) {
      setValue(target)
      return
    }
    const from = firstRef.current ? 0 : valueRef.current
    firstRef.current = false
    if (from === target) {
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
