import { describe, it, expect } from 'vitest'
import { reassignCategory, categoryUsage } from './categoryOps'

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

describe('categoryUsage', () => {
  it('counts references across transactions, debts and recurring incomes', () => {
    const counts = categoryUsage(state())
    expect(counts.food).toBe(3) // 2 transactions + 1 debt
    expect(counts.fun).toBe(1)
    expect(counts.salary).toBe(1)
    expect(counts['']).toBeUndefined() // blank is not counted
  })
})
