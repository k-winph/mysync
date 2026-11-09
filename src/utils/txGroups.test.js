import { describe, it, expect } from 'vitest'
import { groupDaySplits } from './txGroups'

describe('groupDaySplits', () => {
  it('collapses split portions into one group and keeps order', () => {
    const items = [
      { id: 'a', amount: 100, type: 'expense' },
      { id: 'b', amount: 300, type: 'expense', splitGroupId: 'g1', note: 'market', tags: ['x'], date: '2026-11-08', categoryId: 'food' },
      { id: 'c', amount: 200, type: 'expense', splitGroupId: 'g1', note: 'market', date: '2026-11-08', categoryId: 'home' },
      { id: 'd', amount: 45, type: 'expense' },
    ]
    const out = groupDaySplits(items)
    expect(out.map((x) => x.__group ? `grp:${x.total}` : x.id)).toEqual(['a', 'grp:500', 'd'])
    const grp = out[1]
    expect(grp.parts).toHaveLength(2)
    expect(grp.rep.id).toBe('b')
    expect(grp.note).toBe('market')
  })

  it('unwraps a group that has only one portion present (e.g. filtered)', () => {
    const items = [{ id: 'b', amount: 300, splitGroupId: 'g1', type: 'expense' }]
    const out = groupDaySplits(items)
    expect(out).toHaveLength(1)
    expect(out[0].__group).toBeUndefined()
    expect(out[0].id).toBe('b')
  })

  it('merges non-adjacent portions of the same group at the first position', () => {
    const items = [
      { id: 'b', splitGroupId: 'g1', amount: 300, type: 'expense' },
      { id: 'x', amount: 10, type: 'expense' },
      { id: 'c', splitGroupId: 'g1', amount: 200, type: 'expense' },
    ]
    const out = groupDaySplits(items)
    expect(out).toHaveLength(2)
    expect(out[0].__group).toBe(true)
    expect(out[0].total).toBe(500)
    expect(out[1].id).toBe('x')
  })

  it('leaves plain transactions untouched', () => {
    const items = [{ id: 'a', amount: 100, type: 'income' }]
    expect(groupDaySplits(items)).toEqual(items)
  })
})
