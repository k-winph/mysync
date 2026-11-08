import { describe, it, expect } from 'vitest'
import { rewriteTagName, reorderTag } from './tagOps'

const state = () => ({
  transactions: [
    { id: 't1', tags: ['food', 'treat'] },
    { id: 't2', tags: ['work'] },
    { id: 't3', tags: [] },
    { id: 't4' }, // no tags field
  ],
  debts: [{ id: 'd1', tags: ['food'] }],
  recurringIncomes: [{ id: 'r1', tags: ['work', 'salary'] }],
})

describe('reorderTag', () => {
  const tags = () => [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  it('moves a tag down', () => {
    expect(reorderTag(tags(), 'a', 'down').map((t) => t.id)).toEqual(['b', 'a', 'c'])
  })
  it('moves a tag up', () => {
    expect(reorderTag(tags(), 'c', 'up').map((t) => t.id)).toEqual(['a', 'c', 'b'])
  })
  it('is a no-op at the edges', () => {
    expect(reorderTag(tags(), 'a', 'up')).toEqual(tags())
    expect(reorderTag(tags(), 'c', 'down')).toEqual(tags())
  })
})

describe('rewriteTagName', () => {
  it('renames a tag across transactions, debts and recurring incomes', () => {
    const out = rewriteTagName(state(), 'food', 'groceries')
    expect(out.transactions[0].tags).toEqual(['groceries', 'treat'])
    expect(out.debts[0].tags).toEqual(['groceries'])
    expect(out.recurringIncomes[0].tags).toEqual(['work', 'salary'])
  })

  it('merges into an existing tag without creating duplicates', () => {
    // t1 has both food and treat; rename food -> treat should collapse to one.
    const out = rewriteTagName(state(), 'food', 'treat')
    expect(out.transactions[0].tags).toEqual(['treat'])
  })

  it('removes a tag when `to` is null', () => {
    const out = rewriteTagName(state(), 'work', null)
    expect(out.transactions[1].tags).toEqual([])
    expect(out.recurringIncomes[0].tags).toEqual(['salary'])
  })

  it('leaves items without the tag untouched and tolerates a missing tags field', () => {
    const out = rewriteTagName(state(), 'food', 'groceries')
    expect(out.transactions[1].tags).toEqual(['work'])
    expect(out.transactions[2].tags).toEqual([])
    // An item without the tag is returned untouched (no tags field added).
    expect(out.transactions[3].tags).toBeUndefined()
  })
})
