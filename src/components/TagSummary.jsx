import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import Modal from './ui/Modal'
import MoneyText from './MoneyText'

// Totals grouped by tag across all transactions. A transaction can carry
// several tags, so it contributes to each of them. Tapping a row drills into
// the Records list filtered to that tag.
export default function TagSummary({ open, onClose }) {
  const transactions = useStore((s) => s.transactions)
  const tagList = useStore((s) => s.tags)
  const navigate = useNavigate()

  const colorByName = useMemo(() => {
    const m = {}
    for (const t of tagList) m[t.name] = t.color
    return m
  }, [tagList])

  const rows = useMemo(() => {
    const map = {} // tag -> { expense, income, count }
    for (const t of transactions) {
      for (const tag of t.tags || []) {
        const r = (map[tag] ||= { expense: 0, income: 0, count: 0 })
        if (t.type === 'income') r.income += t.amount
        else r.expense += t.amount
        r.count += 1
      }
    }
    return Object.entries(map)
      .map(([tag, v]) => ({ tag, ...v }))
      .sort((a, b) => b.expense + b.income - (a.expense + a.income))
  }, [transactions])

  const drill = (tag) => {
    onClose()
    navigate(`/transactions?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <Modal open={open} onClose={onClose} title={strings.tag.title}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">{strings.tag.empty}</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-slate-400">{strings.tag.tapHint}</p>
          <div className="space-y-2">
            {rows.map((r) => (
              <button
                key={r.tag}
                onClick={() => drill(r.tag)}
                className="block w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-400 dark:border-slate-700"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorByName[r.tag] || '#64748b' }} />
                  <span className="font-semibold">{r.tag}</span>
                  <span className="ml-auto text-xs text-slate-400">{strings.tag.count(r.count)}</span>
                  <ChevronRight size={15} className="text-slate-400" />
                </div>
                <div className="flex gap-4 text-sm">
                  {r.expense > 0 && (
                    <span className="text-red-600">
                      {strings.tag.spent}: <MoneyText satang={r.expense} className="font-semibold" />
                    </span>
                  )}
                  {r.income > 0 && (
                    <span className="text-green-600">
                      {strings.tag.received}: <MoneyText satang={r.income} className="font-semibold" />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}
