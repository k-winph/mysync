import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { parseMoney, satangToInput } from '../utils/money'
import Modal from './ui/Modal'
import Button from './ui/Button'

const CURRENCIES = ['THB', 'USD']

// Add / edit / delete a holding within a portfolio.
// avgCost is stored in minor units (cents of the chosen currency).
export default function HoldingModal({ open, portfolioId, editing, onClose }) {
  const addHolding = useStore((s) => s.addHolding)
  const updateHolding = useStore((s) => s.updateHolding)
  const deleteHolding = useStore((s) => s.deleteHolding)

  const [symbol, setSymbol] = useState(editing?.symbol || '')
  const [shares, setShares] = useState(editing ? String(editing.shares) : '')
  const [avgCost, setAvgCost] = useState(editing ? satangToInput(editing.avgCost) : '')
  const [currency, setCurrency] = useState(editing?.currency || 'THB')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const sym = symbol.trim().toUpperCase()
    const sh = parseFloat(shares)
    const cost = parseMoney(avgCost)
    if (!sym) return setError(strings.stock.symbol)
    if (!sh || sh <= 0) return setError(strings.stock.shares + ' > 0')
    if (cost <= 0) return setError(strings.stock.avgCost + ' > 0')
    const data = { symbol: sym, shares: sh, avgCost: cost, currency }
    if (editing) updateHolding(editing.id, data)
    else addHolding({ portfolioId, ...data })
    onClose()
  }

  const handleDelete = () => {
    if (editing && window.confirm(strings.stock.deleteHoldingConfirm)) {
      deleteHolding(editing.id)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? strings.stock.editHolding : strings.stock.addHolding}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.stock.symbol}</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder={strings.stock.symbolHint}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="input-base font-mono"
            autoFocus
          />
          <p className="mt-1 text-xs text-slate-400">{strings.stock.thaiHint}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">{strings.stock.shares}</label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{strings.stock.currency}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-base"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{strings.stock.avgCost}</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
            placeholder="0.00"
            className="input-base"
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {strings.common.cancel}
          </Button>
          <Button type="submit" className="flex-1">
            {strings.common.save}
          </Button>
        </div>
      </form>
      {editing && (
        <Button variant="danger" className="mt-3 w-full" onClick={handleDelete}>
          <Trash2 size={18} /> {strings.common.delete}
        </Button>
      )}
    </Modal>
  )
}
