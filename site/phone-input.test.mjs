import assert from 'node:assert/strict'
import test from 'node:test'
import { formatRussianPhone, isRussianPhoneComplete, normalizeRussianPhone } from './phone-input.mjs'

test('normalizes common Russian number entry formats to E.164', () => {
  assert.equal(normalizeRussianPhone('8 (999) 123-45-67'), '+79991234567')
  assert.equal(normalizeRussianPhone('+7 999 123 45 67'), '+79991234567')
  assert.equal(normalizeRussianPhone('999 123 45 67'), '+79991234567')
})

test('formats a partial Russian number as it is entered', () => {
  assert.equal(formatRussianPhone('999123'), '+7 (999) 123')
  assert.equal(formatRussianPhone('89991234567'), '+7 (999) 123-45-67')
})

test('accepts only a full Russian mobile-format number', () => {
  assert.equal(isRussianPhoneComplete('+7 (999) 123-45-67'), true)
  assert.equal(isRussianPhoneComplete('+7 (999) 123-45'), false)
  assert.equal(isRussianPhoneComplete(''), false)
})
