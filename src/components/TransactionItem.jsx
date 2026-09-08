import { useStore } from '../store/useStore'
import { formatDateShort } from '../utils/date'
import MoneyText from './MoneyText'
import CategoryIcon from './CategoryIcon'

// A single transaction row. Tap the row to edit; the amount is color-coded
// green (income) / red (expense).
export default function TransactionItem({ tx, onEdit }) {
  const category = useStore((s) => s.categories.find((c) => c.id === tx.categoryId))
  const isIncome = tx.type === 'income'

  return (
    <button
      onClick={() => onEdit(tx)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left
        transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: category?.color || '#64748b' }}
      >
        <CategoryIcon name={category?.icon} size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">
            {category?.name || 'Uncategorized'}
          </span>
        </div>
        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
          {formatDateShort(tx.date)}
          {tx.note ? ` · ${tx.note}` : ''}
          {tx.tags?.length ? ` · ${tx.tags.map((t) => '#' + t).join(' ')}` : ''}
        </div>
      </div>

      <MoneyText
        satang={tx.amount}
        className={`shrink-0 font-semibold ${
          isIncome ? 'text-green-600' : 'text-red-600'
        }`}
      />
    </button>
  )
}
