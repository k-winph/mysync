import { parseMoney } from './money'

// Parse a percent string like "10" / "7.5" -> number (0 if blank/invalid).
export function parsePct(text) {
  const n = parseFloat(String(text ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * Pure bill-split math (kept out of the component so it can be unit-tested).
 * Each item's price splits equally among its ticked members; then service /
 * VAT / tip percentages are added on top and distributed in proportion to each
 * person's item share. VAT stacks on (subtotal + service), Thai-receipt style.
 *
 * All money is integer satang. Percentages are strings (as typed).
 *
 * @param {Array<{id:string}>} people
 * @param {Array<{price:string, members:string[]}>} items
 * @param {{service?:string, vat?:string, tip?:string}} charges
 * @returns {{ perPerson:Object<string,number>, subtotal:number, grandTotal:number,
 *            unassigned:number, serviceAmt:number, vatAmt:number, tipAmt:number }}
 */
export function computeSplit(people, items, charges = {}) {
  const share = {}
  let subtotal = 0
  let unassigned = 0
  for (const it of items) {
    const price = parseMoney(it.price)
    if (price <= 0) continue
    subtotal += price
    const mem = (it.members || []).filter((m) => people.some((p) => p.id === m))
    if (mem.length === 0) {
      unassigned += price
      continue
    }
    const each = price / mem.length
    for (const m of mem) share[m] = (share[m] || 0) + each
  }
  const s = parsePct(charges.service)
  const v = parsePct(charges.vat)
  const t = parsePct(charges.tip)
  const serviceAmt = Math.round(subtotal * (s / 100))
  const vatAmt = Math.round((subtotal + serviceAmt) * (v / 100))
  const tipAmt = Math.round(subtotal * (t / 100))
  const grandTotal = subtotal + serviceAmt + vatAmt + tipAmt
  const mult = subtotal > 0 ? grandTotal / subtotal : 1
  const perPerson = {}
  for (const id of Object.keys(share)) perPerson[id] = share[id] * mult

  return { perPerson, subtotal, grandTotal, unassigned, serviceAmt, vatAmt, tipAmt }
}
