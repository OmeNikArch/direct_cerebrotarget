// Подписи совпадают с фронтом лендинга: site/form-logic.mjs (BUDGET_OPTIONS) и site/quiz.mjs (quizSteps).

// Бюджет контактной формы: фронт присылает уже подпись.
export const CONTACT_BUDGETS = ['50–500 тыс. ₽', '501 тыс.–1 млн ₽', 'Более 1 млн ₽'] as const

// Бюджет квиза: фронт присылает value — переводим в подпись.
export const QUIZ_BUDGET_LABELS: Record<string, string> = {
  '100-500': '100–500 тыс. ₽',
  '501-1000': '501 тыс.–1 млн ₽',
  '1000-plus': 'Более 1 млн ₽',
  calculate: 'Нужен расчёт',
}

export const REQUEST_TYPES = {
  consult: 'Консультация по ведению рекламы',
  audit: 'Разовый аудит рекламы',
  quiz: 'Бесплатный медиаплан (квиз)',
} as const

export const FORM_TYPES = [
  { label: 'Контактная форма', value: 'contact' },
  { label: 'Квиз медиаплана', value: 'quiz' },
] as const

export const LEAD_STATUSES = [
  { label: 'Новая (не отправлена)', value: 'pending' },
  { label: 'Отправлена в Битрикс24', value: 'sent' },
  { label: 'Ошибка отправки', value: 'failed' },
  { label: 'Интеграция выключена', value: 'skipped' },
] as const

export const PROCESSING_STATUSES = [
  { label: 'Новая', value: 'new' },
  { label: 'В работе', value: 'in_progress' },
  { label: 'Обработана', value: 'done' },
  { label: 'Спам / дубль', value: 'spam' },
] as const
