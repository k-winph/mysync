import { describe, it, expect } from 'vitest'
import { STORE_VERSION, migratePersisted } from './migrate'

describe('migratePersisted (v1 -> v2 debts)', () => {
  it('maps a recurring debt (recurrence) to kind=recurring', () => {
    const state = { debts: [{ id: 'a', recurrence: 'monthly', amount: 1000 }] }
    const out = migratePersisted(state, 1)
    expect(out.debts[0]).toMatchObject({
      kind: 'recurring',
      frequency: 'monthly',
      totalInstallments: 0,
      paidInstallments: 0,
    })
  })

  it('maps a non-recurring debt to kind=once', () => {
    const state = { debts: [{ id: 'b', recurrence: 'none' }, { id: 'c' }] }
    const out = migratePersisted(state, 1)
    expect(out.debts[0].kind).toBe('once')
    expect(out.debts[1].kind).toBe('once')
    expect(out.debts[1].frequency).toBe('monthly')
  })

  it('never overwrites a kind that is already set', () => {
    const state = { debts: [{ id: 'd', kind: 'installment', recurrence: 'monthly' }] }
    const out = migratePersisted(state, 1)
    expect(out.debts[0].kind).toBe('installment')
  })

  it('does nothing when the saved version is already current', () => {
    const state = { debts: [{ id: 'e', recurrence: 'monthly' }] }
    const out = migratePersisted(state, STORE_VERSION)
    expect(out.debts[0].kind).toBeUndefined()
  })

  it('tolerates missing state / debts', () => {
    expect(migratePersisted(null, 1)).toBeNull()
    expect(migratePersisted({}, 1)).toEqual({})
  })
})
