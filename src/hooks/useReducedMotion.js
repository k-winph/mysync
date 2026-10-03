import { useState, useEffect } from 'react'

// Tracks the OS "reduce motion" accessibility preference, live. Animations
// across the app check this and skip straight to the final state when true.
export function useReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduce
}
