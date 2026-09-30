import test from 'node:test'
import assert from 'node:assert/strict'
import { BUDGET_OPTIONS, buildLeadPayload, validateLeadForm } from './form-logic.mjs'

const baseLead = {
  name: 'Анна',
  phone: '+7 999 123-45-67',
  budget: '50-500',
  privacyConsent: true,
  personalDataConsent: true,
}

test('accepts the project lead after both required legal consents', () => {
  assert.deepEqual(validateLeadForm(baseLead), {})
})

test('accepts a standalone audit request without an advertising budget and preserves its CRM intent', () => {
  const auditLead = {
    name: 'Иван',
    phone: '+7 999 765-43-21',
    budget: '',
    requestType: 'Разовый аудит рекламы',
    privacyConsent: true,
    personalDataConsent: true,
  }

  assert.deepEqual(validateLeadForm(auditLead), {})
  assert.deepEqual(buildLeadPayload(auditLead), {
    name: 'Иван',
    phone: '+7 999 765-43-21',
    requestType: 'Разовый аудит рекламы',
    source: 'landing-yandex-direct',
  })
})

test('requires the lead identity, supported budget and each legal consent', () => {
  assert.deepEqual(validateLeadForm({ name: ' ', phone: '', budget: 'unknown', privacyConsent: false, personalDataConsent: false }), {
    name: 'Укажите имя',
    phone: 'Укажите телефон',
    budget: 'Выберите рекламный бюджет',
    privacyConsent: 'Подтвердите согласие с политикой конфиденциальности',
    personalDataConsent: 'Нужно согласие на обработку персональных данных',
  })
})

test('exposes the approved advertising budget choices', () => {
  assert.deepEqual(BUDGET_OPTIONS, [
    ['50-500', '50–500 тыс. ₽'],
    ['501-1000', '501 тыс.–1 млн ₽'],
    ['1000-plus', 'Более 1 млн ₽'],
  ])
})

test('builds a minimal Bitrix-ready lead payload without quiz fields', () => {
  assert.deepEqual(buildLeadPayload({ ...baseLead, site: 'https://example.ru' }), {
    name: 'Анна',
    phone: '+7 999 123-45-67',
    budget: '50–500 тыс. ₽',
    source: 'landing-yandex-direct',
  })
})
