import { describe, expect, test } from 'vitest'
import { safeJsonParse } from './safeJson.js'

describe('Safe JSON Parser', () => {
  test('successfully parses valid JSON strings', () => {
    const valid = '{"ok": true, "items": [1, 2]}'
    const result = safeJsonParse(valid)
    expect(result).toEqual({ ok: true, items: [1, 2] })
  })

  test('successfully extracts and parses nested JSON blocks', () => {
    const text = 'Leading text {"nested": "value", "list": [1]} trailing text'
    const result = safeJsonParse(text)
    expect(result).toEqual({ nested: 'value', list: [1] })
  })

  test('returns null when no JSON brackets are present', () => {
    const text = 'no brackets in this text'
    const result = safeJsonParse(text)
    expect(result).toBeNull()
  })

  test('returns null when brackets exist but contain malformed syntax', () => {
    const text = 'Leading {invalid: true} trailing' // keys must be double-quoted in JSON
    const result = safeJsonParse(text)
    expect(result).toBeNull()
  })
})
