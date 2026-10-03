// Draw a shareable 9:16 bill-split summary card (1080×1920, Instagram-story
// size) to a PNG blob with the Canvas API. Matches the monthly-summary card:
// theme-aware background (accent + light/dark), floating rounded card.
import { formatMoney } from './money'
import { ACCENTS, DEFAULT_ACCENT } from '../constants/accents'

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

// opts: { title, total, subtotal, charges:[{label,amount}], rows:[{name,color,initial,amount}],
//         currency, accent, dark, labels:{ total, perPerson, footer } }
export async function buildSplitImage(opts) {
  const { title, total, subtotal, charges = [], rows = [], currency, accent, dark, labels } = opts
  const accentHex = (ACCENTS.find((a) => a.id === accent) || ACCENTS.find((a) => a.id === DEFAULT_ACCENT)).swatch

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const ink = dark ? '#f1f5f9' : '#0f172a'
  const muted = dark ? '#94a3b8' : '#64748b'
  const cardBg = dark ? '#161a23' : '#ffffff'
  const chargeBg = dark ? 'rgba(255,255,255,0.05)' : '#f6f7fb'

  // Background
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

  const M = 56
  const PAD = 64
  const cardW = W - M * 2
  const innerW = cardW - PAD * 2
  const left = M + PAD

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
      ctx.fillStyle = ink
      ctx.font = `700 30px ${FONT}`
      ctx.fillText('MySync', left + 34, y + 24)
    }
    y += 52

    // Title
    if (d) {
      ctx.fillStyle = ink
      ctx.font = `800 60px ${FONT}`
      ctx.fillText(title, left, y + 52)
    }
    y += 92

    // Grand-total hero
    if (d) {
      ctx.fillStyle = muted
      ctx.font = `600 26px ${FONT}`
      ctx.fillText(labels.total, left, y + 26)
      ctx.fillStyle = accentHex
      ctx.font = `800 86px ${FONT}`
      ctx.fillText(formatMoney(total, currency), left, y + 110)
    }
    y += 150

    // Charges breakdown (subtotal + each charge), only if any charge present
    if (charges.length > 0) {
      const lineH = 46
      const blockH = 28 + lineH * (charges.length + 1) + 20
      if (d) {
        ctx.fillStyle = chargeBg
        roundRect(ctx, left, y, innerW, blockH, 20)
        ctx.fill()
        let ly = y + 44
        const row = (label, amount, strong) => {
          ctx.textAlign = 'left'
          ctx.fillStyle = strong ? ink : muted
          ctx.font = `${strong ? 700 : 500} 26px ${FONT}`
          ctx.fillText(label, left + 28, ly)
          ctx.textAlign = 'right'
          ctx.fillStyle = strong ? ink : muted
          ctx.fillText(formatMoney(amount, currency), left + innerW - 28, ly)
          ly += lineH
        }
        row(labels.subtotal, subtotal, false)
        charges.forEach((c) => row(c.label, c.amount, false))
      }
      y += blockH + 28
    }

    // Per-person section
    if (d) {
      ctx.textAlign = 'left'
      ctx.fillStyle = ink
      ctx.font = `800 32px ${FONT}`
      ctx.fillText(labels.perPerson, left, y + 30)
    }
    y += 58

    const rowH = 92
    for (const r of rows) {
      if (d) {
        // avatar
        ctx.fillStyle = r.color
        ctx.beginPath()
        ctx.arc(left + 28, y + 28, 28, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = `700 30px ${FONT}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(r.initial, left + 28, y + 30)
        // name
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'left'
        ctx.fillStyle = ink
        ctx.font = `600 34px ${FONT}`
        ctx.fillText(r.name, left + 76, y + 40)
        // amount
        ctx.textAlign = 'right'
        ctx.fillStyle = ink
        ctx.font = `800 36px ${FONT}`
        ctx.fillText(formatMoney(r.amount, currency), left + innerW, y + 40)
        // divider
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.07)' : '#eef1f5'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(left, y + rowH - 10)
        ctx.lineTo(left + innerW, y + rowH - 10)
        ctx.stroke()
      }
      y += rowH
    }
    y += 18

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

  const contentH = render(0, false)
  const cardH = contentH + PAD * 2
  const cardY = Math.max(M, Math.round((H - cardH) / 2))

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
