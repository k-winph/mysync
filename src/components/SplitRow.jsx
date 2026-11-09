import { useState } from 'react'
import { Layers, ChevronDown, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDateShort } from '../utils/date'
import MoneyText from './MoneyText'
import CategoryIcon from './CategoryIcon'

// One collapsed row for a split purchase (several categories, one buy). Tapping
// expands to show each portion; "edit" opens the whole group in the form.
// `group` is the shape produced by utils/txGroups.groupDaySplits.
export default function SplitRow({ group, onEdit }) {
  const categories = useStore((s) => s.categories)
  const [open, setOpen] = useState(false)

  const catOf = (id) => categories.find((c) => c.id === id)
  const isIncome = group.type === 'income'
  const names = group.parts.map((p) => catOf(p.categoryId)?.name || strings.month.other)
  const colorA = catOf(group.parts[0]?.categoryId)?.color || '#64748b'
  const colorB = catOf(group.parts[1]?.categoryId)?.color || '#94a3b8'

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-2 py-2.5 text-left">
        {/* Split icon: two category colors + layers glyph */}
        <span
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: `linear-gradient(135deg, ${colorA} 50%, ${colorB} 50%)` }}
        >
          <Layers size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{group.note || strings.tx.splitTitle(group.parts.length)}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">{formatDateShort(group.date)} · {names.join(', ')}</span>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-300">
              <Layers size={10} /> {strings.tx.splitBadge(group.parts.length)}
            </span>
          </div>
        </div>
        <MoneyText
          satang={group.total}
          className={`shrink-0 font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}
        />
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mb-1 ml-4 space-y-1 border-l-2 border-slate-100 pl-3 dark:border-slate-800">
          {group.parts.map((p) => {
            const c = catOf(p.categoryId)
            return (
              <div key={p.id} className="flex items-center gap-2.5 py-1">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: c?.color || '#64748b' }}
                >
                  <CategoryIcon name={c?.icon} size={12} />
                </span>
                <span className="flex-1 truncate text-sm">{c?.name || strings.month.other}</span>
                <MoneyText satang={p.amount} className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            )
          })}
          <button
            onClick={() => onEdit(group.rep)}
            className="mt-1 flex items-center gap-1.5 py-1 text-sm font-medium text-brand-600"
          >
            <Pencil size={14} /> {strings.common.edit}
          </button>
        </div>
      )}
    </div>
  )
}
