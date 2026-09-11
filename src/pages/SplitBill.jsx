import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, X, Trash2, Users } from 'lucide-react'
import { strings } from '../constants/strings'
import { parseMoney, formatMoney } from '../utils/money'
import { uuid } from '../utils/id'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import MoneyInput from '../components/ui/MoneyInput'

// Ephemeral bill-splitter. No persistence, no transactions — pure calculator.
// Each item's price splits equally among the people ticked for that item.
export default function SplitBill() {
  const navigate = useNavigate()
  const primary = useStore((s) => s.settings.primaryCurrency)

  const [people, setPeople] = useState([]) // [{ id, name }]
  const [items, setItems] = useState([]) // [{ id, name, price(str), members: id[] }]
  const [newName, setNewName] = useState('')

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

  const clearAll = () => {
    if (window.confirm(strings.split.clearConfirm)) {
      setPeople([])
      setItems([])
    }
  }

  // Per-person totals in satang (summed as floats, rounded per person at the end).
  const { perPerson, total, unassigned } = useMemo(() => {
    const per = {}
    let tot = 0
    let unassignedC = 0
    for (const it of items) {
      const price = parseMoney(it.price)
      if (price <= 0) continue
      tot += price
      const mem = it.members.filter((m) => people.some((p) => p.id === m))
      if (mem.length === 0) {
        unassignedC += price
        continue
      }
      const share = price / mem.length
      for (const m of mem) per[m] = (per[m] || 0) + share
    }
    return { perPerson: per, total: tot, unassigned: unassignedC }
  }, [items, people])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/')}
          className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="flex-1 text-2xl font-bold">{strings.split.title}</h1>
        {(people.length > 0 || items.length > 0) && (
          <button onClick={clearAll} className="text-sm font-medium text-slate-500 hover:text-red-600">
            {strings.split.clear}
          </button>
        )}
      </div>

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
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5
                    text-sm font-medium dark:bg-slate-800"
                >
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
          <Card className="flex flex-col items-center gap-3 py-8 text-center">
            <Users size={36} className="text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-500">{strings.split.needPeople}</p>
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
                          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                            active
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300 text-slate-500 dark:border-slate-600'
                          }`}
                        >
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

      {/* Results */}
      {people.length > 0 && total > 0 && (
        <div>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <div className="flex items-baseline justify-between">
              <span className="text-sm opacity-80">{strings.split.total}</span>
              <span className="text-2xl font-bold">{formatMoney(total, primary)}</span>
            </div>
          </div>
          <h2 className="mb-2 mt-4 text-sm font-semibold text-slate-500">{strings.split.perPerson}</h2>
          <Card className="divide-y divide-slate-100 dark:divide-slate-800">
            {people.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <span className="font-medium">{p.name}</span>
                <span className="font-semibold">{formatMoney(Math.round(perPerson[p.id] || 0), primary)}</span>
              </div>
            ))}
          </Card>
          {unassigned > 0 && (
            <p className="mt-2 px-1 text-xs font-medium text-amber-600">{strings.split.unassigned}</p>
          )}
        </div>
      )}
    </div>
  )
}
