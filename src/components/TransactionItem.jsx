import { useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatDateShort } from '../utils/date'
import { strings } from '../constants/strings'
import MoneyText from './MoneyText'
import CategoryIcon from './CategoryIcon'

const ACTION_W = 144 // two 72px action buttons revealed on swipe

// A single transaction row.
// • read-only (no onEdit): plain row, for view-only lists.
// • onEdit only: tap to edit (e.g. dashboard "recent").
// • onEdit + onDelete: tap to edit, swipe left to reveal Edit / Delete.
// The amount is color-coded green (income) / red (expense).
export default function TransactionItem({ tx, onEdit, onDelete }) {
  const category = useStore((s) => s.categories.find((c) => c.id === tx.categoryId))
  const isIncome = tx.type === 'income'

  // Swipe state (only used in the swipeable variant; hooks stay unconditional).
  const [dx, setDx] = useState(0)
  const start = useRef({ x: 0, y: 0 })
  const base = useRef(0)
  const axis = useRef(null) // 'h' | 'v' | null
  const moved = useRef(false)

  const inner = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: category?.color || '#64748b' }}
      >
        <CategoryIcon name={category?.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{category?.name || 'Uncategorized'}</span>
        </div>
        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
          {formatDateShort(tx.date)}
          {tx.note ? ` · ${tx.note}` : ''}
          {tx.tags?.length ? ` · ${tx.tags.map((t) => '#' + t).join(' ')}` : ''}
        </div>
      </div>
      <MoneyText
        satang={tx.amount}
        className={`shrink-0 font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}
      />
    </>
  )

  // Read-only
  if (!onEdit) {
    return <div className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left">{inner}</div>
  }

  // Tap-to-edit only (no swipe)
  if (!onDelete) {
    return (
      <button
        onClick={() => onEdit(tx)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left
          transition hover:bg-slate-100 active:scale-[0.99] dark:hover:bg-slate-800"
      >
        {inner}
      </button>
    )
  }

  // Swipeable (tap = edit; drag left = reveal actions)
  const close = () => {
    setDx(0)
    base.current = 0
  }
  const onDown = (e) => {
    start.current = { x: e.clientX, y: e.clientY }
    axis.current = null
    moved.current = false
  }
  const onMove = (e) => {
    if (e.pointerType === 'mouse' && e.buttons === 0) return
    const ddx = e.clientX - start.current.x
    const ddy = e.clientY - start.current.y
    if (axis.current === null) {
      if (Math.abs(ddx) > 6 || Math.abs(ddy) > 6) {
        axis.current = Math.abs(ddx) > Math.abs(ddy) ? 'h' : 'v'
        if (axis.current === 'h') e.currentTarget.setPointerCapture?.(e.pointerId)
      } else return
    }
    if (axis.current !== 'h') return
    moved.current = true
    setDx(Math.max(-ACTION_W, Math.min(0, base.current + ddx)))
  }
  const onUp = () => {
    if (axis.current === 'h') {
      const open = dx < -ACTION_W / 2
      const v = open ? -ACTION_W : 0
      setDx(v)
      base.current = v
    }
    axis.current = null
  }
  const handleClick = () => {
    if (moved.current) {
      moved.current = false
      return
    }
    if (dx !== 0) {
      close()
      return
    }
    onEdit(tx)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Actions revealed behind the row */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => {
            close()
            onEdit(tx)
          }}
          className="flex w-[72px] flex-col items-center justify-center gap-0.5 bg-slate-500 text-[11px]
            font-semibold text-white transition active:opacity-80"
          aria-label={strings.common.edit}
        >
          <Pencil size={18} /> {strings.common.edit}
        </button>
        <button
          onClick={() => {
            close()
            onDelete(tx)
          }}
          className="flex w-[72px] flex-col items-center justify-center gap-0.5 bg-red-600 text-[11px]
            font-semibold text-white transition active:opacity-80"
          aria-label={strings.common.delete}
        >
          <Trash2 size={18} /> {strings.common.delete}
        </button>
      </div>

      {/* Foreground row */}
      <button
        onClick={handleClick}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          transform: `translateX(${dx}px)`,
          transition: axis.current === 'h' ? 'none' : 'transform .2s ease',
          touchAction: 'pan-y',
        }}
        className="relative flex w-full items-center gap-3 rounded-xl bg-white px-2 py-2.5 text-left
          transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        {inner}
      </button>
    </div>
  )
}
