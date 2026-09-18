export const BUDGET_OPTIONS = [
  ['50-500', '50–500 тыс. ₽'],
  ['501-1000', '501 тыс.–1 млн ₽'],
  ['1000-plus', 'Более 1 млн ₽'],
]

const hasValue = (value) => Boolean(String(value || '').trim())
const budgetLabels = new Map(BUDGET_OPTIONS)

export const validateLeadForm = (values) => {
  const errors = {}

  if (!hasValue(values.name)) errors.name = 'Укажите имя'
  if (!hasValue(values.phone)) errors.phone = 'Укажите телефон'
  if (!budgetLabels.has(values.budget)) errors.budget = 'Выберите рекламный бюджет'
  if (!values.consent) errors.consent = 'Нужно согласие на обработку данных'

  return errors
}

export const buildLeadPayload = (values) => ({
  name: String(values.name).trim(),
  phone: String(values.phone).trim(),
  budget: budgetLabels.get(values.budget),
  source: 'landing-yandex-direct',
})
