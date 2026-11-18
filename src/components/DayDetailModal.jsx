import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate } from '../utils/date'
import Modal from './ui/Modal'
import MoneyText from './MoneyText'
import TransactionItem from './TransactionItem'

// Read-only popup listing one day's transactions, with that day's income /
// expense / net. Opened from the spending calendar.
export default function DayDetailModal({ open, date, onClose }) {
  const transactions = useStore((s) => s.transactions)
  const currency = useStore((s) => s.settings.primaryCurrency)

  const { items, income, expense } = useMemo(() => {
    if (!date) return { items: [], income: 0, expense: 0 }
    const items = transactions
      .filter((t) => t.date === date)
      .sort((a, b) => ((a.createdAt || '') < (b.createdAt || '') ? 1 : -1))
    let income = 0
    let expense = 0
    for (const t of items) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { items, income, expense }
  }, [transactions, date])

  const net = income - expense

  return (
    <Modal open={open} onClose={onClose} title={date ? formatDate(date) : ''}>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-canvas p-2.5 text-center dark:bg-surface-2/50">
          <p className="text-[11px] text-green-600">{strings.balance.income}</p>
          <MoneyText satang={income} currency={currency} className="text-sm font-bold" />
        </div>
        <div className="rounded-xl bg-canvas p-2.5 text-center dark:bg-surface-2/50">
          <p className="text-[11px] text-red-600">{strings.balance.expense}</p>
          <MoneyText satang={expense} currency={currency} className="text-sm font-bold" />
        </div>
        <div className="rounded-xl bg-canvas p-2.5 text-center dark:bg-surface-2/50">
          <p className="text-[11px] text-muted">{strings.balance.net}</p>
          <MoneyText
            satang={net}
            currency={currency}
            className={`text-sm font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}
          />
        </div>
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-faint">{strings.spendCal.dayNoTx}</p>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-1 dark:border-line-2 dark:bg-surface">
            {items.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
