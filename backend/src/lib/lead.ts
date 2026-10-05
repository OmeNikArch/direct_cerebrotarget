// Разбор и проверка заявки с лендинга. Чистые функции — покрыты тестами (tests/lead.test.ts).
//
// Контактная форма (#lead-form) шлёт: name, phone, budget?, requestType, source.
// Квиз (#quiz-lead-form) шлёт: name, phone, site, quizBusiness…quizBudget, privacyConsent, personalDataConsent.
import { CONTACT_BUDGETS, QUIZ_BUDGET_LABELS, REQUEST_TYPES } from './constants'

export type ParsedLead = {
  formType: 'contact' | 'quiz'
  requestType: string
  name: string
  phone: string
  budget?: string
  site?: string
  quiz?: {
    business?: string
    geography?: string
    goal?: string
    situation?: string
    budget?: string
  }
  privacyConsent: boolean
  personalDataConsent: boolean
  landingSource?: string
}

export type ParseResult = { ok: true; lead: ParsedLead } | { ok: false; errors: Record<string, string> }

const str = (v: unknown, max = 200): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : ''

const checked = (v: unknown) => v === true || v === 'on' || v === 'true' || v === '1'

// Фронт уже нормализует номер в +7XXXXXXXXXX; на сервере принимаем и 8XXXXXXXXXX / 7XXXXXXXXXX.
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('9')) return `+7${digits}`
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) return `+7${digits.slice(1)}`
  return null
}

export function parseLead(body: unknown): ParseResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: { body: 'Ожидается JSON-объект' } }
  }
  const b = body as Record<string, unknown>
  const errors: Record<string, string> = {}

  const name = str(b.name, 100)
  if (!name) errors.name = 'Укажите имя'

  const phone = normalizePhone(str(b.phone, 40))
  if (!phone) errors.phone = 'Введите номер полностью'

  const isQuiz = ['quizBusiness', 'quizGeography', 'quizGoal', 'quizSituation', 'quizBudget'].some((k) => k in b)

  const site = str(b.site, 300) || undefined
  if (site && !/^https?:\/\/\S+$/i.test(site) && !/^[\w.-]+\.[a-zа-яё]{2,}(\/\S*)?$/i.test(site)) {
    errors.site = 'Некорректная ссылка'
  }

  let requestType: string
  let budget: string | undefined
  let quiz: ParsedLead['quiz']

  if (isQuiz) {
    requestType = REQUEST_TYPES.quiz
    const quizBudgetRaw = str(b.quizBudget, 50)
    quiz = {
      business: str(b.quizBusiness) || undefined,
      geography: str(b.quizGeography) || undefined,
      goal: str(b.quizGoal) || undefined,
      situation: str(b.quizSituation) || undefined,
      budget: QUIZ_BUDGET_LABELS[quizBudgetRaw] || quizBudgetRaw || undefined,
    }
    budget = quiz.budget
  } else {
    requestType = str(b.requestType, 100) || REQUEST_TYPES.consult
    if (requestType !== REQUEST_TYPES.consult && requestType !== REQUEST_TYPES.audit) {
      errors.requestType = 'Неизвестный тип заявки'
    }
    budget = str(b.budget, 50) || undefined
    if (requestType !== REQUEST_TYPES.audit && !CONTACT_BUDGETS.includes(budget as (typeof CONTACT_BUDGETS)[number])) {
      errors.budget = 'Выберите рекламный бюджет'
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors }

  return {
    ok: true,
    lead: {
      formType: isQuiz ? 'quiz' : 'contact',
      requestType,
      name,
      phone: phone as string,
      budget,
      site,
      quiz,
      // Контактная форма проверяет согласия на клиенте и не передаёт их (README лендинга):
      // без галочек она не отправляется, поэтому сам факт заявки = согласия даны.
      privacyConsent: isQuiz ? checked(b.privacyConsent) : true,
      personalDataConsent: isQuiz ? checked(b.personalDataConsent) : true,
      landingSource: str(b.source, 100) || undefined,
    },
  }
}

// UTM и yclid берём из Referer: лендинг шлёт заявку со своей страницы, а при той же origin
// браузер передаёт полный URL вместе с query (?utm_source=…).
export function sourceFromReferer(referer: string | null | undefined) {
  const out = {
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: '',
    yclid: '',
    page: '',
  }
  if (!referer) return out
  try {
    const u = new URL(referer)
    const q = u.searchParams
    out.utmSource = q.get('utm_source') || ''
    out.utmMedium = q.get('utm_medium') || ''
    out.utmCampaign = q.get('utm_campaign') || ''
    out.utmContent = q.get('utm_content') || ''
    out.utmTerm = q.get('utm_term') || ''
    out.yclid = q.get('yclid') || ''
    out.page = referer.slice(0, 500)
  } catch {
    out.page = referer.slice(0, 500)
  }
  return out
}
