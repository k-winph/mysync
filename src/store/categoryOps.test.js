import { describe, it, expect } from 'vitest'
import { reassignCategory, categoryUsage, reorderCategory } from './categoryOps'

const state = () => ({
  transactions: [
    { id: 't1', categoryId: 'food' },
    { id: 't2', categoryId: 'food' },
    { id: 't3', categoryId: 'fun' },
    { id: 't4', categoryId: '' },
  ],
  debts: [{ id: 'd1', categoryId: 'food' }],
  recurringIncomes: [{ id: 'r1', categoryId: 'salary' }],
})

describe('reassignCategory', () => {
  it('moves every reference from one category to another', () => {
    const out = reassignCategory(state(), 'food', 'groceries')
    expect(out.transactions.map((t) => t.categoryId)).toEqual(['groceries', 'groceries', 'fun', ''])
    expect(out.debts[0].categoryId).toBe('groceries')
    expect(out.recurringIncomes[0].categoryId).toBe('salary')
  })

  it('clears the reference when target is null (uncategorized)', () => {
    const out = reassignCategory(state(), 'food', null)
    expect(out.transactions[0].categoryId).toBe('')
    expect(out.debts[0].categoryId).toBe('')
  })

  it('leaves unrelated items untouched', () => {
    const out = reassignCategory(state(), 'food', 'groceries')
    expect(out.transactions[2].categoryId).toBe('fun')
    expect(out.transactions[3].categoryId).toBe('')
  })
})

describe('reorderCategory', () => {
  // Order within a type: a, b, c are expense; x is income (ignored for moves).
  const cats = () => [
    { id: 'a', type: 'expense' },
    { id: 'x', type: 'income' },
    { id: 'b', type: 'expense' },
    { id: 'c', type: 'expense', pinned: true },
  ]

  it('moves an expense category down past the income one (same-type peers only)', () => {
    const out = reorderCategory(cats(), 'a', 'down')
    expect(out.map((c) => c.id)).toEqual(['b', 'x', 'a', 'c']) // a <-> b swapped
  })

  it('moves up within the same type', () => {
    const out = reorderCategory(cats(), 'b', 'up')
    expect(out.map((c) => c.id)).toEqual(['b', 'x', 'a', 'c'])
  })

  it('does not move a pinned item into the unpinned group', () => {
    // c is the only pinned expense → no peer to swap with.
    expect(reorderCategory(cats(), 'c', 'up')).toEqual(cats())
  })

  it('returns the original array at the edge of the group', () => {
    expect(reorderCategory(cats(), 'a', 'up')).toEqual(cats())
  })
})

describe('categoryUsage', () => {
  it('counts references across transactions, debts and recurring incomes', () => {
    const counts = categoryUsage(state())
    expect(counts.food).toBe(3) // 2 transactions + 1 debt
    expect(counts.fun).toBe(1)
    expect(counts.salary).toBe(1)
    expect(counts['']).toBeUndefined() // blank is not counted
  })
})
