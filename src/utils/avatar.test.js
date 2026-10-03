import { describe, it, expect } from 'vitest'
import { avatarColor, avatarInitial } from './avatar'

describe('avatarColor', () => {
  it('is deterministic for the same seed', () => {
    expect(avatarColor('abc')).toBe(avatarColor('abc'))
  })
  it('returns a valid hex from the palette', () => {
    expect(avatarColor('person-1')).toMatch(/^#[0-9a-f]{6}$/i)
  })
  it('tolerates empty / nullish seeds', () => {
    expect(avatarColor('')).toMatch(/^#[0-9a-f]{6}$/i)
    expect(avatarColor(undefined)).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('avatarInitial', () => {
  it('uses the first character, uppercased', () => {
    expect(avatarInitial('alex')).toBe('A')
  })
  it('works with Thai names', () => {
    expect(avatarInitial('เอ')).toBe('เ')
  })
  it('trims whitespace', () => {
    expect(avatarInitial('  bea')).toBe('B')
  })
  it('falls back to "?" when empty', () => {
    expect(avatarInitial('')).toBe('?')
    expect(avatarInitial('   ')).toBe('?')
    expect(avatarInitial(undefined)).toBe('?')
  })
})
