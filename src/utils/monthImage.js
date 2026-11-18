// Draw a shareable 9:16 month-summary card (1080×1920, Instagram-story size) to a
// PNG blob with the Canvas API — no library, no external fonts. Theme-aware:
// background follows the user's accent color and light/dark mode.
import { formatMoney } from './money'
import { ACCENTS, DEFAULT_ACCENT } from '../constants/accents'
import { shareTheme, ensureShareFont } from './shareTheme'

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

export async function buildMonthImage(opts) {
  const {
    title, income, expense, net, incomeRows, expenseRows, stocks,
    prevExpense, savingsRate, currency, accent, dark, uiTheme = 'default', labels,
  } = opts
  const accentHex = (ACCENTS.find((a) => a.id === accent) || ACCENTS.find((a) => a.id === DEFAULT_ACCENT)).swatch

  // UI-theme palette + font (default = legacy look; pixel = cream/plum + Silkscreen).
  const pal = shareTheme(uiTheme, dark)
  await ensureShareFont(pal)
  const FONT = pal.font
  const { ink, muted, cardBg, green, red } = pal
  const track = pal.track
  // Square corners for the Pixel theme; `rr` wraps every corner radius.
  const rr = (r) => (pal.pixel ? 0 : r)

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Largest font size <= base that fits maxW (Pixel theme only — the Silkscreen
  // face is wide, so long amounts must shrink to stay inside the card). Returns
  // `base` unchanged for other themes, keeping their output identical.
  const fitPx = (text, maxW, weight, base) => {
    if (!pal.pixel) return base
    let px = base
    ctx.font = `${weight} ${px}px ${FONT}`
    while (px > 22 && ctx.measureText(text).width > maxW) {
      px -= 2
      ctx.font = `${weight} ${px}px ${FONT}`
    }
    return px
  }

  // --- background (full-bleed; accent gradient for default, theme paper for pixel) ---
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  if (pal.pixel) {
    bg.addColorStop(0, pal.bg0)
    bg.addColorStop(1, pal.bg1)
  } else if (dark) {
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
  // Savings-rate pill geometry (measured once; used to size the pill and to cap
  // the month title so they never overlap). Independent of the draw pass.
  const pillText = savingsRate != null ? `${labels.saved} ${Math.round(savingsRate)}%` : ''
  ctx.font = `700 30px ${FONT}`
  const pillW = savingsRate != null ? ctx.measureText(pillText).width + 56 : 0

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
        const padX = 28
        const ph = 62
        const px = M + cardW - PAD - pillW
        const py = y + 48 // sit beside the month title, vertically centered on it
        ctx.fillStyle = rgba(accentHex, dark ? 0.22 : 0.12)
        roundRect(ctx, px, py, pillW, ph, rr(31))
        ctx.fill()
        ctx.fillStyle = accentHex
        ctx.textAlign = 'left'
        ctx.font = `700 30px ${FONT}`
        ctx.fillText(pillText, px + padX, py + 41)
      }
    }
    y += 52

    // Month title — capped to the space left of the savings pill so the (wide)
    // pixel font can't run underneath it.
    if (d) {
      ctx.fillStyle = ink
      const titleMaxW = savingsRate != null ? innerW - pillW - 24 : innerW
      ctx.font = `800 ${fitPx(title, titleMaxW, 800, 60)}px ${FONT}`
      ctx.fillText(title, left, y + 52)
    }
    y += 92

    // Net hero
    if (d) {
      ctx.fillStyle = muted
      ctx.font = `600 26px ${FONT}`
      ctx.fillText(labels.net, left, y + 26)
      ctx.fillStyle = net >= 0 ? green : red
      ctx.font = `800 ${fitPx(formatMoney(net, currency), innerW, 800, 86)}px ${FONT}`
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
        roundRect(ctx, x, y, chipW, chipH, rr(22))
        ctx.fill()
        ctx.textAlign = 'left'
        ctx.fillStyle = color
        ctx.font = `600 24px ${FONT}`
        ctx.fillText(label, x + 26, y + 40)
        ctx.fillStyle = ink
        ctx.font = `800 ${fitPx(formatMoney(value, currency), chipW - 52, 800, 38)}px ${FONT}`
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
          roundRect(ctx, left, barY, innerW, 14, rr(7))
          ctx.fill()
          ctx.fillStyle = r.color
          roundRect(ctx, left, barY, Math.max(12, innerW * pct), 14, rr(7))
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
      const standouts = stocks.topGain || stocks.topValue
      const blockH = standouts ? 250 : 150
      if (d) {
        ctx.fillStyle = pal.panelBg
        roundRect(ctx, left, y, innerW, blockH, rr(24))
        ctx.fill()
        ctx.textAlign = 'left'
        ctx.fillStyle = muted
        ctx.font = `600 25px ${FONT}`
        ctx.fillText(labels.investments, left + 28, y + 42)
        // Gain/loss (right) is measured first so the value (left) can be fit to
        // whatever space is left — they share one line and the wide pixel font
        // would otherwise collide.
        const up = stocks.gain >= 0
        const gtext = `${up ? '▲' : '▼'} ${formatMoney(Math.abs(stocks.gain), currency)} (${up ? '+' : '-'}${Math.abs(stocks.gainPct).toFixed(1)}%)`
        const gainPx = fitPx(gtext, (innerW - 56) * 0.5, 700, 30)
        ctx.font = `700 ${gainPx}px ${FONT}`
        const gainW = ctx.measureText(gtext).width
        const valueText = formatMoney(stocks.value, currency)
        ctx.fillStyle = ink
        ctx.font = `800 ${fitPx(valueText, innerW - 56 - gainW - 24, 800, 52)}px ${FONT}`
        ctx.fillText(valueText, left + 28, y + 100)
        // gain / loss on the right
        ctx.textAlign = 'right'
        ctx.fillStyle = up ? green : red
        ctx.font = `700 ${gainPx}px ${FONT}`
        ctx.fillText(gtext, left + innerW - 28, y + 100)

        // Standout holdings: top gainer (left) + highest value (right).
        if (standouts) {
          const dy = y + 140
          ctx.strokeStyle = pal.divider
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(left + 28, dy)
          ctx.lineTo(left + innerW - 28, dy)
          ctx.stroke()
          const colY = dy + 22
          const colW = (innerW - 56) / 2
          const mini = (mx, label, valueText, valueColor) => {
            ctx.textAlign = 'left'
            ctx.fillStyle = muted
            ctx.font = `600 22px ${FONT}`
            ctx.fillText(label, mx, colY + 22)
            ctx.fillStyle = valueColor
            ctx.font = `700 29px ${FONT}`
            ctx.fillText(valueText, mx, colY + 60)
          }
          if (stocks.topGain) {
            const g = stocks.topGain
            const sign = g.gainPct >= 0 ? '+' : ''
            mini(left + 28, labels.topGainer, `${g.symbol}  ${sign}${g.gainPct.toFixed(1)}%`, g.gainPct >= 0 ? green : red)
          }
          if (stocks.topValue) {
            const v = stocks.topValue
            mini(left + 28 + colW, labels.topHolding, `${v.symbol}  ${formatMoney(v.valuePrimary, currency)}`, ink)
          }
        }
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

  // Card — Pixel: square panel with a hard offset shadow + chunky outline;
  // default: rounded panel with a soft drop shadow.
  ctx.save()
  if (pal.pixel) {
    ctx.fillStyle = pal.border
    roundRect(ctx, M + 12, cardY + 12, cardW, cardH, 0) // hard shadow block
    ctx.fill()
    ctx.fillStyle = cardBg
    roundRect(ctx, M, cardY, cardW, cardH, 0)
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = pal.border
    roundRect(ctx, M, cardY, cardW, cardH, 0)
    ctx.stroke()
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 16
    ctx.fillStyle = cardBg
    roundRect(ctx, M, cardY, cardW, cardH, 48)
    ctx.fill()
  }
  ctx.restore()

  render(cardY + PAD, true)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}
