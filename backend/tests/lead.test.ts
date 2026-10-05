import { describe, expect, it } from 'vitest'
import { normalizePhone, parseLead, sourceFromReferer } from '@/lib/lead'
import { buildComments, buildTitle, normalizeBase } from '@/lib/bitrix'

// Ровно то, что шлёт site/form-logic.mjs → buildLeadPayload
const contactPayload = {
  name: 'Иван',
  phone: '+79991234567',
  requestType: 'Консультация по ведению рекламы',
  budget: '501 тыс.–1 млн ₽',
  source: 'landing-yandex-direct',
}

// Ровно то, что шлёт site/quiz.mjs (все [name] формы квиза, отмеченные чекбоксы = "on")
const quizPayload = {
  name: 'Анна',
  phone: '+79001112233',
  site: 'https://example.ru',
  quizBusiness: 'Интернет-магазин',
  quizGeography: 'По всей России',
  quizGoal: 'Больше заявок',
  quizSituation: 'Ещё не запускали',
  quizBudget: '100-500',
  privacyConsent: 'on',
  personalDataConsent: 'on',
}

describe('parseLead', () => {
  it('принимает контактную форму', () => {
    const r = parseLead(contactPayload)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.lead).toMatchObject({
      formType: 'contact',
      requestType: 'Консультация по ведению рекламы',
      budget: '501 тыс.–1 млн ₽',
      phone: '+79991234567',
      landingSource: 'landing-yandex-direct',
    })
  })

  it('аудит без бюджета', () => {
    const r = parseLead({ name: 'Олег', phone: '+79991234567', requestType: 'Разовый аудит рекламы', source: 'landing-yandex-direct' })
    expect(r.ok).toBe(true)
  })

  it('консультация без бюджета — ошибка', () => {
    const r = parseLead({ ...contactPayload, budget: undefined })
    expect(r).toEqual({ ok: false, errors: { budget: 'Выберите рекламный бюджет' } })
  })

  it('квиз: ответы и подпись бюджета', () => {
    const r = parseLead(quizPayload)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.lead.formType).toBe('quiz')
    expect(r.lead.requestType).toBe('Бесплатный медиаплан (квиз)')
    expect(r.lead.quiz).toEqual({
      business: 'Интернет-магазин',
      geography: 'По всей России',
      goal: 'Больше заявок',
      situation: 'Ещё не запускали',
      budget: '100–500 тыс. ₽',
    })
    expect(r.lead.privacyConsent).toBe(true)
    expect(r.lead.site).toBe('https://example.ru')
  })

  it('квиз без сайта', () => {
    expect(parseLead({ ...quizPayload, site: '' }).ok).toBe(true)
  })

  it('отклоняет пустое имя, кривой телефон, мусор', () => {
    expect(parseLead({ ...contactPayload, name: ' ', phone: '123' })).toEqual({
      ok: false,
      errors: { name: 'Укажите имя', phone: 'Введите номер полностью' },
    })
    expect(parseLead(null).ok).toBe(false)
    expect(parseLead([1]).ok).toBe(false)
    expect(parseLead({ ...contactPayload, requestType: 'Взлом' }).ok).toBe(false)
  })

  it('обрезает длинные строки', () => {
    const r = parseLead({ ...contactPayload, name: 'x'.repeat(5000) })
    expect(r.ok && r.lead.name.length).toBe(100)
  })
})

describe('normalizePhone', () => {
  it.each([
    ['+7 (999) 123-45-67', '+79991234567'],
    ['89991234567', '+79991234567'],
    ['9991234567', '+79991234567'],
    ['+1 555 123', null],
  ])('%s → %s', (input, out) => expect(normalizePhone(input)).toBe(out))
})

describe('sourceFromReferer', () => {
  it('достаёт UTM и yclid', () => {
    const s = sourceFromReferer('https://direct.cerebrotarget.ru/?utm_source=yandex_direct&utm_campaign=brand&yclid=123')
    expect(s).toMatchObject({ utmSource: 'yandex_direct', utmCampaign: 'brand', yclid: '123' })
  })
  it('переживает пустой и битый referer', () => {
    expect(sourceFromReferer(null).utmSource).toBe('')
    expect(sourceFromReferer('не url').page).toBe('не url')
  })
})

describe('Битрикс24', () => {
  it('нормализует вебхук', () => {
    expect(normalizeBase('https://x.bitrix24.ru/rest/1/abc/crm.lead.add.json')).toBe('https://x.bitrix24.ru/rest/1/abc/')
    expect(normalizeBase('https://x.bitrix24.ru/rest/1/abc')).toBe('https://x.bitrix24.ru/rest/1/abc/')
  })
  it('заголовок и комментарий квиза', () => {
    const r = parseLead(quizPayload)
    if (!r.ok) throw new Error('parse')
    const lead = { ...r.lead, sourceLabel: 'Яндекс Директ', source: { utmCampaign: 'brand' } }
    expect(buildTitle(lead)).toBe('Лендинг Директ: Бесплатный медиаплан (квиз) — Анна')
    const c = buildComments(lead)
    expect(c).toContain('Ответы квиза:')
    expect(c).toContain('• География: По всей России')
    expect(c).toContain('Источник: Яндекс Директ')
    expect(c).toContain('Кампания: brand')
  })
})
