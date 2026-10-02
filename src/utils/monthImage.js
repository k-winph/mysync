// Draw a shareable 9:16 month-summary card (1080×1920, Instagram-story size) to a
// PNG blob with the Canvas API — no library, no external fonts. Theme-aware:
// background follows the user's accent color and light/dark mode.
import { formatMoney } from './money'
import { ACCENTS, DEFAULT_ACCENT } from '../constants/accents'

// --- small color helpers ----------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function mix(a, b, t) {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}
function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

const FONT = '-apple-system, system-ui, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif'

export async function buildMonthImage(opts) {
  const {
    title, income, expense, net, incomeRows, expenseRows, stocks,
    prevExpense, savingsRate, currency, accent, dark, labels,
  } = opts
  const accentHex = (ACCENTS.find((a) => a.id === accent) || ACCENTS.find((a) => a.id === DEFAULT_ACCENT)).swatch

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Theme palette
  const ink = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#94a3b8' : '#64748b'
  const cardBg = dark ? '#161a23' : '#ffffff'
  const track = dark ? 'rgba(255,255,255,0.08)' : '#eef1f5'
  const green = dark ? '#34d399' : '#059669'
  const red = dark ? '#f87171' : '#dc2626'

  // --- background (full-bleed accent gradient, themed) ---
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  if (dark) {
    bg.addColorStop(0, mix(accentHex, '#000000', 0.45))
    bg.addColorStop(1, '#06070c')
  } else {
    bg.addColorStop(0, accentHex)
    bg.addColorStop(1, mix(accentHex, '#000000', 0.32))
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const M = 56 // card margin
  const PAD = 64 // inner padding
  const cardW = W - M * 2
  const innerW = cardW - PAD * 2
  const left = M + PAD

  // Lay the content out once to measure, then once to draw (so the card can be
  // sized to its content and centered). `d` = draw this pass.
  const render = (topY, d) => {
    let y = topY

    // Brand row
    if (d) {
      ctx.fillStyle = accentHex
      ctx.beginPath()
      ctx.arc(left + 11, y + 13, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = `700 30px ${FONT}`
      ctx.fillText('MySync', left + 34, y + 24)
      // Savings-rate pill (top-right) — fills the header's empty corner.
      if (savingsRate != null) {
        const txt = `${labels.saved} ${Math.round(savingsRate)}%`
        ctx.font = `700 30px ${FONT}`
        const tw = ctx.measureText(txt).width
        const padX = 28
        const ph = 62
        const pw = tw + padX * 2
        const px = M + cardW - PAD - pw
        const py = y + 34
        ctx.fillStyle = rgba(accentHex, dark ? 0.22 : 0.12)
        roundRect(ctx, px, py, pw, ph, 31)
        ctx.fill()
        ctx.fillStyle = accentHex
        ctx.textAlign = 'left'
        ctx.fillText(txt, px + padX, py + 41)
      }
    }
    y += 52

    // Month title
    if (d) {
      ctx.fillStyle = ink
      ctx.font = `800 60px ${FONT}`
      ctx.fillText(title, left, y + 52)
    }
    y += 92

    // Net hero
    if (d) {
      ctx.fillStyle = muted
      ctx.font = `600 26px ${FONT}`
      ctx.fillText(labels.net, left, y + 26)
      ctx.fillStyle = net >= 0 ? green : red
      ctx.font = `800 86px ${FONT}`
      ctx.fillText(formatMoney(net, currency), left, y + 110)
    }
    y += 150

    // Income / Expense chips
    const chipH = 104
    const gap = 20
    const chipW = (innerW - gap) / 2
    if (d) {
      const chip = (x, label, value, color) => {
        ctx.fillStyle = rgba(color, dark ? 0.16 : 0.1)
        roundRect(ctx, x, y, chipW, chipH, 22)
        ctx.fill()
        ctx.textAlign = 'left'
        ctx.fillStyle = color
        ctx.font = `600 24px ${FONT}`
        ctx.fillText(label, x + 26, y + 40)
        ctx.fillStyle = ink
        ctx.font = `800 38px ${FONT}`
        ctx.fillText(formatMoney(value, currency), x + 26, y + 82)
      }
      chip(left, labels.income, income, green)
      chip(left + chipW + gap, labels.expense, expense, red)
    }
    y += chipH + 18

    // "Expense ▼8% vs last month" line
    if (prevExpense > 0) {
      const delta = ((expense - prevExpense) / prevExpense) * 100
      const down = delta <= 0
      if (d) {
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.font = `600 24px ${FONT}`
        let x = left
        ctx.fillStyle = muted
        ctx.fillText(`${labels.expense} `, x, y + 22)
        x += ctx.measureText(`${labels.expense} `).width
        ctx.fillStyle = down ? green : red
        const dt = `${down ? '▼' : '▲'}${Math.abs(delta).toFixed(0)}% `
        ctx.fillText(dt, x, y + 22)
        x += ctx.measureText(dt).width
        ctx.fillStyle = muted
        ctx.fillText(labels.vsPrev, x, y + 22)
      }
      y += 40
    }
    y += 26

    // Category section (bars)
    const section = (rows, heading) => {
      if (!rows.length) return
      const total = rows.reduce((s, r) => s + r.value, 0)
      if (d) {
        ctx.textAlign = 'left'
        ctx.fillStyle = ink
        ctx.font = `800 32px ${FONT}`
        ctx.fillText(heading, left, y + 30)
      }
      y += 54
      for (const r of rows) {
        const pct = total > 0 ? r.value / total : 0
        if (d) {
          // color dot
          ctx.fillStyle = r.color
          ctx.beginPath()
          ctx.arc(left + 9, y + 14, 9, 0, Math.PI * 2)
          ctx.fill()
          // name
          ctx.fillStyle = ink
          ctx.font = `600 29px ${FONT}`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'alphabetic'
          ctx.fillText(r.name, left + 32, y + 24)
          // percent after the name (muted)
          const nameW = ctx.measureText(r.name).width
          ctx.fillStyle = muted
          ctx.font = `600 23px ${FONT}`
          ctx.fillText(`${Math.round(pct * 100)}%`, left + 32 + nameW + 14, y + 23)
          // amount
          ctx.fillStyle = ink
          ctx.font = `700 29px ${FONT}`
          ctx.textAlign = 'right'
          ctx.fillText(formatMoney(r.value, currency), left + innerW, y + 24)
          const barY = y + 40
          ctx.fillStyle = track
          roundRect(ctx, left, barY, innerW, 14, 7)
          ctx.fill()
          ctx.fillStyle = r.color
          roundRect(ctx, left, barY, Math.max(12, innerW * pct), 14, 7)
          ctx.fill()
        }
        y += 76
      }
      y += 28
    }
    section(expenseRows, labels.expenseByCat)
    section(incomeRows, labels.incomeByCat)

    // Stocks block (current portfolio snapshot)
    if (stocks && stocks.has) {
      const blockH = 150
      if (d) {
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.05)' : '#f6f7fb'
        roundRect(ctx, left, y, innerW, blockH, 24)
        ctx.fill()
        ctx.textAlign = 'left'
        ctx.fillStyle = muted
        ctx.font = `600 25px ${FONT}`
        ctx.fillText(labels.investments, left + 28, y + 42)
        ctx.fillStyle = ink
        ctx.font = `800 52px ${FONT}`
        ctx.fillText(formatMoney(stocks.value, currency), left + 28, y + 100)
        // gain / loss on the right
        const up = stocks.gain >= 0
        const gtext = `${up ? '▲' : '▼'} ${formatMoney(Math.abs(stocks.gain), currency)} (${up ? '+' : '-'}${Math.abs(stocks.gainPct).toFixed(1)}%)`
        ctx.textAlign = 'right'
        ctx.fillStyle = up ? green : red
        ctx.font = `700 30px ${FONT}`
        ctx.fillText(gtext, left + innerW - 28, y + 100)
      }
      y += blockH + 28
    }

    // Footer
    if (d) {
      ctx.textAlign = 'center'
      ctx.fillStyle = muted
      ctx.font = `500 24px ${FONT}`
      ctx.fillText(labels.footer, M + cardW / 2, y + 30)
    }
    y += 44

    return y
  }

  // Measure
  const contentH = render(0, false)
  const cardH = contentH + PAD * 2
  const cardY = Math.max(M, Math.round((H - cardH) / 2))

  // Card (rounded, soft shadow)
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 16
  ctx.fillStyle = cardBg
  roundRect(ctx, M, cardY, cardW, cardH, 48)
  ctx.fill()
  ctx.restore()

  render(cardY + PAD, true)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}
