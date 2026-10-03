import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Trash2, Users, Share2 } from 'lucide-react'
import { strings } from '../constants/strings'
import { parseMoney, formatMoney } from '../utils/money'
import { uuid } from '../utils/id'
import { useStore } from '../store/useStore'
import { avatarColor, avatarInitial } from '../utils/avatar'
import { buildSplitImage } from '../utils/splitImage'
import Card from '../components/ui/Card'
import MoneyInput from '../components/ui/MoneyInput'
import AnimatedMoney from '../components/AnimatedMoney'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/PageHeader'
import { useConfirm, useToast } from '../components/ui/Feedback'

// The split-bill draft persists on-device under its own key (kept out of the
// finance store and backups — it's a scratch tool, not financial records).
const SPLIT_KEY = 'mysync-split'
const EMPTY_CHARGES = { service: '', vat: '', tip: '' }

function loadSplit() {
  try {
    const d = JSON.parse(localStorage.getItem(SPLIT_KEY) || '{}')
    return {
      people: Array.isArray(d.people) ? d.people : [],
      items: Array.isArray(d.items) ? d.items : [],
      charges: d.charges && typeof d.charges === 'object' ? { ...EMPTY_CHARGES, ...d.charges } : { ...EMPTY_CHARGES },
    }
  } catch {
    return { people: [], items: [], charges: { ...EMPTY_CHARGES } }
  }
}

