import { createContext, useContext, useRef, useCallback, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { haptic } from '../utils/haptics'

// A tiny, dependency-free confetti burst for celebratory moments.
//   useCelebrate() → celebrate('big' | 'small')
// 'big'   — reaching a savings goal, clearing a debt, finishing installments.
// 'small' — a routine monthly payment: lighter, so it stays a treat not a nuisance.
// The whole thing is gated by the `celebrations` setting, reduce-motion, and
// animSpeed==='off'. One always-mounted canvas does the drawing.

const CelebrationContext = createContext(() => {})
export const useCelebrate = () => useContext(CelebrationContext)

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fde047']
const rand = (a, b) => a + Math.random() * (b - a)
const pickColor = () => COLORS[(Math.random() * COLORS.length) | 0]

// Build one burst of particles for the given level, in CSS pixels.
function spawn(level, w, h) {
  const out = []
  const add = (ox, oy, vx, vy) => {
    out.push({
      x: ox, y: oy, vx, vy,
      g: 0.22, drag: 0.992,
      rot: Math.random() * Math.PI, vr: rand(-0.3, 0.3),
      w: rand(6, 11), h: rand(8, 15),
      color: pickColor(),
      circle: Math.random() < 0.25,
      life: 0, max: rand(90, 150),
    })
  }
  if (level === 'small') {
    for (let i = 0; i < 40; i++) add(w * 0.5, h * 0.82, rand(-5, 5), rand(-13, -7))
  } else {
    for (let i = 0; i < 70; i++) add(w * 0.08, h * 0.95, rand(2, 8), rand(-17, -9)) // left cannon
    for (let i = 0; i < 70; i++) add(w * 0.92, h * 0.95, rand(-8, -2), rand(-17, -9)) // right cannon
  }
  return out
}

export function CelebrationProvider({ children }) {
  const canvasRef = useRef(null)
  const partsRef = useRef([])
  const rafRef = useRef(0)
  const reduce = useReducedMotion()
  const animSpeed = useStore((s) => s.settings.animSpeed)
  const enabled = useStore((s) => s.settings.celebrations !== false)

  const celebrate = useCallback((level = 'big') => {
    if (!enabled) return
    haptic(level === 'big' ? [14, 40, 14] : 12)
    // Motion is off: skip the visual, but the haptic above still fires.
    if (reduce || animSpeed === 'off') return
    const canvas = canvasRef.current
    if (!canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    partsRef.current.push(...spawn(level, w, h))

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      const parts = partsRef.current
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.vx *= p.drag
        p.vy = p.vy * p.drag + p.g
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life++
        const alpha = p.life > p.max * 0.7 ? Math.max(0, 1 - (p.life - p.max * 0.7) / (p.max * 0.3)) : 1
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.circle) {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
        if (p.life >= p.max || p.y > h + 24) parts.splice(i, 1)
      }
      ctx.globalAlpha = 1
      if (parts.length > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = 0
        ctx.clearRect(0, 0, w, h)
      }
    }
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
  }, [enabled, reduce, animSpeed])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <CelebrationContext.Provider value={celebrate}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[-1]"
      />
    </CelebrationContext.Provider>
  )
}
