import { useEffect, useRef } from 'react'

// Lightweight full-screen particle overlay (no dependencies). `type` is one of
// snow | leaves | sakura | rain | hearts. Pointer-events are off so it never
// blocks taps, and it sits behind the app content so it never covers a card; it
// pauses when the tab is hidden and cleans up on unmount. The parent decides
// whether to render it (respecting reduce-motion / settings).

const CONFIG = {
  snow:    { dir: 'fall', count: 26, kind: 'circle', color: '#ffffff', size: [1.2, 3.2], vy: [0.3, 0.9], sway: 1.0, alpha: 0.75 },
  rain:    { dir: 'fall', count: 24, kind: 'line',   color: 'rgba(165,196,255,0.5)', size: [8, 16], vy: [5, 9], slant: -0.9, alpha: 1 },
  leaves:  { dir: 'fall', count: 16, kind: 'glyph',  glyphs: ['🍂', '🍁'], size: [14, 26], vy: [0.6, 1.5], sway: 1.8, spin: true, alpha: 0.95 },
  sakura:  { dir: 'fall', count: 20, kind: 'glyph',  glyphs: ['🌸', '🌼'], size: [12, 22], vy: [0.5, 1.2], sway: 1.6, spin: true, alpha: 0.95 },
  hearts:  { dir: 'rise', count: 18, kind: 'glyph',  glyphs: ['💗', '💕', '❤️'], size: [12, 22], vy: [0.4, 1.1], sway: 1.2, alpha: 0.9 },
}

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]

export default function SeasonalEffect({ type }) {
  const ref = useRef(null)

  useEffect(() => {
    const cfg = CONFIG[type]
    const canvas = ref.current
    if (!cfg || !canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let particles = []

    const makeParticle = (initial) => {
      const size = rand(cfg.size[0], cfg.size[1])
      const speed = rand(cfg.vy[0], cfg.vy[1])
      const atStart = cfg.dir === 'fall' ? -size : h + size
      return {
        x: Math.random() * w,
        // On first fill, spread across the screen; on respawn, start off-edge.
        y: initial ? Math.random() * h : atStart,
        size,
        vy: speed,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: rand(0.01, 0.03),
        swayAmp: (cfg.sway || 0) * rand(0.5, 1.2),
        angle: Math.random() * Math.PI * 2,
        spin: cfg.spin ? rand(-0.02, 0.02) : 0,
        glyph: cfg.glyphs ? pick(cfg.glyphs) : null,
      }
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: cfg.count }, () => makeParticle(true))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.swayPhase += p.swaySpeed
        p.x += Math.sin(p.swayPhase) * p.swayAmp
        p.y += cfg.dir === 'fall' ? p.vy : -p.vy
        p.angle += p.spin
        ctx.globalAlpha = cfg.alpha

        if (cfg.kind === 'circle') {
          ctx.fillStyle = cfg.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (cfg.kind === 'line') {
          ctx.strokeStyle = cfg.color
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + cfg.slant * p.size, p.y + p.size)
          ctx.stroke()
        } else {
          ctx.save()
          ctx.translate(p.x, p.y)
          if (p.spin) ctx.rotate(p.angle)
          ctx.font = `${p.size}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(p.glyph, 0, 0)
          ctx.restore()
        }

        // Respawn once off-screen.
        if (cfg.dir === 'fall' && p.y > h + p.size + 4) Object.assign(p, makeParticle(false))
        if (cfg.dir === 'rise' && p.y < -p.size - 4) Object.assign(p, makeParticle(false))
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    resize()
    start()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [type])

  if (!CONFIG[type]) return null
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1]"
    />
  )
}
