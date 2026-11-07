// Sample data for the opt-in demo mode. Lets a brand-new user see what a
// filled-in MySync looks like, then wipe it in one tap. Everything here is
// built fresh at load time so the dates always land in the current and
// previous month — the demo never looks stale.
//
// Amounts are integer satang (THB) / cents (holdings), matching the store.
import { uuid } from '../utils/id'

const now = () => new Date().toISOString()

// YYYY-MM-DD for `day` of the month that is `monthsAgo` months before today.
// Clamps the day to the target month's length so e.g. day 31 never overflows.
function dayOffset(monthsAgo, day) {
  const base = new Date()
  const d = new Date(base.getFullYear(), base.getMonth() - monthsAgo, 1)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// A date `days` from today (negative = past), as YYYY-MM-DD.
function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Build a complete, self-consistent sample dataset ready for `replaceData`.
export function buildSampleData() {
  const ts = now()
  const stamp = (obj) => ({ id: uuid(), createdAt: ts, updatedAt: ts, ...obj })

  // --- categories (same defaults, but with ids we can reference below) ------
  const catDefs = [
    { key: 'food', name: 'Food', type: 'expense', icon: 'utensils', color: '#f97316' },
    { key: 'transport', name: 'Transport', type: 'expense', icon: 'bus', color: '#0ea5e9' },
    { key: 'shopping', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
    { key: 'bills', name: 'Bills', type: 'expense', icon: 'receipt', color: '#eab308' },
    { key: 'health', name: 'Health', type: 'expense', icon: 'heart-pulse', color: '#ef4444' },
    { key: 'fun', name: 'Entertainment', type: 'expense', icon: 'gamepad-2', color: '#8b5cf6' },
    { key: 'home', name: 'Home', type: 'expense', icon: 'house', color: '#14b8a6' },
    { key: 'other', name: 'Other', type: 'expense', icon: 'ellipsis', color: '#64748b' },
    { key: 'salary', name: 'Salary', type: 'income', icon: 'wallet', color: '#22c55e' },
    { key: 'bonus', name: 'Bonus', type: 'income', icon: 'gift', color: '#10b981' },
    { key: 'invest', name: 'Investment', type: 'income', icon: 'trending-up', color: '#0d9488' },
    { key: 'otherInc', name: 'Other Income', type: 'income', icon: 'circle-plus', color: '#84cc16' },
  ]
  const categories = catDefs.map((c) => stamp({ name: c.name, type: c.type, icon: c.icon, color: c.color, isDefault: true }))
  const cat = {}
  catDefs.forEach((c, i) => { cat[c.key] = categories[i].id })

  // --- tags -----------------------------------------------------------------
  const tagNames = ['essential', 'treat', 'work', 'coffee']
  const tags = tagNames.map((name) => stamp({ name }))

  // --- transactions ---------------------------------------------------------
  // B(aht) -> satang helper.
  const B = (baht) => Math.round(baht * 100)
  const tx = (type, baht, categoryId, note, date, txTags = []) =>
    stamp({ type, amount: B(baht), categoryId, note, date, tags: txTags })

  const transactions = [
    // This month — income
    tx('income', 45000, cat.salary, 'Monthly salary', dayOffset(0, 1), ['work']),
    tx('income', 6500, cat.otherInc, 'Freelance project', dayOffset(0, 12), ['work']),
    // This month — expenses
    tx('expense', 120, cat.food, 'Lunch', dayOffset(0, 2), ['essential']),
    tx('expense', 90, cat.food, 'Coffee', dayOffset(0, 3), ['coffee', 'treat']),
    tx('expense', 850, cat.food, 'Groceries', dayOffset(0, 5), ['essential']),
    tx('expense', 45, cat.transport, 'BTS', dayOffset(0, 5)),
    tx('expense', 599, cat.bills, 'Internet', dayOffset(0, 6), ['essential']),
    tx('expense', 419, cat.fun, 'Netflix', dayOffset(0, 7), ['treat']),
    tx('expense', 1000, cat.transport, 'Fuel', dayOffset(0, 8)),
    tx('expense', 790, cat.shopping, 'New shirt', dayOffset(0, 9), ['treat']),
    tx('expense', 250, cat.health, 'Pharmacy', dayOffset(0, 10)),
    tx('expense', 450, cat.food, 'Dinner with friends', dayOffset(0, 11), ['treat']),
    // Last month — a fuller picture for the trend view
    tx('income', 45000, cat.salary, 'Monthly salary', dayOffset(1, 1), ['work']),
    tx('income', 10000, cat.bonus, 'Quarterly bonus', dayOffset(1, 15)),
    tx('expense', 1200, cat.bills, 'Electricity', dayOffset(1, 6), ['essential']),
    tx('expense', 399, cat.bills, 'Phone', dayOffset(1, 6), ['essential']),
    tx('expense', 2300, cat.shopping, 'Shoes', dayOffset(1, 14), ['treat']),
    tx('expense', 300, cat.fun, 'Cinema', dayOffset(1, 18), ['treat']),
    tx('expense', 680, cat.food, 'Groceries', dayOffset(1, 20), ['essential']),
    tx('expense', 90, cat.food, 'Coffee', dayOffset(1, 22), ['coffee', 'treat']),
  ]

  // --- debts ----------------------------------------------------------------
  const debts = [
    stamp({
      kind: 'recurring', creditor: 'Apartment rent', amount: B(8500),
      dueDate: daysFromNow(4), isPaid: false, frequency: 'monthly',
      totalInstallments: 0, paidInstallments: 0, categoryId: cat.home, tags: ['essential'],
      paidTxId: null, note: '',
    }),
    stamp({
      kind: 'installment', creditor: 'Car loan', amount: B(9900),
      dueDate: daysFromNow(12), isPaid: false, frequency: 'monthly',
      totalInstallments: 48, paidInstallments: 12, categoryId: cat.transport, tags: [],
      paidTxId: null, note: 'Honda City',
    }),
    stamp({
      kind: 'once', creditor: 'Loan from Nin', amount: B(2000),
      dueDate: daysFromNow(9), isPaid: false, frequency: 'monthly',
      totalInstallments: 0, paidInstallments: 0, categoryId: cat.other, tags: [],
      paidTxId: null, note: 'Dinner split',
    }),
  ]

  // --- savings goals --------------------------------------------------------
  const savingsGoals = [
    stamp({ name: 'Emergency fund', targetAmount: B(100000), currentAmount: B(35000), deadline: null }),
    stamp({ name: 'Japan trip', targetAmount: B(60000), currentAmount: B(18000), deadline: daysFromNow(150) }),
  ]

  // --- investments ----------------------------------------------------------
  const pf = stamp({ name: 'Long-term stocks', type: 'stock', note: '' })
  const portfolios = [pf]
  // avgCost / lastPrice are in cents; currency USD (prices come from the API).
  const holdings = [
    stamp({ portfolioId: pf.id, symbol: 'AAPL', shares: 5, avgCost: 18000, currency: 'USD', lastPrice: 21500, lastChangeCents: 120, lastChangePct: 0.56, lastPriceAt: ts }),
    stamp({ portfolioId: pf.id, symbol: 'MSFT', shares: 3, avgCost: 32000, currency: 'USD', lastPrice: 41000, lastChangeCents: -230, lastChangePct: -0.56, lastPriceAt: ts }),
  ]

  return { transactions, categories, tags, debts, portfolios, holdings, savingsGoals }
}
