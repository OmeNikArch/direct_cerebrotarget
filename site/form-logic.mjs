import { isRussianPhoneComplete, normalizeRussianPhone } from './phone-input.mjs'

export const BUDGET_OPTIONS = [
  ['50-500', '50–500 тыс. ₽'],
  ['501-1000', '501 тыс.–1 млн ₽'],
  ['1000-plus', 'Более 1 млн ₽'],
]
export const AUDIT_REQUEST_TYPE = 'Разовый аудит рекламы'

const hasValue = (value) => Boolean(String(value || '').trim())
const budgetLabels = new Map(BUDGET_OPTIONS)

export const validateLeadForm = (values) => {
  const errors = {}

  if (!hasValue(values.name)) errors.name = 'Укажите имя'
  if (!hasValue(values.phone)) errors.phone = 'Укажите телефон'
  else if (!isRussianPhoneComplete(values.phone)) errors.phone = 'Введите номер полностью'
  if (values.requestType !== AUDIT_REQUEST_TYPE && !budgetLabels.has(values.budget)) errors.budget = 'Выберите рекламный бюджет'
  if (!values.privacyConsent) errors.privacyConsent = 'Подтвердите согласие с политикой конфиденциальности'
  if (!values.personalDataConsent) errors.personalDataConsent = 'Нужно согласие на обработку персональных данных'

  return errors
}

export const buildLeadPayload = (values) => ({
  name: String(values.name).trim(),
  phone: normalizeRussianPhone(values.phone),
  ...(values.requestType ? { requestType: values.requestType } : {}),
  ...(budgetLabels.has(values.budget) ? { budget: budgetLabels.get(values.budget) } : {}),
  source: 'landing-yandex-direct',
})
