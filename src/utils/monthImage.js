// Draw a shareable month-summary card to a PNG blob with the Canvas API (no
// library, no external fonts). PNG shares to any app, unlike .xlsx. Rendered at
// 2x for crisp output; always on a light card so it looks good anywhere.
import { formatMoney } from './money'
import { ACCENTS, DEFAULT_ACCENT } from '../constants/accents'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function buildMonthImage({ title, income, expense, net, incomeRows, expenseRows, currency, accent, labels }) {
  const accentHex = (ACCENTS.find((a) => a.id === accent) || ACCENTS.find((a) => a.id === DEFAULT_ACCENT)).swatch
  const scale = 2
  const W = 600
  const P = 36
  const headerH = 128
  const statsH = 96
  const titleH = 34
  const rowH = 48
  const sectionH = (n) => (n > 0 ? titleH + n * rowH + 12 : 0)
  const footerH = 52
  const H = headerH + statsH + sectionH(expenseRows.length) + sectionH(incomeRows.length) + footerH

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  const font = (s) => `${s}px system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif`

  // Card background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Header band
  ctx.fillStyle = accentHex
  ctx.fillRect(0, 0, W, headerH)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `600 ${font(16)}`
  ctx.fillText('MySync', P, 46)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${font(30)}`
  ctx.fillText(title, P, 92)

  // Stats row
  const col = (W - P * 2) / 3
  const sy = headerH + 18
  const stat = (i, label, value, color) => {
    const x = P + col * i
    ctx.textAlign = 'left'
    ctx.fillStyle = '#64748b'
    ctx.font = `500 ${font(13)}`
    ctx.fillText(label, x, sy + 16)
    ctx.fillStyle = color
    ctx.font = `700 ${font(18)}`
    ctx.fillText(value, x, sy + 44)
  }
  stat(0, labels.income, formatMoney(income, currency), '#059669')
  stat(1, labels.expense, formatMoney(expense, currency), '#dc2626')
  stat(2, labels.net, formatMoney(net, currency), net >= 0 ? '#059669' : '#dc2626')

  // Category sections (bars)
  let y = headerH + statsH
  const section = (rows, heading, total) => {
    if (!rows.length) return
    ctx.textAlign = 'left'
    ctx.fillStyle = '#0f172a'
    ctx.font = `700 ${font(15)}`
    ctx.fillText(heading, P, y + 22)
    y += titleH
    for (const r of rows) {
      const pct = total > 0 ? r.value / total : 0
      ctx.fillStyle = '#334155'
      ctx.font = `600 ${font(14)}`
      ctx.textAlign = 'left'
      ctx.fillText(r.name, P, y + 15)
      ctx.textAlign = 'right'
      ctx.fillText(formatMoney(r.value, currency), W - P, y + 15)
      const barY = y + 25
      const barW = W - P * 2
      ctx.fillStyle = '#eef0f3'
      roundRect(ctx, P, barY, barW, 8, 4)
      ctx.fill()
      ctx.fillStyle = r.color
      roundRect(ctx, P, barY, Math.max(6, barW * pct), 8, 4)
      ctx.fill()
      y += rowH
    }
    y += 12
  }
  section(expenseRows, labels.expenseByCat, expense)
  section(incomeRows, labels.incomeByCat, income)

  // Footer
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `500 ${font(12)}`
  ctx.fillText(labels.footer, W / 2, H - 22)
  ctx.textAlign = 'left'

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}
