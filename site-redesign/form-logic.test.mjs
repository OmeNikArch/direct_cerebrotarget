import test from 'node:test'
import assert from 'node:assert/strict'
import { BUDGET_OPTIONS, buildLeadPayload, validateLeadForm } from './form-logic.mjs'

const baseLead = {
  name: 'Анна',
  phone: '+7 999 123-45-67',
  budget: '50-500',
  consent: true,
}

test('accepts the three-field project lead with consent', () => {
  assert.deepEqual(validateLeadForm(baseLead), {})
})

test('requires the lead identity, supported budget and consent', () => {
  assert.deepEqual(validateLeadForm({ name: ' ', phone: '', budget: 'unknown', consent: false }), {
    name: 'Укажите имя',
    phone: 'Укажите телефон',
    budget: 'Выберите рекламный бюджет',
    consent: 'Нужно согласие на обработку данных',
  })
})

test('exposes the approved advertising budget choices', () => {
  assert.deepEqual(BUDGET_OPTIONS, [
    ['50-500', '50–500 тыс. ₽'],
    ['501-1000', '501 тыс.–1 млн ₽'],
    ['1000-plus', 'Более 1 млн ₽'],
  ])
})

test('builds a minimal Bitrix-ready lead payload without removed form fields', () => {
  assert.deepEqual(buildLeadPayload({ ...baseLead, email: 'legacy@example.com' }), {
    name: 'Анна',
    phone: '+7 999 123-45-67',
    budget: '50–500 тыс. ₽',
    source: 'landing-yandex-direct',
  })
})