// Parse a percent string like "10" / "7.5" -> number (0 if blank/invalid).
function parsePct(text) {
  const n = parseFloat(String(text ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

// A small colored initial-circle for a person; same color everywhere.
function Avatar({ person, size = 28 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ backgroundColor: avatarColor(person.id), width: size, height: size, fontSize: size * 0.42 }}
    >
      {avatarInitial(person.name)}
    </span>
  )
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Bill-splitter — no transactions, but the current draft is saved locally so it
// survives closing/reopening the app until the user clears it.
// Each item's price splits equally among the people ticked for that item.
// Service charge / VAT / tip (percent) are added on top and shared in proportion.
export default function SplitBill() {
  const navigate = useNavigate()
  const primary = useStore((s) => s.settings.primaryCurrency)
  const accent = useStore((s) => s.settings.accent)
  const dark = useStore((s) => s.settings.theme) === 'dark'
  const confirm = useConfirm()
  const toast = useToast()

  const initial = loadSplit()
  const [people, setPeople] = useState(initial.people) // [{ id, name }]
  const [items, setItems] = useState(initial.items) // [{ id, name, price(str), members: id[] }]
  const [charges, setCharges] = useState(initial.charges) // { service, vat, tip } percent strings
  const [newName, setNewName] = useState('')

  // Persist the draft on every change (best-effort; ignore storage failures).
  useEffect(() => {
    try {
      localStorage.setItem(SPLIT_KEY, JSON.stringify({ people, items, charges }))
    } catch {
      /* private mode / storage full — the calculator still works in-session */
    }
  }, [people, items, charges])

  const addPerson = () => {
    const name = newName.trim()
    if (!name) return
    const person = { id: uuid(), name }
    setPeople((p) => [...p, person])
    // New person joins existing items by default (usual case: everyone shares).
    setItems((its) => its.map((it) => ({ ...it, members: [...it.members, person.id] })))
    setNewName('')
  }

  const removePerson = (id) => {
    setPeople((p) => p.filter((x) => x.id !== id))
    setItems((its) => its.map((it) => ({ ...it, members: it.members.filter((m) => m !== id) })))
  }

  const addItem = () =>
    setItems((its) => [...its, { id: uuid(), name: '', price: '', members: people.map((p) => p.id) }])

  const updateItem = (id, patch) =>
    setItems((its) => its.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const removeItem = (id) => setItems((its) => its.filter((it) => it.id !== id))

  const toggleMember = (itemId, personId) =>
    setItems((its) =>
      its.map((it) =>
        it.id === itemId
          ? {
              ...it,
              members: it.members.includes(personId)
                ? it.members.filter((m) => m !== personId)
                : [...it.members, personId],
            }
          : it
      )
    )

  const clearAll = async () => {
    if (await confirm({ message: strings.split.clearConfirm, danger: true, confirmLabel: strings.split.clear })) {
      setPeople([])
      setItems([])
      setCharges({ ...EMPTY_CHARGES })
      toast(strings.toast.cleared)
    }
  }

  // Totals in satang. Item shares split equally among an item's members; then
  // service/VAT/tip are added on top and distributed in proportion to each
  // person's item share (VAT stacks on subtotal + service, Thai-receipt style).
  const calc = useMemo(() => {
    const share = {}
    let subtotal = 0
    let unassigned = 0
    for (const it of items) {
      const price = parseMoney(it.price)
      if (price <= 0) continue
      subtotal += price
      const mem = it.members.filter((m) => people.some((p) => p.id === m))
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

    const chargeList = []
    if (serviceAmt > 0) chargeList.push({ key: 'service', label: strings.split.service, amount: serviceAmt })
    if (vatAmt > 0) chargeList.push({ key: 'vat', label: strings.split.vat, amount: vatAmt })
    if (tipAmt > 0) chargeList.push({ key: 'tip', label: strings.split.tip, amount: tipAmt })

    return { perPerson, subtotal, grandTotal, unassigned, chargeList }
  }, [items, people, charges])

  const { perPerson, subtotal, grandTotal, unassigned, chargeList } = calc
  const maxShare = Math.max(1, ...people.map((p) => perPerson[p.id] || 0))

  const shareImage = async () => {
    if (grandTotal <= 0) return
    const blob = await buildSplitImage({
      title: strings.split.title,
      total: grandTotal,
      subtotal,
      charges: chargeList.map((c) => ({ label: c.label, amount: c.amount })),
      rows: people.map((p) => ({
        name: p.name,
        color: avatarColor(p.id),
        initial: avatarInitial(p.name),
        amount: Math.round(perPerson[p.id] || 0),
      })),
      currency: primary,
      accent,
      dark,
      labels: {
        total: strings.split.total,
        subtotal: strings.split.subtotal,
        perPerson: strings.split.perPerson,
        footer: strings.month.madeWith,
      },
    })
    if (!blob) return
    const name = 'mysync-split.png'
    downloadBlob(blob, name)
    const file = new File([blob], name, { type: 'image/png' })
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
      }
    } catch {
      /* share cancelled or unsupported — the file was already downloaded */
    }
  }

  const chargeRow = (key, label, placeholder) => (
    <div className="flex items-center gap-3 py-2">
      <span className="flex-1 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={charges[key]}
          onChange={(e) => setCharges((c) => ({ ...c, [key]: e.target.value }))}
          placeholder={placeholder}
          className="input-base w-20 text-right"
        />
        <span className="text-sm text-slate-400">%</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        icon={Users}
        title={strings.split.title}
        subtitle={strings.pageSub.split}
        onBack={() => navigate('/')}
        right={
          (people.length > 0 || items.length > 0) && (
            <button onClick={clearAll} className="text-sm font-medium text-slate-500 hover:text-red-600">
              {strings.split.clear}
            </button>
          )
        }
      />

      {/* People */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.split.people}</h2>
        <Card className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPerson()
                }
              }}
              placeholder={strings.split.personHint}
              className="input-base flex-1"
            />
            <button
              onClick={addPerson}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-brand-600 px-4 text-sm
                font-semibold text-white hover:bg-brand-700"
            >
              <Plus size={16} /> {strings.split.addPerson}
            </button>
          </div>
          {people.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {people.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2.5
                    text-sm font-medium dark:bg-slate-800"
                >
                  <Avatar person={p} size={24} />
                  {p.name}
                  <button
                    onClick={() => removePerson(p.id)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label={`Remove ${p.name}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Items */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.split.items}</h2>
        {people.length === 0 ? (
          <Card>
            <EmptyState icon={Users} message={strings.split.needPeople} />
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <Card key={it.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder={strings.split.itemName}
                    className="input-base flex-1"
                  />
                  <div className="w-28">
                    <MoneyInput
                      value={it.price}
                      onChange={(v) => updateItem(it.id, { price: v })}
                      placeholder="0.00"
                      className="input-base text-right"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-400">{strings.split.whoShared}</p>
                  <div className="flex flex-wrap gap-2">
                    {people.map((p) => {
                      const active = it.members.includes(p.id)
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleMember(it.id, p.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium transition ${
                            active
                              ? 'border-transparent text-white'
                              : 'border-slate-300 text-slate-500 dark:border-slate-600'
                          }`}
                          style={active ? { backgroundColor: avatarColor(p.id) } : undefined}
                        >
                          <Avatar person={p} size={20} />
                          {p.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Card>
            ))}
            <button
              onClick={addItem}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2
                border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500
                hover:border-brand-400 hover:text-brand-600 dark:border-slate-700"
            >
              <Plus size={18} /> {strings.split.addItem}
            </button>
          </div>
        )}
      </div>

      {/* Service charge / VAT / tip */}
      {people.length > 0 && subtotal > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.split.charges}</h2>
          <Card className="divide-y divide-slate-100 dark:divide-slate-800">
            {chargeRow('service', strings.split.service, '10')}
            {chargeRow('vat', strings.split.vat, '7')}
            {chargeRow('tip', strings.split.tip, '0')}
          </Card>
        </div>
      )}

      {/* Results */}
      {people.length > 0 && grandTotal > 0 && (
        <div>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            {chargeList.length > 0 && (
              <div className="mb-3 space-y-1 border-b border-white/20 pb-3 text-sm">
                <div className="flex justify-between opacity-90">
                  <span>{strings.split.subtotal}</span>
                  <span>{formatMoney(subtotal, primary)}</span>
                </div>
                {chargeList.map((c) => (
                  <div key={c.key} className="flex justify-between opacity-90">
                    <span>{c.label}</span>
                    <span>+{formatMoney(c.amount, primary)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm opacity-80">{strings.split.total}</span>
              <AnimatedMoney satang={grandTotal} currency={primary} className="text-2xl font-bold" />
            </div>
          </div>

          <div className="mb-2 mt-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">{strings.split.perPerson}</h2>
            <button
              onClick={shareImage}
              className="flex items-center gap-1.5 rounded-full border border-brand-500 px-3 py-1
                text-sm font-semibold text-brand-600 transition hover:bg-brand-50 active:scale-95
                dark:text-brand-500 dark:hover:bg-brand-600/10"
            >
              <Share2 size={15} /> {strings.split.shareResult}
            </button>
          </div>

          <Card className="space-y-3">
            {people.map((p) => {
              const amt = Math.round(perPerson[p.id] || 0)
              const pct = Math.min(100, ((perPerson[p.id] || 0) / maxShare) * 100)
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar person={p} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="ml-2 shrink-0 font-semibold">{formatMoney(amt, primary)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: avatarColor(p.id) }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </Card>
          {unassigned > 0 && (
            <p className="mt-2 px-1 text-xs font-medium text-amber-600">{strings.split.unassigned}</p>
          )}
        </div>
      )}
    </div>
  )
}
