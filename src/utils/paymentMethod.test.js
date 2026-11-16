import { describe, it, expect } from 'vitest'
import { defaultMethodId, methodById, reorderMethod } from './paymentMethod'

const methods = [
  { id: 'a', name: 'Cash', key: 'cash' },
  { id: 'b', name: 'Transfer', key: 'transfer', isDefaultPick: true },
  { id: 'c', name: 'Credit card', key: 'credit' },
]

describe('defaultMethodId', () => {
  it('prefers the isDefaultPick method', () => {
    expect(defaultMethodId(methods)).toBe('b')
  })
  it('falls back to the first when none is flagged', () => {
    expect(defaultMethodId([{ id: 'x' }, { id: 'y' }])).toBe('x')
  })
  it('returns empty string for an empty/invalid list', () => {
    expect(defaultMethodId([])).toBe('')
    expect(defaultMethodId(undefined)).toBe('')
  })
})

describe('methodById', () => {
  it('finds a method, and is null-safe', () => {
    expect(methodById(methods, 'c').name).toBe('Credit card')
    expect(methodById(methods, 'nope')).toBeNull()
    expect(methodById(methods, '')).toBeNull()
  })
})

describe('reorderMethod', () => {
  it('moves up and down, and no-ops at the edges', () => {
    expect(reorderMethod(methods, 'b', 'up').map((m) => m.id)).toEqual(['b', 'a', 'c'])
    expect(reorderMethod(methods, 'b', 'down').map((m) => m.id)).toEqual(['a', 'c', 'b'])
    expect(reorderMethod(methods, 'a', 'up')).toBe(methods) // already first
    expect(reorderMethod(methods, 'c', 'down')).toBe(methods) // already last
  })
})
